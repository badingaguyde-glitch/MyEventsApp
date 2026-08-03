const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const ServiceProvider = require('../models/ServiceProvider');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createBooking = async (req, res) =>{
    try{
        const { providerId, bookingDate, totalPrice, notes, eventId, paymentMethod }= req.body;
        if (!providerId || !bookingDate || !totalPrice || !paymentMethod) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const provider = await ServiceProvider.findById(providerId);
        if (!provider) {
            return res.status(404).json({ error: 'Service provider not found' });
        }

        const targetDate= new Date(bookingDate);
        const isUnavailable= provider.unavailableDates.some(date => new Date(date).toDateString() === targetDate.toDateString());
        if (isUnavailable) {
            return res.status(400).json({ error: 'The selected date is unavailable for this provider' });
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

        if(paymentMethod === 'stripe' && provider.paymentMethods.includes('stripe')){
            const session = await stripe.checkout.session.create({
                payment_method_types:['card'],
                line_items:[{
                    price_data:{
                        currency:'eur',
                        product_data:{
                            name:`Réservation de ${provider.businessName}`,
                            description:`Service prévu le ${targetDate.toLocaleDateString()}`
                        },
                        unit_amount: totalPrice * 100,
                    },
                    quantity:1,
                }],
                mode:'payment',
                success_url:`${process.env.FRONTEND_URL}/my-tickets?booking_success=true`,
                cancel_url:`${process.env.FRONTEND_URL}/marketplace`,
                metadata:{
                    bookingId: booking._id.toString(),
                    type:'service_booking'
                }
            });
            booking.stripeSessionId= session.id;
            await booking.save();
            return res.status(200).json({ sessionId: session.id, url: session.url });
        }
        res.status(201).json({ message: 'Booking created successfully', booking });
    }catch(error){
        console.error(error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

module.exports = {
    createBooking,
    updateBookingStatus: require('./BookingStatusController').updateBookingStatus,
    getOrganizerBookings: require('./BookingStatusController').getOrganizerBookings,
    getProviderBookings: require('./BookingStatusController').getProviderBookings,
    getBookingById: require('./BookingStatusController').getBookingById
}