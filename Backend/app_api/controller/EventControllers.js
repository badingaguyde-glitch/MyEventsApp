var mongoose = require('mongoose');
var Event = mongoose.model('Event');
var Ticket = mongoose.model('Ticket');
var User = mongoose.model('User');



// @desc    Create new event (Yeni Etkinlik Oluşturma)
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            date,
            time,
            location,
            capacity,
            price,
            coordinates
        } = req.body;

        // Validate required fields
        if (!title || !description || !category || !date || !time || !location || !capacity) {
            return res.status(400).json({
                message: 'Please provide all required fields'
            });
        }

        // Create event
        const event = await Event.create({
            title,
            description,
            category,
            date,
            time,
            location,
            capacity,
            price: price || 0,
            image: req.file ? req.file.path : 'default-event.jpg',
            coordinates: coordinates || [0, 0],
            organizer: req.user.id,
            status: 'active'
        });

        res.status(201).json(event);
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            message: 'Server error during event creation',
            error: error.message
        });
    }
};

const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuration Cloudinary avec les variables d'environnement
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME || 'test',
    api_key: process.env.CLOUD_API_KEY || '12345',
    api_secret: process.env.CLOUD_API_SECRET || 'abcdefg'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'myevents',
        allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const getAllEvents = async (req, res) => {
    try {
        const { category, search, city, date, priceMin, priceMax } = req.query;

        // Build filter object
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

        // Get events with organizer info
        const events = await Event.find(filter)
            .populate('organizer', 'firstName lastName email')
            .sort({ date: 1 });

        // For each event, get available tickets count
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
        }).populate('organizer', 'firstName lastName email');

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
        }).populate('organizer', 'firstName lastName email');

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

        // Vérifier si les coordonnées sont fournies
        if (!lat || !lng) {
            return res.status(400).json({
                message: 'Latitude and longitude are required'
            });
        }

        // Convertir le rayon en mètres (pour MongoDB geospatial)
        const radiusInMeters = unit === 'km' ? radius * 1000 : radius * 1609.34; // km ou miles

        // Rechercher les événements à proximité
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
        }).populate('organizer', 'firstName lastName email');

        // Calculer les distances pour chaque événement
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

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventid)
            .populate('organizer', 'firstName lastName email');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Get ticket count
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
        console.log("capcaity:",eventData.capacity,"available:", eventData.availableSpots, "sold:", soldTickets);
    } catch (error) {
        console.error('Get event by ID error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update event (Etkinlik Bilgilerini Güncelleme)
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventid);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is the organizer
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Not authorized to update this event'
            });
        }

        // Update fields
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
            coordinates
        } = req.body;

        event.title = title || event.title;
        event.description = description || event.description;
        event.category = category || event.category;
        event.date = date || event.date;
        event.time = time || event.time;
        event.location = location || event.location;
        event.capacity = Number(capacity) || Number(event.capacity);
        event.price = price !== undefined ? price : event.price;
        if (req.file) {
            event.image = req.file.path;
        }
        event.status = status || event.status;
        event.coordinates = coordinates || event.coordinates;

        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            message: 'Server error during event update',
            error: error.message
        });
    }
};


// @desc    Delete event (Etkinlik İptal Etme)
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventid);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is the organizer
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Not authorized to delete this event'
            });
        }

        // Cancel all tickets for this event
        await Ticket.updateMany(
            { event: event._id, status: 'active' },
            { status: 'cancelled' }
        );

        // Delete or mark event as cancelled
        event.status = 'cancelled';
        await event.save();

        res.json({
            message: 'Event cancelled successfully',
            event
        });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({
            message: 'Server error during event deletion',
            error: error.message
        });
    }
};

// @desc    Get events by organizer
// @route   GET /api/events/organizer/me
// @access  Private
const getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.user.id })
            .sort({ date: -1 });

        // Get ticket counts for each event
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

// @desc    Get event participants (Etkinlik Katılımcılarını Listeleme)
// @route   GET /api/events/:id/participants
// @access  Private
const getEventParticipants = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventid);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is organizer or admin
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Not authorized to view participants'
            });
        }

        const tickets = await Ticket.find({
            event: event._id,
            status: { $ne: 'cancelled' }
        })
            .populate('user', 'firstName lastName email')
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
    upload
};