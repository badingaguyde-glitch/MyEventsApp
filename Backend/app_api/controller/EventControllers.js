var mongoose = require('mongoose');
var Event = mongoose.model('Event');
var Ticket = mongoose.model('Ticket');
var User = mongoose.model('User');
var Notification = mongoose.model('Notification');
var client = require('../config/redis');
var cache = require('../middleware/cache');
require('dotenv').config();
var calculateDistance = require('./utils/calculate');
const { publishToQueue } = require('../config/rabbitmq');
const { sendExpoPushNotifications } = require('../config/pushHelper');


const createEvent = async (req, res) => {
    try {
        const {
            title, description, category, date, time,
            location, capacity, price, coordinates, clientType, coOrganizers
        } = req.body;

        if (!title || !description || !category || !date || !time || !location || !capacity) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const userPlan = req.user.plan || 'free';
        
        let coOrganizersIds = [];
        if (coOrganizers && coOrganizers.length > 0) {
            if (userPlan !== 'enterprise') {
                return res.status(403).json({
                    message: "L'ajout de co-organisateurs et d'équipes est une fonctionnalité exclusive aux comptes Entreprise."
                });
            }
            
            // Si c'est déjà un tableau ou une chaîne séparée par des virgules
            const coOrgsArray = Array.isArray(coOrganizers) 
                ? coOrganizers 
                : coOrganizers.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
            
            const users = await User.find({ email: { $in: coOrgsArray } });
            coOrganizersIds = users.map(u => u._id);
        }
        
        if (userPlan === 'free' && capacity > 100){
            return res.status(400).json({
                message: "Les organisateurs avec un plan Gratuit ne peuvent pas créer d'événements de plus de 100 participants. Veuillez passer au forfait Professionnel."
            });
        }

        let imageUrl = 'default-event.jpg';
        if (req.file) {
            try {
                const uploadResult = await uploadToCloudinary(req.file.buffer);
                imageUrl = uploadResult.secure_url;
            } catch (uploadError) {
                console.error('Image upload failed:', uploadError.message);
            }
        } else if (req.body.image) {
            if (typeof req.body.image === 'string' && req.body.image.startsWith('data:image/')) {
                try {
                    const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, "");
                    const buffer = Buffer.from(base64Data, 'base64');
                    const uploadResult = await uploadToCloudinary(buffer);
                    imageUrl = uploadResult.secure_url;
                } catch (uploadError) {
                    console.error('Base64 image upload failed:', uploadError.message);
                    imageUrl = req.body.image;
                }
            } else {
                imageUrl = req.body.image;
            }
        }

        // On crée l'événement directement en statut 'active'
        const event = await Event.create({
            title, description, category, date, time, location, capacity,
            price: price || 0,
            image: imageUrl,
            coordinates: coordinates || [0, 0],
            organizer: req.user.id,
            status: 'active',
            coOrganizers: coOrganizersIds
        });

        // Vider le cache Redis pour actualiser la liste des événements
        await cache.clearPattern('events_*');
        await cache.clearPattern('category_events_*');
        await cache.clearPattern('nearby_events_*');
        await cache.clearPattern(`my_events_${req.user.id || req.user._id}`);

        // Notification d'événement créé par e-mail
        try {
            publishToQueue('email_queue', {
                type: 'event_created_email',
                user: {
                    name: req.user.name,
                    lastName: req.user.lastName,
                    email: req.user.email
                },
                event: {
                    id: event._id,
                    title: event.title,
                    date: event.date,
                    location: event.location
                }
            });
        } catch (e) {
            console.error("Failed to queue email:", e);
        }

        // Notifier les abonnés de l'organisateur
        try {
            const organizer = await User.findById(req.user.id).select('followers name lastName');
            if (organizer && organizer.followers && organizer.followers.length > 0) {
                // 1. Créer les notifications en base
                const notifications = organizer.followers.map(followerId => ({
                    recipient: followerId,
                    sender: req.user.id,
                    type: 'new_event',
                    title: `Nouvel événement de ${organizer.name} ${organizer.lastName}`,
                    body: `"${event.title}" — ${new Date(event.date).toLocaleDateString('fr-FR')} à ${event.location}`,
                    refModel: 'Event',
                    refId: event._id
                }));
                await Notification.insertMany(notifications);

                // 2. Récupérer les tokens Expo des abonnés pour les push natifs
                const followers = await User.find(
                    { _id: { $in: organizer.followers }, expoPushToken: { $ne: null } },
                    'expoPushToken'
                );

                if (followers.length > 0) {
                    const pushMessages = followers.map(f => ({
                        to: f.expoPushToken,
                        sound: 'default',
                        title: `🎉 ${organizer.name} ${organizer.lastName} organise un nouvel événement !`,
                        body: `"${event.title}" — ${new Date(event.date).toLocaleDateString('fr-FR')} à ${event.location}`,
                        data: { eventId: event._id.toString(), type: 'new_event' }
                    }));
                    // Fire-and-forget — ne bloque pas la réponse HTTP
                    sendExpoPushNotifications(pushMessages);
                }
            }
        } catch (notifError) {
            console.error('Failed to create follower notifications:', notifError);
        }

        return res.status(201).json({
            message: "Événement créé avec succès",
            event: event
        });

    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ message: 'Server error during event creation', error: error.message });
    }
};


