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
        if (!endpointSecret || endpointSecret === 'whsec_placeholder') {
            const rawBody = req.body.toString();
            event = JSON.parse(rawBody);
            console.log("Stripe Webhook: Bypassing signature verification (development mode).");
        } else {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        }
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

/**
 * Page de succès de paiement affichée à l'utilisateur après redirection Stripe
 */
const paymentSuccess = async (req, res) => {
    const { session_id, clientType } = req.query;
    let isWeb = clientType === 'web';
    let redirectUrl = null;

    if (session_id) {
        try {
            const session = await stripe.checkout.sessions.retrieve(session_id);
            if (session && (session.payment_status === 'paid' || session.status === 'complete')) {
                const metadata = session.metadata;
                if (metadata) {
                    const cache = require('../middleware/cache');
                    const mongoose = require('mongoose');
                    
                    if (metadata.clientType === 'web') {
                        isWeb = true;
                    }

                    if (metadata.type === 'event_commission') {
                        const Event = mongoose.model('Event');
                        const event = await Event.findById(metadata.eventId);
                        if (event && event.status === 'pending_payment') {
                            event.status = 'active';
                            await event.save();
                            console.log(`Success Callback: Sync activated event ${metadata.eventId}`);
                            
                            // Clear cache
                            await cache.clearPattern('events_*');
                            await cache.clearPattern('category_events_*');
                            await cache.clearPattern('nearby_events_*');
                            await cache.clearPattern(`my_events_${metadata.userId}`);
                            await cache.clearPattern(`event_details_*${metadata.eventId}*`);
                            
                            // Send email
                            try {
                                publishToQueue('email_queue', {
                                    type: 'event_created_email',
                                    user: {
                                        name: metadata.userName,
                                        lastName: metadata.userLastName,
                                        email: metadata.userEmail
                                    },
                                    event: {
                                        id: event._id,
                                        title: event.title,
                                        date: event.date,
                                        location: event.location
                                    },
                                    receiptUrl: session.receipt_url || null
                                });
                            } catch (e) {
                                console.error("Failed to queue email:", e);
                            }
                        }
                        // Event creations are always performed via the Web Frontend
                        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                        redirectUrl = `${frontendUrl}/my-events`;

                    } else if (metadata.type === 'ticket') {
                        const Ticket = mongoose.model('Ticket');
                        const ticket = await Ticket.findById(metadata.ticketId);
                        if (ticket && ticket.status === 'pending_payment') {
                            ticket.status = 'active';
                            await ticket.save();
                            console.log(`Success Callback: Sync activated ticket ${metadata.ticketId}`);
                            
                            // Clear cache
                            await cache.clearPattern('tickets_*');
                            await cache.clearPattern(`user_tickets_${metadata.userId}`);
                            await cache.clearPattern('ticket_availability_*');
                            await cache.clearPattern(`ticket_by_code_*${ticket.event}*`);
                            await cache.clearPattern('events_*');
                            await cache.clearPattern('category_events_*');
                            await cache.clearPattern('nearby_events_*');
                            await cache.clearPattern(`event_details_*${ticket.event}*`);
                            
                            // Send email
                            try {
                                publishToQueue('email_queue', {
                                    type: 'ticket_purchase_email',
                                    user: {
                                        name: metadata.userName,
                                        lastName: metadata.userLastName,
                                        email: metadata.userEmail
                                    },
                                    event: {
                                        title: metadata.eventTitle,
                                        date: new Date(metadata.eventDate),
                                        location: JSON.parse(metadata.eventLocation)
                                    },
                                    ticket: {
                                        id: ticket._id,
                                        code: metadata.ticketCode
                                    },
                                    receiptUrl: session.receipt_url || null
                                });
                            } catch (e) {
                                console.error("Failed to queue email:", e);
                            }
                        }
                        if (isWeb) {
                            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                            redirectUrl = `${frontendUrl}/tickets/success`;
                        }
                    } else if (metadata.type === 'plan_upgrade') {
                        const User = mongoose.model('User');
                        const user = await User.findById(metadata.userId);
                        if (user) {
                            user.plan = metadata.plan;
                            await user.save();
                            console.log(`Success Callback: Sync upgraded user ${metadata.userId} to ${metadata.plan}`);
                        }
                        if (isWeb) {
                            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                            redirectUrl = `${frontendUrl}/pricing?success=true`;
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error verifying Stripe session on success redirect:", error);
        }
    }

    if (redirectUrl) {
        return res.redirect(redirectUrl);
    }

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Paiement Réussi</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
            background: linear-gradient(135deg, #111111 0%, #1e1e1e 100%); 
            color: #ffffff;
            display: flex; 
            align-items: center; 
            justify-content: center; 
            height: 100vh; 
            margin: 0; 
        }
        .card { 
            background: rgba(255, 255, 255, 0.05); 
            backdrop-filter: blur(10px);
            padding: 40px; 
            border-radius: 24px; 
            border: 1px solid rgba(255, 255, 255, 0.1);
            text-align: center; 
            max-width: 400px; 
            width: 90%; 
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .icon { 
            width: 80px; 
            height: 80px; 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
            color: white; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            margin: 0 auto 28px; 
            font-size: 40px; 
            box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
        }
        h1 { 
            font-size: 28px; 
            margin: 0 0 16px 0; 
            font-weight: 800;
            background: linear-gradient(to right, #ffffff, #a0aec0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        p { 
            color: #a0aec0; 
            font-size: 16px; 
            margin: 0 0 28px 0; 
            line-height: 1.6; 
        }
        .footer-text {
            font-size: 14px;
            color: #718096;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">✓</div>
        <h1>Paiement Réussi !</h1>
        <p>Merci pour votre achat. Votre transaction a été validée avec succès. Vous pouvez fermer cet onglet et retourner à l'application BANTU MyEvents pour voir les changements.</p>
        <div class="footer-text">BANTU MyEvents App</div>
    </div>
</body>
</html>
    `);
};

/**
 * Crée une session Stripe Checkout pour la mise à niveau de l'abonnement
 */
const createPlanUpgradeSession = async (req, res) => {
    try {
        const { plan, clientType } = req.body;
        const userId = req.user.id;
        const User = require('../models/User');
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        if (plan !== 'pro' && plan !== 'enterprise') {
            return res.status(400).json({ message: "Plan invalide. Choisissez 'pro' ou 'enterprise'." });
        }

        let amount = 1900; // 19.00 EUR par défaut pour Pro
        let name = "Forfait Bantu PRO - 1 Mois";
        let description = "Commission réduite à 2.5%, tickets PDF personnalisables illimités, support prioritaire.";

        if (plan === 'enterprise') {
            amount = 9900; // 99.00 EUR pour Entreprise
            name = "Forfait Bantu ENTREPRISE - 1 Mois";
            description = "Commission minimale de 1% flat, multi-organisateurs, logo sponsor, API dédiée.";
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: name,
                            description: description,
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.protocol}://${req.get('host')}/api/payment/success?session_id={CHECKOUT_SESSION_ID}&clientType=${clientType || 'web'}`,
            cancel_url: `${req.protocol}://${req.get('host')}/api/payment/cancel?clientType=${clientType || 'web'}&type=plan_upgrade`,
            metadata: {
                type: 'plan_upgrade',
                userId: userId.toString(),
                userEmail: user.email,
                userName: user.name,
                userLastName: user.lastName,
                plan: plan,
                clientType: clientType || 'web'
            },
        });

        res.status(200).json({ url: session.url, sessionId: session.id });
    } catch (error) {
        console.error('Plan Upgrade Session Error:', error);
        res.status(500).json({ message: "Erreur lors de la création du paiement d'abonnement", error: error.message });
    }
};

/**
 * Page d'annulation de paiement affichée à l'utilisateur après redirection Stripe
 */
const paymentCancel = (req, res) => {
    const { clientType, type } = req.query;
    if (clientType === 'web') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        if (type === 'ticket') {
            return res.redirect(`${frontendUrl}/my-tickets`);
        } else if (type === 'plan_upgrade') {
            return res.redirect(`${frontendUrl}/pricing`);
        } else {
            return res.redirect(`${frontendUrl}/my-events`);
        }
    }

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Paiement Annulé</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
            background: linear-gradient(135deg, #111111 0%, #1e1e1e 100%); 
            color: #ffffff;
            display: flex; 
            align-items: center; 
            justify-content: center; 
            height: 100vh; 
            margin: 0; 
        }
        .card { 
            background: rgba(255, 255, 255, 0.05); 
            backdrop-filter: blur(10px);
            padding: 40px; 
            border-radius: 24px; 
            border: 1px solid rgba(255, 255, 255, 0.1);
            text-align: center; 
            max-width: 400px; 
            width: 90%; 
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .icon { 
            width: 80px; 
            height: 80px; 
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
            color: white; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            margin: 0 auto 28px; 
            font-size: 40px; 
            box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
        }
        h1 { 
            font-size: 28px; 
            margin: 0 0 16px 0; 
            font-weight: 800;
            background: linear-gradient(to right, #ffffff, #a0aec0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        p { 
            color: #a0aec0; 
            font-size: 16px; 
            margin: 0 0 28px 0; 
            line-height: 1.6; 
        }
        .footer-text {
            font-size: 14px;
            color: #718096;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">✗</div>
        <h1>Paiement Annulé</h1>
        <p>Le paiement a été annulé et aucun frais ne vous a été facturé. Vous pouvez fermer cet onglet et retourner à l'application BANTU MyEvents.</p>
        <div class="footer-text">BANTU MyEvents App</div>
    </div>
</body>
</html>
    `);
};

module.exports = {
    createCheckoutSession,
    stripeWebhook,
    paymentSuccess,
    paymentCancel,
    createPlanUpgradeSession
};
