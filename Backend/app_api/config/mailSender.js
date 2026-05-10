const nodeMailer = require('nodemailer');
const amqplib = require('amqplib');
const qrCode = require('qrcode');
const path = require('path');
require('dotenv').config();

const LOGO_ATTACHMENT = {
    filename: 'logo.jpg',
    path: path.join(__dirname, '../../public/logo.jpg'),
    cid: 'logo'
};

function emailWrapper(content) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f7f9; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 30px; text-align: center; }
        .header img { max-height: 60px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
        .content { padding: 40px; }
        .footer { background-color: #f9f9f9; padding: 30px; text-align: center; font-size: 13px; color: #888; border-top: 1px solid #edf2f7; }
        .button { display: inline-block; padding: 14px 28px; background-color: #3182ce; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 25px; transition: background-color 0.2s; }
        h1 { color: #2d3748; font-size: 26px; margin-top: 0; font-weight: 700; }
        p { margin: 16px 0; color: #4a5568; }
        .highlight { color: #3182ce; font-weight: 600; }
        .info-card { background-color: #f7fafc; border-radius: 10px; padding: 25px; margin: 25px 0; border-left: 4px solid #3182ce; }
        .code-display { font-size: 36px; font-weight: 800; color: #2b6cb0; letter-spacing: 8px; text-align: center; margin: 30px 0; padding: 25px; background: #ebf8ff; border-radius: 12px; border: 2px dashed #bee3f8; }
        .qr-section { text-align: center; margin: 35px 0; padding: 20px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; }
        .qr-section img { max-width: 200px; display: block; margin: 0 auto; }
        ul { padding-left: 20px; margin: 0; }
        li { margin-bottom: 10px; color: #4a5568; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="cid:logo" alt="BANTU MyEvents">
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} BANTU MyEvents. Making your events unforgettable.</p>
            <p>This is an automated email, please do not reply.</p>
        </div>
    </div>
</body>
</html>`;
}

const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const Queue = 'email_queue';

async function sendEmail({ to, subject, html, attachments }) {
    await transporter.sendMail({
        from: `"${process.env.FROM_NAME}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        attachments
    });
}

async function handleMessage(msg) {
    const { type, user, event, ticket, email, code, receiptUrl } = JSON.parse(msg.content.toString());

    if (type === 'welcome_email') {
        await sendEmail({
            to: user.email,
            subject: 'Welcome to MyEvents App!',
            html: emailWrapper(`
                <h1>Welcome, ${user.name}!</h1>
                <p>We are thrilled to have you join <span class="highlight">BANTU MyEvents</span>.</p>
                <p>Your account has been successfully created. You can now explore and participate in the best events near you.</p>
                <a href="${process.env.FRONTEND_URL || '#'}" class="button">Explore Events</a>
            `),
            attachments: [LOGO_ATTACHMENT]
        });
    } else if (type === 'ticket_purchase_email') {
        const qrData = ticket.code.toString();
        const qrImage = await qrCode.toDataURL(qrData);

        await sendEmail({
            to: user.email,
            subject: `Your ticket for ${event.title}`,
            html: emailWrapper(`
                <h1>Congratulations on your purchase!</h1>
                <p>Hi ${user.name}, your ticket for <span class="highlight">${event.title}</span> is confirmed.</p>
                
                <div class="info-card">
                    <p><strong>Event Details:</strong></p>
                    <ul>
                        <li><strong>Date:</strong> ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
                        <li><strong>Location:</strong> ${event.location.address}</li>
                    </ul>
                </div>
                ${receiptUrl ? `<div style="text-align: center; margin: 20px 0;">
                    <a href="${receiptUrl}" target="_blank" class="button" style="background-color: #48bb78;">Voir mon reçu de paiement</a>
                </div>` : ''}

                <p>Please present this QR Code at the entrance of the event:</p>
                <div class="qr-section">
                    <img src="cid:qrcode" alt="Access QR Code" />
                    <p style="font-size: 12px; color: #a0aec0; margin-top: 10px;">Ticket Code: ${ticket.code}</p>
                </div>
                
                <p>See you soon for an unforgettable experience!</p>
            `),
            attachments: [
                LOGO_ATTACHMENT,
                {
                    filename: 'qrcode.png',
                    path: qrImage,
                    cid: 'qrcode'
                }
            ]
        });
    } else if (type === 'event_created_email') {
        await sendEmail({
            to: user.email,
            subject: `Your event "${event.title}" has been created!`,
            html: emailWrapper(`
                <h1>Success!</h1>
                <p>Hi ${user.name}, your event <span class="highlight">${event.title}</span> has been successfully created.</p>
                
                <div class="info-card">
                    <p><strong>Summary:</strong></p>
                    <ul>
                        <li><strong>Date:</strong> ${new Date(event.date).toLocaleDateString('en-US')}</li>
                        <li><strong>Location:</strong> ${event.location.address}</li>
                    </ul>
                </div>
                ${receiptUrl ? `<div style="text-align: center; margin: 20px 0;">
                    <a href="${receiptUrl}" target="_blank" class="button" style="background-color: #48bb78;">Voir mon reçu de commission</a>
                </div>` : ''}

                <p>It's time to share your event and invite your attendees!</p>
                <a href="${process.env.FRONTEND_URL || '#'}/events/${event.id}" class="button">Manage My Event</a>
            `),
            attachments: [LOGO_ATTACHMENT]
        });
    } else if (type === 'event_deleted_email') {
        await sendEmail({
            to: user.email,
            subject: `Your event "${event.title}" has been cancelled`,
            html: emailWrapper(`
                <h1>Event Cancelled</h1>
                <p>Hi ${user.name}, we confirm that your event <span class="highlight">${event.title}</span> has been successfully removed from our platform.</p>
            `),
            attachments: [LOGO_ATTACHMENT]
        });
    } else if (type === 'event_updated_email') {
        await sendEmail({
            to: user.email,
            subject: `Update for your event "${event.title}"`,
            html: emailWrapper(`
                <h1>Event Updated</h1>
                <p>Hi ${user.name}, the changes made to your event <span class="highlight">${event.title}</span> have been saved.</p>
                
                <div class="info-card">
                    <p><strong>New Information:</strong></p>
                    <ul>
                        <li><strong>Date:</strong> ${new Date(event.date).toLocaleDateString('en-US')}</li>
                        <li><strong>Location:</strong> ${event.location.address}</li>
                    </ul>
                </div>
            `),
            attachments: [LOGO_ATTACHMENT]
        });
    } else if (type === 'user_deletion_email') {
        await sendEmail({
            to: user.email,
            subject: `Your account has been deleted`,
            html: emailWrapper(`
                <h1>Goodbye ${user.name}</h1>
                <p>We confirm that your BANTU MyEvents account has been deleted according to your request.</p>
                <p>We hope to see you again soon!</p>
            `),
            attachments: [LOGO_ATTACHMENT]
        });
    } else if (type === 'registration_code_email') {
        await sendEmail({
            to: email,
            subject: 'Your verification code',
            html: emailWrapper(`
                <h1>Account Verification</h1>
                <p>Thank you for joining <span class="highlight">BANTU MyEvents</span>!</p>
                <p>Use the code below to finalize your registration:</p>
                
                <div class="code-display">
                    ${code}
                </div>
                
                <p>This code will expire in <span class="highlight">10 minutes</span>. If you did not initiate this request, you can safely ignore this email.</p>
            `),
            attachments: [LOGO_ATTACHMENT]
        });
    } else {
        console.log('Unknown message type:', type);
    }
}

async function startConsumer(retries = 5) {
    try {
        const connection = await amqplib.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq');
        const channel = await connection.createChannel();
        await channel.assertQueue(Queue, { durable: true });
        console.log('Waiting for messages in queue:', Queue);

        channel.consume(Queue, async (msg) => {
            if (msg !== null) {
                console.log('Received message:', msg.content.toString());
                try {
                    await handleMessage(msg);
                    channel.ack(msg);
                } catch (err) {
                    console.error('Error processing message:', err);
                    channel.nack(msg, false, false); // Discard the message
                }
            }
        });
    } catch (err) {
        console.error('Error connecting to RabbitMQ:', err);
        if (retries > 0) {
            console.log(`Retrying RabbitMQ connection in 5 seconds... (${retries} retries left)`);
            setTimeout(() => startConsumer(retries - 1), 5000);
        }
    }
}

startConsumer();