const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { Readable } = require('stream');


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});


const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Format non supporté. Utilisez jpg, png ou webp.'));
    }
});


const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'myevents',
                transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        const readable = new Readable();
        readable.push(buffer);
        readable.push(null);
        readable.pipe(uploadStream);
    });
};

const getAllEvents = async (req, res) => {
    try {
        const { category, search, city, date, priceMin, priceMax } = req.query;


        let filter = { status: 'active' };

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (city) {
            filter['location.city'] = { $regex: city, $options: 'i' };
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (date) {
            const searchDate = new Date(date);
            const nextDay = new Date(searchDate);
            nextDay.setDate(nextDay.getDate() + 1);
            filter.date = {
                $gte: searchDate,
                $lt: nextDay
            };
        }

        if (priceMin || priceMax) {
            filter.price = {};
            if (priceMin) filter.price.$gte = parseFloat(priceMin);
            if (priceMax) filter.price.$lte = parseFloat(priceMax);
        }


        const events = await Event.find(filter)
            .populate('organizer', 'name lastName email')
            .sort({ date: 1 });


        const eventsWithAvailability = await Promise.all(
            events.map(async (event) => {
                const soldTickets = await Ticket.countDocuments({
                    event: event._id,
                    status: { $ne: 'cancelled' }
                });

                return {
                    ...event.toObject(),
                    availableSpots: event.capacity - soldTickets,
                    isSoldOut: event.capacity <= soldTickets
                };
            })
        );

        res.json(eventsWithAvailability);
    } catch (error) {
        console.error('Get all events error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

const searchEvents = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ message: 'Search query required' });
        }

        const events = await Event.find({
            $and: [
                { status: 'active' },
                {
                    $or: [
                        { title: { $regex: q, $options: 'i' } },
                        { description: { $regex: q, $options: 'i' } },
                        { 'location.venue': { $regex: q, $options: 'i' } },
                        { 'location.city': { $regex: q, $options: 'i' } },
                        { category: { $regex: q, $options: 'i' } }
                    ]
                }
            ]
        }).populate('organizer', 'name lastName email');

        res.json(events);
    } catch (error) {
        console.error('Search events error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

const filterByCategory = async (req, res) => {
    try {
        const { category } = req.query;

        if (!category) {
            return res.status(400).json({ message: 'Category required' });
        }

        const events = await Event.find({
            category: category,
            status: 'active'
        }).populate('organizer', 'name lastName email');

        res.json(events);
    } catch (error) {
        console.error('Filter by category error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

const getNearbyEvents = async (req, res) => {
    try {
        const { lat, lng, radius = 10, unit = 'km' } = req.query;


        if (!lat || !lng) {
            return res.status(400).json({
                message: 'Latitude and longitude are required'
            });
        }


        const radiusInMeters = unit === 'km' ? radius * 1000 : radius * 1609.34;


        const nearbyEvents = await Event.find({
            status: 'active',
            'coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: radiusInMeters
                }
            }
        }).populate('organizer', 'name lastName email');


        const eventsWithDistance = nearbyEvents.map(event => {
            const eventCoords = event.coordinates;
            const distance = calculateDistance(
                parseFloat(lat),
                parseFloat(lng),
                eventCoords[1],
                eventCoords[0],
                unit
            );

            return {
                ...event.toObject(),
                distance: {
                    value: Math.round(distance * 10) / 10,
                    unit: unit
                }
            };
        });

        res.json({
            count: eventsWithDistance.length,
            userLocation: {
                lat: parseFloat(lat),
                lng: parseFloat(lng)
            },
            radius: {
                value: parseFloat(radius),
                unit: unit
            },
            events: eventsWithDistance.sort((a, b) => a.distance.value - b.distance.value)
        });

    } catch (error) {
        console.error('Get nearby events error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};




const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventid)
            .populate('organizer', 'name lastName email');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }


        const soldTickets = await Ticket.countDocuments({
            event: event._id,
            status: { $ne: 'cancelled' }
        });

        const eventData = {
            ...event.toObject(),
            availableSpots: Number(event.capacity) - soldTickets,
            isSoldOut: Number(event.capacity) <= soldTickets
        };

        res.json(eventData);
        console.log("capcaity:", eventData.capacity, "available:", eventData.availableSpots, "sold:", soldTickets);
    } catch (error) {
        console.error('Get event by ID error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};




const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventid).populate('organizer', 'name lastName email');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }


        const organizerId = event.organizer && event.organizer._id ? event.organizer._id.toString() : event.organizer.toString();
        if (organizerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Not authorized to update this event'
            });
        }


        const {
            title,
            description,
            category,
            date,
            time,
            location,
            capacity,
            price,
            status,
            coordinates,
            coOrganizers
        } = req.body;

        const userPlan = req.user.plan || 'free';
        if (coOrganizers !== undefined) {
            if (userPlan !== 'enterprise') {
                return res.status(403).json({ 
                    message: "L'ajout de co-organisateurs et d'équipes est réservé exclusivement aux comptes Entreprise." 
                });
            }
            const coOrgsArray = Array.isArray(coOrganizers) 
                ? coOrganizers 
                : coOrganizers.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
            const users = await User.find({ email: { $in: coOrgsArray } });
            event.coOrganizers = users.map(u => u._id);
        }

        event.title = title || event.title;
        event.description = description || event.description;
        event.category = category || event.category;
        event.date = date || event.date;
        event.time = time || event.time;
        event.location = location || event.location;
        event.capacity = Number(capacity) || Number(event.capacity);
        event.price = price !== undefined ? price : event.price;
        if (req.file) {
            try {
                const uploadResult = await uploadToCloudinary(req.file.buffer);
                event.image = uploadResult.secure_url;
            } catch (uploadError) {
                console.error('Image upload failed on update:', uploadError.message);
            }
        } else if (req.body.image) {
            if (typeof req.body.image === 'string' && req.body.image.startsWith('data:image/')) {
                try {
                    const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, "");
                    const buffer = Buffer.from(base64Data, 'base64');
                    const uploadResult = await uploadToCloudinary(buffer);
                    event.image = uploadResult.secure_url;
                } catch (uploadError) {
                    console.error('Base64 image upload failed on update:', uploadError.message);
                    event.image = req.body.image;
                }
            } else {
                event.image = req.body.image;
            }
        }
        event.status = status || event.status;
        event.coordinates = coordinates || event.coordinates;

        const updatedEvent = await event.populate('organizer', 'name lastName email');
        await event.save();
        await cache.clearPattern('events_*');
        await cache.clearPattern('category_events_*');
        await cache.clearPattern('nearby_events_*');
        await cache.clearPattern(`my_events_${req.user.id || req.user._id}`);
        await cache.clearPattern(`event_details_*${event._id}*`);

        publishToQueue('email_queue', {
            type: 'event_updated_email',
            user: {
                name: event.organizer.name,
                lastName: event.organizer.lastName,
                email: event.organizer.email
            },
            event: {
                id: event._id,
                title: event.title,
                date: event.date,
                location: event.location
            }
        });

        res.json(updatedEvent);
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            message: 'Server error during event update',
            error: error.message
        });
    }
};





