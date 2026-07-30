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
    ticketTemplate: {
        layoutType: { type: String, enum: ['classic', 'modern', 'badge'], default: 'classic' },
        showEventImage: { type: Boolean, default: true },
        showOrganizerLogo: { type: Boolean, default: false },
        showPrice: { type: Boolean, default: true },
        showLocationDetails: { type: Boolean, default: true },

        primaryColor: { type: String, default: '#1e3c72' },
        textColor: { type: String, default: '#333333' },
        backgroundColor: { type: String, default: '#ffffff' },
        accentColor: { type: String, default: '#ff4c3b' },
        borderColor: { type: String, default: '#e2e8f0' },

        fontFamily: { type: String, enum: ['Helvetica', 'Courier', 'Times-Roman'], default: 'Helvetica' },
        titleFontSize: { type: Number, default: 22 },
        bodyFontSize: { type: Number, default: 11 },

        customTitle: { type: String, default: '' },
        customNotes: { type: String, default: '' },
        termsAndConditions: { type: String, default: '' },

        sponsorLogoUrl: { type: String, default: '' }
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);