var mongoose=  require('mongoose');
var Event= mongoose.model('Event');
var Ticket= mongoose.model('Ticket');
var User= mongoose.model('User');

const getAllEvents = async (req,res)=>{
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
            });        }

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


module.exports = {
    getAllEvents,
    searchEvents,
    filterByCategory,
    getNearbyEvents
};