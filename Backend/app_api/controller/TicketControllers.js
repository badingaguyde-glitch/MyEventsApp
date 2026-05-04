const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const User = require('../models/User');
const client = require('../config/redis');





const buyTicket = async (req, res) => {
    try {
        const { eventId, price } = req.body;

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
            user: req.user.id,
            status: 'active'
        });

        if (existingTicket) {
            return res.status(400).json({
                message: 'You already have an active ticket for this event'
            });
        }


        const ticket = await Ticket.create({
            event: eventId,
            user: req.user.id,
            price: price || 0,
            status: 'active'
        });
        await client.del('tickets'); // Clear the tickets cache
        await client.del('user_tickets'); // Clear the user's tickets cache
        await client.del('ticket_availability'); // Clear the ticket availability cache
        await client.del(`ticket_by_code_${event._id}`); // Clear the ticket by code cache for this event



        const populatedTicket = await Ticket.findById(ticket._id)
            .populate('event')
            .populate('user', 'firstName lastName email');

        res.status(201).json({
            message: 'Ticket purchased successfully',
            ticket: populatedTicket
        });
    } catch (error) {
        console.error('Buy ticket error:', error);
        res.status(500).json({
            message: 'Server error during ticket purchase',
            error: error.message
        });
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


        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
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
        await client.del('tickets'); // Clear the tickets cache
        await client.del('user_tickets'); // Clear the user's tickets cache
        await client.del('ticket_availability'); // Clear the ticket availability cache
        await client.del(`ticket_by_code_${event._id}`); // Clear the ticket by code cache for this event

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

        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
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

module.exports = {
    buyTicket,
    getUserTickets,
    verifyTicket,
    cancelTicket,
    getTicketByCode,
    checkAvailability,
    bulkVerifyTickets
};
