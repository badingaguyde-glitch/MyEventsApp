const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const User = require('../models/User');
const client = require('../config/redis');
const cache = require('../middleware/cache');
const { publishToQueue } = require('../config/rabbitmq');
const PDFDocument = require('pdfkit');
const qrcode = require('qrcode');
const axios = require('axios');




const buyTicket = async (req, res) => {
    try {
        const { eventId, price, userId, user: bodyUserId, clientType } = req.body;
        const targetUserId = userId || bodyUserId || (req.user && req.user.id);

        if (!eventId) {
            return res.status(400).json({ message: 'Event ID required' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.status !== 'active') {
            return res.status(400).json({ message: 'This event is no longer active' });
        }

        const soldTickets = await Ticket.countDocuments({
            event: eventId,
            status: { $ne: 'cancelled' }
        });

        if (soldTickets >= event.capacity) {
            return res.status(400).json({ message: 'Event is sold out' });
        }

        const existingTicket = await Ticket.findOne({
            event: eventId,
            user: targetUserId,
            status: { $in: ['active', 'pending_payment'] }
        });

        if (existingTicket) {
            return res.status(400).json({
                message: 'You already have an active or pending ticket for this event'
            });
        }

        // On crée le ticket en attente de paiement
        const ticket = await Ticket.create({
            event: eventId,
            user: targetUserId,
            price: price || 0,
            status: 'pending_payment'
        });

        const user = await User.findById(targetUserId);

        // Si le ticket est gratuit (prix = 0), on valide directement sans Stripe
        if (ticket.price === 0) {
            ticket.status = 'active';
            await ticket.save();

            await cache.clearPattern('tickets_*');
            await cache.clearPattern(`user_tickets_${targetUserId}`);
            await cache.clearPattern('ticket_availability_*');
            await cache.clearPattern(`ticket_by_code_*${event._id}*`);
            await cache.clearPattern('events_*');
            await cache.clearPattern('category_events_*');
            await cache.clearPattern('nearby_events_*');
            await cache.clearPattern(`event_details_*${event._id}*`);

            publishToQueue('email_queue', {
                type: 'ticket_purchase_email',
                user: { name: user.name, lastName: user.lastName, email: user.email },
                event: { title: event.title, date: event.date, location: event.location },
                ticket: { id: ticket._id, code: ticket.ticketCode }
            });

            const populatedTicket = await Ticket.findById(ticket._id).populate('event').populate('user', 'name lastName email');
            return res.status(201).json({ message: 'Free ticket acquired successfully', ticket: populatedTicket });
        }

        // Si payant, on redirige vers Stripe
        const { createCheckoutSession } = require('./PaymentControllers');

        const stripeReq = {
            body: {
                // Stripe demande le montant en centimes
                amount: Math.round(ticket.price * 100),
                currency: 'eur',
                name: `Ticket pour : ${event.title}`,
                description: `Entrée pour l'événement du ${new Date(event.date).toLocaleDateString()}`,
                metadata: {
                    type: 'ticket',
                    ticketId: ticket._id.toString(),
                    eventId: event._id.toString(),
                    userId: user._id.toString(),
                    userEmail: user.email,
                    userName: user.name,
                    userLastName: user.lastName,
                    eventTitle: event.title,
                    eventDate: event.date.toString(),
                    eventLocation: JSON.stringify(event.location),
                    ticketCode: ticket.ticketCode,
                    clientType: clientType || 'mobile'
                },
                successUrl: `${req.protocol}://${req.get('host')}/api/payment/success?session_id={CHECKOUT_SESSION_ID}&clientType=${clientType || 'mobile'}`,
                cancelUrl: `${req.protocol}://${req.get('host')}/api/payment/cancel?clientType=${clientType || 'mobile'}`
            }
        };

        const stripeRes = {
            status: (code) => ({
                json: (data) => {
                    if (code !== 200) {
                        return res.status(code).json({
                            message: "Stripe error during ticket purchase",
                            error: data.error || data.message
                        });
                    }
                    publishToQueue('email_queue', {
                        type: 'ticket_pending_email',
                        user: { name: user.name, lastName: user.lastName, email: user.email },
                        event: { title: event.title },
                        receiptUrl: data.url
                    });
                    return res.status(201).json({
                        message: "Ticket en attente de paiement",
                        ticket: ticket,
                        stripeUrl: data.url
                    });
                }
            })
        };

        await createCheckoutSession(stripeReq, stripeRes);

    } catch (error) {
        console.error('Buy ticket error:', error);
        res.status(500).json({ message: 'Server error during ticket purchase', error: error.message });
    }
};





const getUserTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({
            user: req.user.id,
            status: { $ne: 'cancelled' }
        })
            .populate({
                path: 'event',
                populate: {
                    path: 'organizer',
                    select: 'firstName lastName email'
                }
            })
            .sort({ purchaseDate: -1 });


        const ticketsWithInfo = tickets.map(ticket => {
            const event = ticket.event;
            const now = new Date();
            const eventDate = new Date(event.date);

            let eventStatus = 'upcoming';
            if (eventDate < now) {
                eventStatus = 'past';
            } else if (ticket.status === 'used') {
                eventStatus = 'attended';
            }

            return {
                ...ticket.toObject(),
                eventStatus
            };
        });

        res.json(ticketsWithInfo);
    } catch (error) {
        console.error('Get user tickets error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};




const verifyTicket = async (req, res) => {
    try {
        const { eventId, ticketCode } = req.body;

        if (!eventId || !ticketCode) {
            return res.status(400).json({
                message: 'Event ID and ticket code required'
            });
        }


        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }


        const isCoOrganizer = event.coOrganizers && event.coOrganizers.some(coId => coId.toString() === req.user.id);
        if (event.organizer.toString() !== req.user.id && !isCoOrganizer && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Not authorized to verify tickets for this event'
            });
        }


        const ticket = await Ticket.findOne({
            ticketCode: ticketCode.toUpperCase(),
            event: eventId
        }).populate('user', 'firstName lastName email');

        if (!ticket) {
            return res.status(404).json({
                valid: false,
                message: 'Invalid ticket code for this event'
            });
        }


        if (ticket.status === 'used') {
            return res.json({
                valid: false,
                message: 'Ticket has already been used',
                ticket: {
                    ticketCode: ticket.ticketCode,
                    user: ticket.user,
                    checkInTime: ticket.checkInTime
                }
            });
        }

        if (ticket.status === 'cancelled') {
            return res.json({
                valid: false,
                message: 'Ticket has been cancelled',
                ticket: {
                    ticketCode: ticket.ticketCode,
                    user: ticket.user
                }
            });
        }


        const eventDate = new Date(event.date);
        const now = new Date();


        if (eventDate > now) {
            return res.json({
                valid: true,
                message: 'Valid ticket (Event not started yet)',
                ticket: {
                    ticketCode: ticket.ticketCode,
                    user: ticket.user,
                    purchaseDate: ticket.purchaseDate
                }
            });
        }


        ticket.status = 'used';
        ticket.checkInTime = now;
        ticket.checkedInBy = req.user.id;
        await ticket.save();

        await cache.clearPattern('tickets_*');
        await cache.clearPattern(`user_tickets_${ticket.user._id || ticket.user}`);
        await cache.clearPattern(`ticket_by_code_*${ticket.ticketCode}*`);
        await cache.clearPattern('event_participants_*');

        res.json({
            valid: true,
            message: 'Ticket verified and checked in successfully',
            ticket: {
                ticketCode: ticket.ticketCode,
                user: ticket.user,
                checkInTime: ticket.checkInTime
            }
        });
    } catch (error) {
        console.error('Verify ticket error:', error);
        res.status(500).json({
            valid: false,
            message: 'Server error during verification',
            error: error.message
        });
    }
};




const cancelTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.ticketid)
            .populate('event');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }


        if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Not authorized to cancel this ticket'
            });
        }


        if (ticket.status === 'used') {
            return res.status(400).json({
                message: 'Cannot cancel a ticket that has already been used'
            });
        }

        if (ticket.status === 'cancelled') {
            return res.status(400).json({
                message: 'Ticket is already cancelled'
            });
        }


        const eventDate = new Date(ticket.event.date);
        const now = new Date();

        if (eventDate < now) {
            return res.status(400).json({
                message: 'Cannot cancel ticket for past events'
            });
        }

        await ticket.deleteOne();
        await cache.clearPattern('tickets_*');
        await cache.clearPattern(`user_tickets_${req.user.id}`);
        await cache.clearPattern('ticket_availability_*');
        await cache.clearPattern(`ticket_by_code_*${ticket.event._id}*`);
        await cache.clearPattern('events_*');
        await cache.clearPattern('category_events_*');
        await cache.clearPattern('nearby_events_*');
        await cache.clearPattern(`event_details_*${ticket.event._id}*`);

        res.json({
            message: 'Ticket cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel ticket error:', error);
        res.status(500).json({
            message: 'Server error during ticket cancellation',
            error: error.message
        });
    }
};




const getTicketByCode = async (req, res) => {
    try {
        const { code } = req.params;

        const ticket = await Ticket.findOne({ ticketCode: code.toUpperCase() })
            .populate('event')
            .populate('user', 'firstName lastName email');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.json(ticket);
    } catch (error) {
        console.error('Get ticket by code error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};




const checkAvailability = async (req, res) => {
    try {
        const { eventId } = req.params;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const soldTickets = await Ticket.countDocuments({
            event: eventId,
            status: { $ne: 'cancelled' }
        });

        const available = event.capacity - soldTickets;

        res.json({
            eventId: event._id,
            eventTitle: event.title,
            totalCapacity: event.capacity,
            soldTickets,
            availableSpots: available,
            isSoldOut: available <= 0
        });
    } catch (error) {
        console.error('Check availability error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};




const bulkVerifyTickets = async (req, res) => {
    try {
        const { eventId, ticketCodes } = req.body;

        if (!eventId || !ticketCodes || !Array.isArray(ticketCodes)) {
            return res.status(400).json({
                message: 'Event ID and ticket codes array required'
            });
        }


        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const isCoOrganizer = event.coOrganizers && event.coOrganizers.some(coId => coId.toString() === req.user.id);
        if (event.organizer.toString() !== req.user.id && !isCoOrganizer && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Not authorized to verify tickets for this event'
            });
        }

        const results = [];
        const now = new Date();

        for (const code of ticketCodes) {
            const ticket = await Ticket.findOne({
                ticketCode: code.toUpperCase(),
                event: eventId
            }).populate('user', 'firstName lastName email');

            if (!ticket) {
                results.push({
                    ticketCode: code,
                    valid: false,
                    message: 'Invalid ticket code'
                });
                continue;
            }

            if (ticket.status === 'used') {
                results.push({
                    ticketCode: code,
                    valid: false,
                    message: 'Ticket already used',
                    ticket: {
                        user: ticket.user,
                        checkInTime: ticket.checkInTime
                    }
                });
                continue;
            }

            if (ticket.status === 'cancelled') {
                results.push({
                    ticketCode: code,
                    valid: false,
                    message: 'Ticket cancelled',
                    ticket: { user: ticket.user }
                });
                continue;
            }


            ticket.status = 'used';
            ticket.checkInTime = now;
            ticket.checkedInBy = req.user.id;
            await ticket.save();

            results.push({
                ticketCode: code,
                valid: true,
                message: 'Successfully checked in',
                ticket: {
                    user: ticket.user,
                    checkInTime: now
                }
            });
        }

        await cache.clearPattern('tickets_*');
        await cache.clearPattern('user_tickets_*');
        await cache.clearPattern('ticket_by_code_*');
        await cache.clearPattern('event_participants_*');

        res.json({
            totalProcessed: results.length,
            successful: results.filter(r => r.valid).length,
            failed: results.filter(r => !r.valid).length,
            results
        });
    } catch (error) {
        console.error('Bulk verify error:', error);
        res.status(500).json({
            message: 'Server error during bulk verification',
            error: error.message
        });
    }
};

const bulkCancelTickets = async (req, res) => {
    try {
        const userPlan = req.user.plan || 'free';
        if (userPlan !== 'enterprise') {
            return res.status(403).json({
                message: "La gestion de remboursement en masse est réservée exclusivement aux comptes Entreprise."
            });
        }

        const { ticketIds } = req.body;
        if (!ticketIds || !Array.isArray(ticketIds)) {
            return res.status(400).json({
                message: "Veuillez fournir un tableau d'identifiants de tickets (ticketsIds)."
            });
        }

        const result = await Ticket.updateMany(
            { _id: { $in: ticketIds }, status: { $ne: 'cancelled' } },
            { $set: { status: 'cancelled' } }
        );
        res.status(200).json({
            message: "Remboursement/annulation en masse effectuée avec succès.",
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Bulk cancel tickets error:', error);
        res.status(500).json({ message: "Erreur serveur lors de l'annulation en masse." });
    }
};

module.exports = {
    buyTicket,
    getUserTickets,
    verifyTicket,
    cancelTicket,
    getTicketByCode,
    checkAvailability,
    bulkVerifyTickets,
    bulkCancelTickets
};
