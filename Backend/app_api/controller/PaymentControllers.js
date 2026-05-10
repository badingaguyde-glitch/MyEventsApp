const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { publishToQueue } = require('../config/rabbitmq');

/**
 * Crée une session de paiement Stripe (Checkout Session)
 */
const createCheckoutSession = async (req, res) => {
    try {
        const { amount, currency, name, description, metadata, successUrl, cancelUrl } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency || 'eur',
                        product_data: {
                            name: name,
                            description: description,
                        },
                        unit_amount: amount, // Le montant doit être en centimes
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: metadata, // Utilisé pour savoir s'il s'agit d'un ticket ou d'un événement
        });

        res.status(200).json({ url: session.url, sessionId: session.id });
    } catch (error) {
        console.error('Stripe Session Error:', error);
        res.status(500).json({ message: "Erreur lors de la création de la session Stripe", error: error.message });
    }
};

/**
 * Webhook appelé par Stripe lors d'un événement (ex: paiement réussi)
 * Attention : Ce endpoint a besoin du corps de la requête en "raw" (non parsé en JSON)
 * pour vérifier la signature Stripe.
 */
const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // express.raw() place le buffer brut directement dans req.body
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Gérer l'événement Stripe
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // On envoie le traitement lourd vers RabbitMQ pour répondre très vite à Stripe (Timeout)
        publishToQueue('payment_queue', {
            type: 'checkout.session.completed',
            data: session
        });

        console.log("Paiement validé par Stripe, envoyé à RabbitMQ pour traitement");
    }

    // Répondre à Stripe que l'événement a bien été reçu
    res.status(200).json({ received: true });
};

module.exports = {
    createCheckoutSession,
    stripeWebhook
};
