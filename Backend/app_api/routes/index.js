var express=require('express');
var router=express.Router();
var ctrlEvent=require('../controller/EventControllers');
var ctrlTicket=require('../controller/TicketControllers');
var ctrlUser=require('../controller/UserControllers');
router.route('/user')
.post(ctrlUser.registerUser)
.put(ctrlUser.updateProfile);
router.route('/user/login')
.post(ctrlUser.login);
router.route('/user/:userid')
.delete(ctrlUser.deleteUser);

router.route('/events')
.get(ctrlEvent.getAllEvents);
router.route('/events/search')
.get(ctrlEvent.searchEvents);
router.route('/events/nearby')
.get(ctrlEvent.getNearbyEvents);
router.route('/events/category/')
.get(ctrlEvent.filterByCategory);

// Route with ID parameter - get event by ID (public)
router.route('/events/:eventid')
    .get(ctrlEvent.getEventById);

// Protected routes (require authentication)
router.route('/events')
    .post(ctrlUser.requireAuth, ctrlEvent.createEvent);

router.route('/events')
    .get(ctrlUser.requireAdminOrOwner, ctrlEvent.getMyEvents);

router.route('/events/:eventid')
    .put(ctrlUser.requireAdminOrOwner, ctrlEvent.updateEvent)
    .delete(ctrlUser.requireAdminOrOwner, ctrlEvent.deleteEvent);

router.route('/events/:eventid/participants')
    .get(ctrlUser.requireAdminOrOwner, ctrlEvent.getEventParticipants);


    // Ticket routes
router.route('/tickets')
.post(ctrlUser.requireAuth, ctrlTicket.buyTicket)
.get(ctrlUser.requireAuth, ctrlTicket.getUserTickets);

router.route('/tickets/verify')
.post(ctrlUser.requireAuth, ctrlTicket.verifyTicket);

router.route('/tickets/bulk-verify')
.post(ctrlUser.requireAdmin, ctrlTicket.bulkVerifyTickets);

router.route('/tickets/event/:eventId/availability')
.get(ctrlTicket.checkAvailability);

router.route('/tickets/code/:code')
.get(ctrlUser.requireAuth, ctrlTicket.getTicketByCode);

router.route('/tickets/:ticketid')
.delete(ctrlUser.requireAuth, ctrlTicket.cancelTicket);

module.exports = router;
