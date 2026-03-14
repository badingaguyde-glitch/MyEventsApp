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

