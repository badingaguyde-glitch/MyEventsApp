const mongoose = require('mongoose');
const Booking = mongoose.model('Booking');
const ServiceProvider = mongoose.model('ServiceProvider');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createBooking = async (req, res) => {
    try {
        const { providerId, bookingDate, totalPrice, notes, eventId, paymentMethod } = req.body;

        if (!providerId || !bookingDate || !totalPrice || !paymentMethod) {
            return res.status(400).json({ message: 'Missing required booking fields' });
        }

        const provider = await ServiceProvider.findById(providerId);
        if (!provider) {
            return res.status(404).json({ message: 'Service Provider not found' });
        }

        const targetDate = new Date(bookingDate);
        const isUnavailable = provider.unavailableDates.some(
            date => date.toDateString() === targetDate.toDateString()
        );
        if (isUnavailable) {
            return res.status(400).json({ message: 'Provider is not available on this date' });
        }

        const booking = await Booking.create({
            provider: providerId,
            organizer: req.user.id,
            event: eventId || null,
            bookingDate: targetDate,
            totalPrice,
            paymentMethod,
            notes
        });

        if (paymentMethod === 'stripe' && provider.paymentMethods.includes('stripe')) {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `Réservation de ${provider.businessName}`,
                            description: `Service prévu le ${targetDate.toLocaleDateString()}`
                        },
                        unit_amount: totalPrice * 100,
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-tickets?booking_success=true`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/marketplace`,
                metadata: {
                    bookingId: booking._id.toString(),
                    type: 'service_booking'
                }
            });

            booking.stripeSessionId = session.id;
            await booking.save();

            return res.status(201).json({ booking, checkoutUrl: session.url });
        }

        res.status(201).json({ booking });
    } catch (error) {
        console.error('createBooking error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid booking status' });
        }

        const providerProfile = await ServiceProvider.findOne({ user: req.user.id });
        if (!providerProfile) {
            return res.status(403).json({ message: 'Only service providers can update reservation status' });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.provider.toString() !== providerProfile._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized modification' });
        }

        booking.status = status;
        await booking.save();

        if (status === 'accepted') {
            providerProfile.unavailableDates.push(booking.bookingDate);
            await providerProfile.save();
        }

        res.status(200).json({ message: `Booking request ${status}`, booking });
    } catch (error) {
        console.error('updateBookingStatus error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getOrganizerBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ organizer: req.user.id })
            .populate({
                path: 'provider',
                select: 'businessName serviceType user rates',
                populate: { path: 'user', select: 'name lastName' }
            })
            .populate('event', 'title date');
        res.status(200).json(bookings);
    } catch (error) {
        console.error('getOrganizerBookings error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getProviderBookings = async (req, res) => {
    try {
        const providerProfile = await ServiceProvider.findOne({ user: req.user.id });
        if (!providerProfile) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }

        const bookings = await Booking.find({ provider: providerProfile._id })
            .populate('organizer', 'name lastName email')
            .populate('event', 'title date location');
            
        res.status(200).json(bookings);
    } catch (error) {
        console.error('getProviderBookings error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createBooking,
    updateBookingStatus,
    getOrganizerBookings,
    getProviderBookings
};
