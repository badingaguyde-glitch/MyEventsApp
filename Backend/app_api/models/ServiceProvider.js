const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        unique: true 
    },
    businessName: { 
        type: String, 
        required: true, 
        trim: true 
    },
    serviceType: { 
        type: String, 
        required: true, 
        enum: [
            'dj', 'decorator', 'photographer', 'videographer', 'caterer', 
            'animator', 'security', 'chairs_rental', 'tents_rental', 
            'venue', 'music_group'
        ] 
    },
    bio: { 
        type: String, 
        required: true 
    },
    location: {
        city: { type: String, required: true, trim: true },
        address: { type: String, trim: true }
    },
    portfolio: [{
        title: { type: String, required: true },
        description: { type: String },
        link: { type: String }
    }],
    photos: [{ type: String }],
    videos: [{ type: String }],
    rates: {
        price: { type: Number, required: true, min: 0 },
        unit: { type: String, enum: ['hour', 'day', 'event'], default: 'event' }
    },
    unavailableDates: [{ type: Date }],
    paymentMethods: [{ 
        type: String, 
        enum: ['stripe', 'offline'], 
        default: ['offline'] 
    }],
    stripeAccountId: { type: String },
    visibilityTier: { 
        type: String, 
        enum: ['free', 'premium'], 
        default: 'free' 
    },
    premiumExpiresAt: { type: Date },
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    ratingAverage: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

serviceProviderSchema.methods.calculateRatingAverage = function() {
    if (this.reviews.length === 0) {
        this.ratingAverage = 0;
    } else {
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        this.ratingAverage = (sum / this.reviews.length).toFixed(1);
    }
    return this.save();
};

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);