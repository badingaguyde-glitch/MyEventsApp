const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    event: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event', 
        required: true 
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    content: { 
        type: String, 
        trim: true
        // Not required anymore — a message can be media-only
    },
    mediaUrl:  { type: String,  default: null },
    mediaType: { type: String,  enum: ['image', 'video', 'file'], default: null },
    fileName:  { type: String,  default: null },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
