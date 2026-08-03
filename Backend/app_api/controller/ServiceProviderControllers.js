const mongoose = require('mongoose');
const ServiceProvider = mongoose.model('ServiceProvider');
const User = mongoose.model('User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const upsertProviderProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { businessName, serviceType, bio, city, address, portfolio, rates, paymentMethods, stripeAccountId } = req.body;

        if (!businessName || !serviceType || !bio || !city || !rates || !rates.price) {
            return res.status(400).json({ message: 'Missing required profile fields' });
        }

        let provider = await ServiceProvider.findOne({ user: userId });
        if (provider) {
            provider.businessName = businessName;
            provider.serviceType = serviceType;
            provider.bio = bio;
            provider.location = { city, address };
            provider.portfolio = portfolio || [];
            provider.rates = rates;
            provider.paymentMethods = paymentMethods || ['offline'];
            if (stripeAccountId) provider.stripeAccountId = stripeAccountId;
            await provider.save();
        } else {
            provider = await ServiceProvider.create({
                user: userId,
                businessName,
                serviceType,
                bio,
                location: { city, address },
                portfolio: portfolio || [],
                rates,
                paymentMethods: paymentMethods || ['offline'],
                stripeAccountId
            });
            await User.findByIdAndUpdate(userId, { role: 'service_provider' });
        }

        res.status(200).json({ message: 'Profile updated successfully', provider });
    } catch (error) {
        console.error('upsertProviderProfile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getProviders = async (req, res) => {
    try {
        const { type, city, minPrice, maxPrice, minRating } = req.query;
        let query = {};

        if (type) query.serviceType = type;
        if (city) query['location.city'] = { $regex: city, $options: 'i' };
        
        if (minPrice || maxPrice) {
            query['rates.price'] = {};
            if (minPrice) query['rates.price'].$gte = Number(minPrice);
            if (maxPrice) query['rates.price'].$lte = Number(maxPrice);
        }

        if (minRating) query.ratingAverage = { $gte: Number(minRating) };

        const providers = await ServiceProvider.find(query)
            .sort({ visibilityTier: -1, ratingAverage: -1 })
            .populate('user', 'name lastName email');
        res.status(200).json(providers);
    } catch (error) {
        console.error('getProviders error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getProviderById = async (req, res) => {
    try {
        const provider = await ServiceProvider.findById(req.params.id)
            .populate('user', 'name lastName email')
            .populate('reviews.user', 'name lastName');
            
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }
        res.status(200).json(provider);
    } catch (error) {
        console.error('getProviderById error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating || !comment) {
            return res.status(400).json({ message: 'Rating and comment are required' });
        }

        const provider = await ServiceProvider.findById(req.params.id);
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        const newReview = {
            user: req.user.id,
            rating: Number(rating),
            comment
        };

        provider.reviews.push(newReview);
        await provider.calculateRatingAverage();

        res.status(201).json({ message: 'Review added successfully', provider });
    } catch (error) {
        console.error('addReview error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateAvailability = async (req, res) => {
    try {
        const { unavailableDates } = req.body;
        const provider = await ServiceProvider.findOne({ user: req.user.id });
        
        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }

        provider.unavailableDates = unavailableDates.map(date => new Date(date));
        await provider.save();

        res.status(200).json({ message: 'Availability updated successfully', unavailableDates: provider.unavailableDates });
    } catch (error) {
        console.error('updateAvailability error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const createPremiumSubscriptionSession = async (req, res) => {
    try {
        const provider = await ServiceProvider.findOne({ user: req.user.id });
        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Abonnement Visibilité Premium - MyEventsApp',
                        description: 'Affichez votre profil en haut de la marketplace de prestataires',
                    },
                    unit_amount: 2999, // 29.99 €
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/provider-dashboard?success=premium`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/provider-dashboard?cancel=premium`,
            metadata: {
                providerId: provider._id.toString(),
                type: 'provider_premium_upgrade'
            }
        });

        res.status(200).json({ id: session.id, url: session.url });
    } catch (error) {
        console.error('createPremiumSubscriptionSession error:', error);
        res.status(500).json({ message: 'Stripe error', error: error.message });
    }
};

module.exports = {
    upsertProviderProfile,
    getProviders,
    getProviderById,
    addReview,
    updateAvailability,
    createPremiumSubscriptionSession
};
