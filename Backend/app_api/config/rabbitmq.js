const amqp = require('amqplib');

let channel;

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq');
        channel = await connection.createChannel();
        console.log("Connected to RabbitMQ");
    } catch (error) {
        console.error("RabbitMQ Connection error. Retrying in 5 seconds...");
        setTimeout(connectRabbitMQ, 5000); // Réessaie de se connecter après 5 secondes
    }
}

async function publishToQueue(queue, message) {
    if (!channel) {
        console.error("RabbitMQ channel not initialized");
        return;
    }
    try {
        await channel.assertQueue(queue, { durable: true });

        const messageBuffer = Buffer.from(JSON.stringify(message));

        channel.sendToQueue(queue, messageBuffer, { persistent: true });
        console.log(`Message sent to queue: ${queue}`);
    } catch (error) {
        console.error(`Error sending message to queue ${queue}:`, error);
    }
}

connectRabbitMQ();

module.exports = { publishToQueue };
