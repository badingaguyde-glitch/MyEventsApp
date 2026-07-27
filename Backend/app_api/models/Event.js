const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: [{ type: String, required: true, trim: true }],
    date: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    location: {
        venue: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true }
    },
    coordinates: { type: [Number], index: '2dsphere' },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true, default: 'default-event.jpg' },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coOrganizers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, required: true, enum: ['active', 'cancelled', 'completed', 'pending_payment'], default: 'pending_payment' },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);