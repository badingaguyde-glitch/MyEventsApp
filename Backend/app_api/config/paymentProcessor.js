const amqplib = require('amqplib');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const client = require('./redis');
const cache = require('../middleware/cache');
const { publishToQueue } = require('./rabbitmq');

const Queue = 'payment_queue';

async function processPaymentEvent(msg) {
    const { type, data } = JSON.parse(msg.content.toString());

    if (type === 'checkout.session.completed') {
        const session = data;
        const metadata = session.metadata;

        if (!metadata) {
            console.log("Paiement ignoré: Pas de metadata", session.id);
            return;
        }

        // --- CAS 1: PAIEMENT D'UN TICKET ---
        if (metadata.type === 'ticket') {
            const ticketId = metadata.ticketId;

            // 1. Mettre à jour la BDD
            const ticket = await Ticket.findByIdAndUpdate(
                ticketId,
                { status: 'active' },
                { new: true }
            );

            if (ticket) {
                // 2. Vider les caches Redis
                await cache.clearPattern('tickets_*');
                await cache.clearPattern(`user_tickets_${metadata.userId}`);
                await cache.clearPattern('ticket_availability_*');
                await cache.clearPattern(`ticket_by_code_*${ticket.event}*`);
                await cache.clearPattern('events_*');
                await cache.clearPattern('category_events_*');
                await cache.clearPattern('nearby_events_*');
                await cache.clearPattern(`event_details_*${ticket.event}*`);

                // 3. Envoyer l'email
                publishToQueue('email_queue', {
                    type: 'ticket_purchase_email',
                    user: {
                        name: metadata.userName,
                        lastName: metadata.userLastName,
                        email: metadata.userEmail
                    },
                    event: {
                        title: metadata.eventTitle,
                        date: new Date(metadata.eventDate),
                        location: JSON.parse(metadata.eventLocation)
                    },
                    ticket: {
                        id: ticket._id,
                        code: metadata.ticketCode
                    },
                    receiptUrl: session.receipt_url // Le lien du reçu Stripe
                });
                console.log(`Ticket ${ticketId} activé suite au paiement.`);
            }
        }

        // --- CAS 2: COMMISSION DE CRÉATION D'ÉVÉNEMENT ---
        else if (metadata.type === 'event_commission') {
            const eventId = metadata.eventId;

            // 1. Mettre à jour la BDD
            const event = await Event.findByIdAndUpdate(
                eventId,
                { status: 'active' },
                { new: true }
            );

            if (event) {
                // 2. Vider les caches Redis
                await cache.clearPattern('events_*');
                await cache.clearPattern('category_events_*');
                await cache.clearPattern('nearby_events_*');
                await cache.clearPattern(`my_events_${metadata.userId}`);
                await cache.clearPattern(`event_details_*${eventId}*`);

                // 3. Envoyer l'email
                publishToQueue('email_queue', {
                    type: 'event_created_email',
                    user: {
                        name: metadata.userName,
                        lastName: metadata.userLastName,
                        email: metadata.userEmail
                    },
                    event: {
                        id: event._id,
                        title: event.title,
                        date: event.date, // Attention, la date ici pourrait être undefined sans le formatage original, on suppose que mailSender la formatera correctement.
                        location: event.location
                    },
                    receiptUrl: session.receipt_url // Le lien du reçu Stripe
                });
                console.log(`Événement ${eventId} activé suite au paiement.`);
            }
        }

        // --- CAS 3: UPGRADE D'ABONNEMENT ---
        else if (metadata.type === 'plan_upgrade') {
            const User = require('../models/User');
            const user = await User.findByIdAndUpdate(
                metadata.userId,
                { plan: metadata.plan },
                { new: true }
            );
            if (user) {
                console.log(`User ${metadata.userId} upgraded to plan ${metadata.plan} via webhook.`);
            }
        }
    }
}

// startPaymentProcessor(); // Désactivé car le traitement est désormais effectué en tâche de fond locale via rabbitmq.js

module.exports = { processPaymentEvent };
