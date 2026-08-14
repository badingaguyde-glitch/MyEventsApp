var express = require('express');
var router = express.Router();
var ctrlEvent = require('../controller/EventControllers');
var ctrlTicket = require('../controller/TicketControllers');
var ctrlUser = require('../controller/UserControllers');
var ctrlPayment = require('../controller/PaymentControllers');
var ctrlTicketPdf = require('../controller/TicketPdfDownload');
var ctrlProvider = require('../controller/ServiceProviderControllers');
var ctrlBooking = require('../controller/BookingControllers');
var ctrlSocial = require('../controller/SocialControllers');
var ctrlNotif = require('../controller/NotificationControllers');
var cache = require('../middleware/cache');





router.route('/user')
    .post(ctrlUser.registerUser)
    .put(ctrlUser.requireAuth, ctrlUser.updateProfile);

router.route('/user/profile')
    .get(ctrlUser.requireAuth, ctrlUser.getProfile);

router.route('/user/generate-code')
    .post(ctrlUser.generateRegistrationCode);

router.route('/user/verify-code')
    .post(ctrlUser.checkEmail);

router.route('/user/forgot-password')
    .post(ctrlUser.forgotPassword);

router.route('/user/verify-reset-code')
    .post(ctrlUser.verifyResetCode);

router.route('/user/reset-password')
    .post(ctrlUser.resetPassword);

router.route('/user/login')
    .post(ctrlUser.login);

router.route('/user/:userid')
    .delete(ctrlUser.requireAuth, ctrlUser.deleteUser);

router.route('/user/:userid/public')
    .get(ctrlUser.requireAuth, ctrlUser.getPublicProfile);




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
    .get(ctrlUser.requireAuth, cache((req) => `my_events_${req.user.id}`, 60), ctrlEvent.getMyEvents);




router.route('/events/:eventid')
    .get(cache('event_details', 60), ctrlEvent.getEventById)
    .put(ctrlUser.requireAuth, ctrlEvent.upload.single("image"), ctrlEvent.updateEvent)
    .delete(ctrlUser.requireAuth, ctrlEvent.deleteEvent);

router.route('/events/:eventid/pay')
    .post(ctrlUser.requireAuth, ctrlEvent.payEvent);

router.route('/events/:eventid/participants')
    .get(ctrlUser.requireAuth, cache('event_participants', 60), ctrlEvent.getEventParticipants);




router.route('/tickets')
    .post(ctrlUser.requireAuth, ctrlTicket.buyTicket)
    .get(ctrlUser.requireAuth, cache((req) => `user_tickets_${req.user.id}`, 60), ctrlTicket.getUserTickets);

router.route('/tickets/verify')
    .post(ctrlUser.requireAuth, ctrlTicket.verifyTicket);

router.route('/tickets/bulk-verify')
    .post(ctrlUser.requireAuth, ctrlTicket.bulkVerifyTickets);

    
router.route('/tickets/bulk-cancel')
    .post(ctrlUser.requireAuth, ctrlTicket.bulkCancelTickets);
        
router.route('/tickets/event/:eventId/availability')
    .get(cache('ticket_availability', 60), ctrlTicket.checkAvailability);

router.route('/tickets/code/:code')
    .get(cache('ticket_by_code', 60), ctrlUser.requireAuth, ctrlTicket.getTicketByCode);

router.route('/tickets/:ticketid')
    .delete(ctrlUser.requireAuth, ctrlTicket.cancelTicket);

router.get('/tickets/:id/pdf',ctrlTicketPdf.downloadTicketPDF);

router.route('/payment/upgrade-plan')
    .post(ctrlUser.requireAuth, ctrlPayment.createPlanUpgradeSession);

router.route('/payment/success')
    .get(ctrlPayment.paymentSuccess);

router.route('/payment/cancel')
    .get(ctrlPayment.paymentCancel);

// ==========================================
// PRESTATAIRES & MARKETPLACE ROUTES
// ==========================================
router.route('/providers')
    .get(ctrlProvider.getProviders)
    .post(ctrlUser.requireAuth, ctrlProvider.upsertProviderProfile);

router.route('/providers/availability')
    .put(ctrlUser.requireAuth, ctrlProvider.updateAvailability);

router.route('/providers/premium-upgrade')
    .post(ctrlUser.requireAuth, ctrlProvider.createPremiumSubscriptionSession);

router.route('/providers/:id')
    .get(ctrlProvider.getProviderById);

router.route('/providers/:id/reviews')
    .post(ctrlUser.requireAuth, ctrlProvider.addReview);

// ==========================================
// DEMANDES DE RESERVATIONS (BOOKINGS) ROUTES
// ==========================================
router.route('/bookings')
    .post(ctrlUser.requireAuth, ctrlBooking.createBooking);

router.route('/bookings/my-requests')
    .get(ctrlUser.requireAuth, ctrlBooking.getOrganizerBookings);

router.route('/bookings/my-jobs')
    .get(ctrlUser.requireAuth, ctrlBooking.getProviderBookings);

router.route('/bookings/:id/status')
    .put(ctrlUser.requireAuth, ctrlBooking.updateBookingStatus);

// ==========================================
// RÉSEAU SOCIAL & CHAT ROUTES
// ==========================================
router.route('/users/:userId/follow')
    .post(ctrlUser.requireAuth, ctrlSocial.toggleFollow);

router.route('/events/:eventId/like')
    .post(ctrlUser.requireAuth, ctrlSocial.toggleLikeEvent);

router.route('/events/:eventId/attendees')
    .get(ctrlUser.requireAuth, ctrlSocial.getEventAttendees);

router.route('/events/:eventId/chat/upload')
    .post(ctrlUser.requireAuth, ctrlSocial.uploadChatMedia);

router.route('/events/:eventId/chat')
    .get(ctrlUser.requireAuth, ctrlSocial.getEventMessages)
    .post(ctrlUser.requireAuth, ctrlSocial.sendEventMessage);

router.route('/posts/upload')
    .post(ctrlUser.requireAuth, ctrlSocial.uploadPostMedia);

router.route('/posts')
    .get(ctrlUser.requireAuth, ctrlSocial.getSocialFeed)
    .post(ctrlUser.requireAuth, ctrlSocial.createPost);

router.route('/posts/user/:userId')
    .get(ctrlUser.requireAuth, ctrlSocial.getUserPosts);

router.route('/posts/:postId/like')
    .post(ctrlUser.requireAuth, ctrlSocial.toggleLikePost);

router.route('/posts/:postId/comments')
    .post(ctrlUser.requireAuth, ctrlSocial.addCommentToPost);

// ==========================================
// NOTIFICATIONS ROUTES
// ==========================================
router.route('/notifications')
    .get(ctrlUser.requireAuth, ctrlNotif.getMyNotifications);

router.route('/notifications/unread-count')
    .get(ctrlUser.requireAuth, ctrlNotif.getUnreadCount);

router.route('/notifications/mark-all-read')
    .put(ctrlUser.requireAuth, ctrlNotif.markAllAsRead);

router.route('/notifications/:id/read')
    .put(ctrlUser.requireAuth, ctrlNotif.markAsRead);

router.route('/user/push-token')
    .put(ctrlUser.requireAuth, ctrlNotif.savePushToken);

// ==========================================
// ADMIN ROUTES
// ==========================================
router.route('/admin/stats')
    .get(ctrlUser.requireAuth, ctrlUser.requireAdmin, ctrlUser.getAdminDashboardStats);

router.route('/admin/users')
    .get(ctrlUser.requireAuth, ctrlUser.requireAdmin, ctrlUser.getAllUsers);

module.exports = router;