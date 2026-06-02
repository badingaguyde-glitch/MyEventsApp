const mongoose = require('mongoose');
const { publishToQueue } = require('./rabbitmq');
require('dotenv').config();

const Queue = 'email_queue';

// Get payment timeout from environment variable (defaults to 2 hours)
const PAYMENT_TIMEOUT_HOURS = process.env.PAYMENT_TIMEOUT_HOURS ? parseFloat(process.env.PAYMENT_TIMEOUT_HOURS) : 2;
const PAYMENT_TIMEOUT_MS = PAYMENT_TIMEOUT_HOURS * 60 * 60 * 1000;

// Cleanup run interval (every 15 minutes)
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000; 

async function runCleanup() {
    try {
        console.log(`[Cleanup Job] Starting cleanup checks (Timeout: ${PAYMENT_TIMEOUT_HOURS} hours)...`);
        
        const threshold = new Date(Date.now() - PAYMENT_TIMEOUT_MS);
        
        const Event = mongoose.model('Event');
        const Ticket = mongoose.model('Ticket');
        const cache = require('../middleware/cache');

        // 1. Clean up expired tickets
        const expiredTickets = await Ticket.find({
            status: 'pending_payment',
            createdAt: { $lt: threshold }
        }).populate('user', 'name lastName email').populate('event', 'title');

        if (expiredTickets.length > 0) {
            console.log(`[Cleanup Job] Found ${expiredTickets.length} expired tickets to clean.`);
            for (const ticket of expiredTickets) {
                console.log(`[Cleanup Job] Ticket ${ticket.ticketCode} for event "${ticket.event?.title}" expired.`);
                
                // Queue email notification
                if (ticket.user && ticket.user.email) {
                    try {
                        publishToQueue(Queue, {
                            type: 'ticket_expired_email',
                            user: {
                                name: ticket.user.name,
                                lastName: ticket.user.lastName,
                                email: ticket.user.email
                            },
                            event: {
                                title: ticket.event?.title || 'Unknown Event'
                            },
                            ticket: {
                                code: ticket.ticketCode
                            }
                        });
                    } catch (emailErr) {
                        console.error(`[Cleanup Job] Failed to queue ticket expired email:`, emailErr);
                    }
                }
                
                // Delete from DB
                await Ticket.deleteOne({ _id: ticket._id });
            }
            
            // Clear Redis caches
            await cache.clearPattern('tickets_*');
            await cache.clearPattern('user_tickets_*');
            await cache.clearPattern('ticket_availability_*');
        }

        // 2. Clean up expired events
        const expiredEvents = await Event.find({
            status: 'pending_payment',
            createdAt: { $lt: threshold }
        }).populate('organizer', 'name lastName email');

        if (expiredEvents.length > 0) {
            console.log(`[Cleanup Job] Found ${expiredEvents.length} expired events to clean.`);
            for (const event of expiredEvents) {
                console.log(`[Cleanup Job] Event "${event.title}" (ID: ${event._id}) expired.`);
                
                // Queue email notification
                if (event.organizer && event.organizer.email) {
                    try {
                        publishToQueue(Queue, {
                            type: 'event_expired_email',
                            user: {
                                name: event.organizer.name,
                                lastName: event.organizer.lastName,
                                email: event.organizer.email
                            },
                            event: {
                                title: event.title
                            }
                        });
                    } catch (emailErr) {
                        console.error(`[Cleanup Job] Failed to queue event expired email:`, emailErr);
                    }
                }
                
                // Delete associated tickets
                await Ticket.deleteMany({ event: event._id });
                
                // Delete from DB
                await Event.deleteOne({ _id: event._id });
            }
            
            // Clear Redis caches
            await cache.clearPattern('events_*');
            await cache.clearPattern('category_events_*');
            await cache.clearPattern('nearby_events_*');
            await cache.clearPattern('my_events_*');
            await cache.clearPattern('event_details_*');
        }
        
        console.log('[Cleanup Job] Finished cleanup checks successfully.');
    } catch (err) {
        console.error('[Cleanup Job] Error during cleanup execution:', err);
    }
}

// Start scheduled checks
function startCleanupScheduler() {
    console.log(`[Cleanup Job] Starting scheduler: will run every 15 minutes.`);
    // Run once on startup after a small delay to let connections settle
    setTimeout(() => {
        runCleanup();
    }, 10000);
    
    // Schedule repeating intervals
    setInterval(runCleanup, CLEANUP_INTERVAL_MS);
}

startCleanupScheduler();

module.exports = {
    runCleanup
};
