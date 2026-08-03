const mongoose = require('mongoose');
const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const upsertProviderProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { businessName, serviceType, bio, city, address, portfolio, rates, paymentMethods, stripeAccountId } = req.body;
        if (!businessName || !serviceType || !bio || !city || !address || !portfolio || !rates || !paymentMethods) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        let provider = await ServiceProvider.findOne({ user: userId });
        if (provider) {
            provider.businessName = businessName;
            provider.serviceType = serviceType;
            provider.bio = bio;
            provider.location = { city, address };
            provider.portfolio = portfolio;
            provider.rates = rates;
            provider.paymentMethods = paymentMethods || ['offline'];
            if (stripeAccountId) {
                provider.stripeAccountId = stripeAccountId;
            }
            await provider.save();
        } else {
            provider = await ServiceProvider.create({
                user: userId,
                businessName,
                serviceType,
                bio,
                location: { city, address },
                portfolio,
                rates,
                paymentMethods: paymentMethods || ['offline'],
                stripeAccountId
            });
        }
        await User.findByIdAndUpdate(userId, { role: 'service_provider' });

        res.status(200).json({ message: 'Service provider profile upserted successfully', provider });

    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

const getProviders = async (req, res) => {
    try {
        const { type, city, minPrice, maxPrice } = req.query;
        let query = {};

        if (type) query.serviceType = type;
        if (city) query['location.city'] = { $regex: city, ùoptions: 'i' };
        if (minPrice || maxPrice) {
            query['rates.price'] = {};
            if (minPrice) query['rates.price'].$gte = Number(minPrice);
            if (maxPrice) query['rates.price'].$lte = Number(maxPrice);
        }
        const providers = await ServiceProvider.find(query)
            .sort({visibilityTier: -1, ratingAverage: -1})
            .populate('user','name lastname email');

        res.status(200).json(providers);
    }catch(error){
        console.error(error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

const createPremiumSubscription = async (req, res)=>{
    try{
        const provider =await ServiceProvider.findOne({ user: req.user.id});
        if(!provider){
            return res.status(404).json({message: 'Provider profile nof=t found'});
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data:{
                    currency: 'eur',
                    product_data:{
                        name: 'Abonnement Visibilité Premium - MyEventsApp',
                        description: 'Affichez votre profil en haut de la marketplace de prestataires'
                    },
                    unit_amount: 1999, // 19.99 EUR
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/provider-dashboard?success=premium`,
            cancel_url: `${process.env.FRONTEND_URL}/provider-dashboard?cancel=premium`,
            metadata:{
                providerId: provider._id.toString(),
                type: 'provider_premium_upgrade'
            }
        });

        res.status(200).json({ id: session.id, url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Stripe error', details: error.message });
    }
};

const handlePremiumWebhook = async (providerId)=>{
    const provider = await ServiceProvider.findById(providerId);
    if (provider){
        provider.visibilityTier = 'premium';
        provider.premiumExpiresAt = new Date(Date.now() + 30*24*60*60*1000); // 30 jours
        await provider.save();
        console.log(`Provider ${providerId} upgraded to premium.`);
    }
};

module.exports = {
    upsertProviderProfile,
    getProviders,
    createPremiumSubscription,
    handlePremiumWebhook,
    getProviderById: require('./ServiceProviderController').getProviderById,
    addReview: require('./ServiceProviderController').addReview,
    updateAvailability: require('./ServiceProviderController').updateAvailability
}