const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['new_event', 'booking_request', 'booking_accepted', 'booking_rejected', 'new_follower'],
        required: true
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    // Lien optionnel vers la ressource concernée
    refModel: { type: String, enum: ['Event', 'Booking', 'User'] },
    refId: { type: mongoose.Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
