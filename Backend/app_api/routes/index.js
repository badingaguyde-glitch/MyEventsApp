var express = require('express');
var router = express.Router();
var ctrlEvent = require('../controller/EventControllers');
var ctrlTicket = require('../controller/TicketControllers');
var ctrlUser = require('../controller/UserControllers');

// ──────────────────────────────────────────────
// USER ROUTES
// ──────────────────────────────────────────────

router.route('/user')
    .post(ctrlUser.registerUser)
    .put(ctrlUser.requireAuth, ctrlUser.updateProfile);

router.route('/user/login')
    .post(ctrlUser.login);

router.route('/user/:userid')
    .delete(ctrlUser.requireAuth, ctrlUser.deleteUser);

// ──────────────────────────────────────────────
// EVENT ROUTES — Public
// ──────────────────────────────────────────────
router.route('/events')
    .get(ctrlEvent.getAllEvents)
    .post(ctrlUser.requireAuth, ctrlEvent.upload.single("image"), ctrlEvent.createEvent);


router.route('/events/search')
    .get(ctrlEvent.searchEvents);

router.route('/events/nearby')
    .get(ctrlEvent.getNearbyEvents);


router.route('/events/category')
    .get(ctrlEvent.filterByCategory);

// IMPORTANT: /events/mine must come BEFORE /events/:eventid 
// or Express will match "mine" as an eventid value
router.route('/events/mine')
    .get(ctrlUser.requireAuth, ctrlEvent.getMyEvents);

// ──────────────────────────────────────────────
// EVENT ROUTES — Per-ID (Protected)
// ──────────────────────────────────────────────
router.route('/events/:eventid')
    .get(ctrlEvent.getEventById)
    .put(ctrlUser.requireAuth, ctrlEvent.upload.single("image"), ctrlEvent.updateEvent)
    .delete(ctrlUser.requireAuth, ctrlEvent.deleteEvent);

router.route('/events/:eventid/participants')
    .get(ctrlUser.requireAuth, ctrlEvent.getEventParticipants);

// ──────────────────────────────────────────────
// TICKET ROUTES
// ──────────────────────────────────────────────
router.route('/tickets')
    .post(ctrlUser.requireAuth, ctrlTicket.buyTicket)
    .get(ctrlUser.requireAuth, ctrlTicket.getUserTickets);

router.route('/tickets/verify')
    .post(ctrlUser.requireAuth, ctrlTicket.verifyTicket);

router.route('/tickets/bulk-verify')
    .post(ctrlUser.requireAuth, ctrlTicket.bulkVerifyTickets);

// Static sub-paths BEFORE /:ticketid param
router.route('/tickets/event/:eventId/availability')
    .get(ctrlTicket.checkAvailability);

router.route('/tickets/code/:code')
    .get(ctrlUser.requireAuth, ctrlTicket.getTicketByCode);

router.route('/tickets/:ticketid')
    .delete(ctrlUser.requireAuth, ctrlTicket.cancelTicket);

module.exports = router;