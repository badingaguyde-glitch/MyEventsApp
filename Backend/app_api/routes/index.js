var express = require('express');
var router = express.Router();
var ctrlEvent = require('../controller/EventControllers');
var ctrlTicket = require('../controller/TicketControllers');
var ctrlUser = require('../controller/UserControllers');
var cache = require('../middleware/cache');





router.route('/user')
    .post(ctrlUser.registerUser)
    .put(ctrlUser.requireAuth, ctrlUser.updateProfile);

router.route('/user/login')
    .post(ctrlUser.login);

router.route('/user/:userid')
    .delete(ctrlUser.requireAuth, ctrlUser.deleteUser);




router.route('/events')
    .get(cache('events', 60), ctrlEvent.getAllEvents)
    .post(ctrlUser.requireAuth, ctrlEvent.upload.single("image"), ctrlEvent.createEvent);


router.route('/events/search')
    .get(ctrlEvent.searchEvents);

router.route('/events/nearby')
    .get(cache('nearby_events', 60), ctrlEvent.getNearbyEvents);


router.route('/events/category')
    .get(cache('category_events', 60), ctrlEvent.filterByCategory);



router.route('/events/mine')
    .get(ctrlUser.requireAuth, cache((req) => `my_events_${req.user._id}`, 60), ctrlEvent.getMyEvents);




router.route('/events/:eventid')
    .get(cache('event_details', 60), ctrlEvent.getEventById)
    .put(ctrlUser.requireAuth, ctrlEvent.upload.single("image"), ctrlEvent.updateEvent)
    .delete(ctrlUser.requireAuth, ctrlEvent.deleteEvent);

router.route('/events/:eventid/participants')
    .get(ctrlUser.requireAuth, cache('event_participants', 60), ctrlEvent.getEventParticipants);




router.route('/tickets')
    .post(ctrlUser.requireAuth, ctrlTicket.buyTicket)
    .get(ctrlUser.requireAuth, cache('user_tickets', 60), ctrlTicket.getUserTickets);

router.route('/tickets/verify')
    .post(ctrlUser.requireAuth, ctrlTicket.verifyTicket);

router.route('/tickets/bulk-verify')
    .post(ctrlUser.requireAuth, ctrlTicket.bulkVerifyTickets);


router.route('/tickets/event/:eventId/availability')
    .get(cache('ticket_availability', 60), ctrlTicket.checkAvailability);

router.route('/tickets/code/:code')
    .get(cache('ticket_by_code', 60), ctrlUser.requireAuth, ctrlTicket.getTicketByCode);

router.route('/tickets/:ticketid')
    .delete(cache('ticket_details', 60), ctrlUser.requireAuth, ctrlTicket.cancelTicket);

module.exports = router;