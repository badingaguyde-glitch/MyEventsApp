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
router.route('/:id')
    .get(ctrlEvent.getEventById);

// Protected routes (require authentication)
router.route('/')
    .post(protect, ctrlEvent.createEvent);

router.route('/organizer/me')
    .get(protect, ctrlEvent.getMyEvents);

router.route('/:id')
    .put(protect, ctrlEvent.updateEvent)
    .delete(protect, ctrlEvent.deleteEvent);

router.route('/:id/participants')
    .get(protect, ctrlEvent.getEventParticipants);


    // Ticket routes
router.route('/tickets')
    .post(protect, ctrlTicket.buyTicket);

router.route('/tickets/my-tickets')
    .get(protect, ctrlTicket.getUserTickets);

router.route('/tickets/verify')
    .post(protect, ctrlTicket.verifyTicket);

router.route('/tickets/bulk-verify')
    .post(protect, ctrlTicket.bulkVerifyTickets);

router.route('/tickets/event/:eventId/participants')
    .get(protect, ctrlTicket.getEventParticipants);

router.route('/tickets/event/:eventId/availability')
    .get(ctrlTicket.checkAvailability);

router.route('/tickets/code/:code')
    .get(protect, ctrlTicket.getTicketByCode);

router.route('/tickets/:id')
    .delete(protect, ctrlTicket.cancelTicket);

module.exports = router;
