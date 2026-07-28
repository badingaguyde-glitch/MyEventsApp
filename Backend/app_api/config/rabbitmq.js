const axios = require('axios');
require('dotenv').config();

// Simulation de la file de paiement locale pour éviter les dépendances circulaires au chargement
async function handleLocalPayment(message) {
    try {
        const { processPaymentEvent } = require('./paymentProcessor');
        // Simuler la structure du message attendue par processPaymentEvent
        const mockMsg = {
            content: Buffer.from(JSON.stringify(message))
        };
        await processPaymentEvent(mockMsg);
    } catch (error) {
        console.error("[Local Task] Erreur lors du traitement du paiement :", error);
    }
}

async function publishToQueue(queue, message) {
    // CAS 1 : File de paiement - Traitement local immédiat en tâche de fond
    if (queue === 'payment_queue') {
        console.log(`[Queue] Traitement local asynchrone pour la file: ${queue}`);
        setImmediate(() => {
            handleLocalPayment(message);
        });
        return;
    }

    // CAS 2 : File d'emails - Envoi vers le QueueManager externe (.NET 10)
    if (queue === 'email_queue') {
        console.log(`[Queue] Envoi de l'email vers le QueueManager externe...`);
        try {
            const { generateEmailPayload } = require('./mailSender');
            
            // Générer le payload email structuré (To, Subject, Body, SenderName)
            const emailPayload = await generateEmailPayload(message);
            if (!emailPayload) {
                console.error("[QueueManager] Échec de la génération du payload d'email");
                return;
            }

            const serverURL = process.env.TASK_QUEUE_SERVER_URL || 'https://138-68-146-62.nip.io/api/jobs';
            const apiKey = process.env.TASK_QUEUE_API_KEY;

            if (!apiKey) {
                console.error("[QueueManager] TASK_QUEUE_API_KEY manquante dans le fichier .env");
                return;
            }

            const jobPayload = {
                type: 0, // 0 = Email pour QueueEngine
                priority: 1, // Normale
                payload: JSON.stringify(emailPayload),
                maxRetries: 3,
                queue: "default"
            };

            const response = await axios.post(serverURL, jobPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': apiKey
                },
                timeout: 10000 // Timeout généreux de 10s
            });

            if (response.status === 200 || response.status === 201) {
                console.log(`[QueueManager] Job d'email empilé avec succès. JobId: ${response.data.jobId}`);
            } else {
                console.error(`[QueueManager] Réponse inattendue du serveur: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            console.error("[QueueManager] Erreur lors de l'envoi de la requête au TaskQueueServer :", error.message);
            if (error.response) {
                console.error("[QueueManager] Détails de l'erreur du serveur :", error.response.status, error.response.data);
            }
        }
        return;
    }

    console.warn(`[Queue] File d'attente inconnue: ${queue}`);
}

module.exports = { publishToQueue };