const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventid);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }


        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Not authorized to delete this event'
            });
        }

        if (event.organizer.toString() == req.user.id) {
            await Ticket.updateMany(
                { event: event._id, status: 'active' },
                { status: 'cancelled' }
            );
            await cache.clearPattern('tickets_*');
            await cache.clearPattern('user_tickets_*');
            await cache.clearPattern('ticket_availability_*');
            await cache.clearPattern(`ticket_by_code_*${event._id}*`);
            await cache.clearPattern('events_*');
            await cache.clearPattern('category_events_*');
            await cache.clearPattern('nearby_events_*');
            await cache.clearPattern(`my_events_${req.user.id || req.user._id}`);
            await cache.clearPattern(`event_details_*${event._id}*`);

            event.status = 'cancelled';
            await event.save();
            res.json({
                message: 'Event cancelled successfully',
                event
            });
        } else if (req.user.role === 'admin') {
            await Ticket.deleteMany({ event: event._id });
            await event.deleteOne();
            await cache.clearPattern('tickets_*');
            await cache.clearPattern('user_tickets_*');
            await cache.clearPattern('ticket_availability_*');
            await cache.clearPattern(`ticket_by_code_*${event._id}*`);
            await cache.clearPattern('events_*');
            await cache.clearPattern('category_events_*');
            await cache.clearPattern('nearby_events_*');
            await cache.clearPattern(`my_events_${req.user.id || req.user._id}`);
            await cache.clearPattern(`event_details_*${event._id}*`);
            res.json({ message: 'Event and associated tickets deleted successfully' });
        }

        publishToQueue('email_queue', {
            type: 'event_deleted_email',
            user: {
                name: event.organizer.name,
                lastName: event.organizer.lastName,
                email: event.organizer.email
            },
            event: {
                id: event._id,
                title: event.title,
                date: event.date,
                location: event.location
            }
        });

    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({
            message: 'Server error during event deletion',
            error: error.message
        });
    }
};




const getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.user.id })
            .sort({ date: -1 });


        const eventsWithStats = await Promise.all(
            events.map(async (event) => {
                const soldTickets = await Ticket.countDocuments({
                    event: event._id,
                    status: { $ne: 'cancelled' }
                });

                const checkedIn = await Ticket.countDocuments({
                    event: event._id,
                    status: 'used'
                });

                return {
                    ...event.toObject(),
                    soldTickets,
                    checkedIn,
                    availableSpots: Number(event.capacity) - soldTickets
                };
            })
        );

        res.json(eventsWithStats);
    } catch (error) {
        console.error('Get my events error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};




const getEventParticipants = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventid);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }


        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Not authorized to view participants'
            });
        }

        const tickets = await Ticket.find({
            event: event._id,
            status: { $ne: 'cancelled' }
        })
            .populate('user', 'name lastName email')
            .sort({ purchaseDate: -1 });

        const participants = tickets.map(ticket => ({
            ticketId: ticket._id,
            ticketCode: ticket.ticketCode,
            user: ticket.user,
            purchaseDate: ticket.purchaseDate,
            status: ticket.status,
            checkInTime: ticket.checkInTime,
            checkedInBy: ticket.checkedInBy
        }));

        res.json({
            event: {
                id: event._id,
                title: event.title,
                totalTickets: tickets.length,
                capacity: Number(event.capacity)
            },
            participants
        });

    } catch (error) {
        console.error('Get event participants error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

const payEvent = async (req, res) => {
    try {
        const { clientType } = req.body;
        const event = await Event.findById(req.params.eventid);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (event.status !== 'pending_payment') {
            return res.status(400).json({ message: 'This event is not pending payment' });
        }

        const feeAmount = process.env.EVENT_CREATION_FEE ? parseInt(process.env.EVENT_CREATION_FEE) : 500;

        if (feeAmount === 0) {
            event.status = 'active';
            await event.save();
            await cache.clearPattern('events_*');
            await cache.clearPattern('category_events_*');
            await cache.clearPattern('nearby_events_*');
            await cache.clearPattern(`my_events_${req.user.id || req.user._id}`);
            await cache.clearPattern(`event_details_*${event._id}*`);
            return res.status(200).json({
                message: "Événement activé avec succès",
                event: event
            });
        }

        const { createCheckoutSession } = require('./PaymentControllers');

        const stripeReq = {
            body: {
                amount: feeAmount,
                currency: 'eur',
                name: `Commission de création: ${event.title}`,
                description: 'Frais de mise en ligne de votre événement sur BANTU MyEvents',
                metadata: {
                    type: 'event_commission',
                    eventId: event._id.toString(),
                    userId: req.user.id.toString(),
                    userEmail: req.user.email,
                    userName: req.user.name,
                    userLastName: req.user.lastName,
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
                            message: "Stripe error during event payment generation",
                            error: data.error || data.message
                        });
                    }
                    publishToQueue('email_queue', {
                        type: 'event_pending_email',
                        user: {
                            name: req.user.name,
                            lastName: req.user.lastName,
                            email: req.user.email
                        },
                        event: {
                            title: event.title
                        },
                        receiptUrl: data.url
                    });
                    return res.status(200).json({
                        message: "Session de paiement créée",
                        stripeUrl: data.url
                    });
                }
            })
        };

        await createCheckoutSession(stripeReq, stripeRes);

    } catch (error) {
        console.error('Pay event error:', error);
        res.status(500).json({ message: 'Server error during payment generation', error: error.message });
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    searchEvents,
    filterByCategory,
    getNearbyEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getMyEvents,
    getEventParticipants,
    payEvent,
    upload
};