const qrCode = require('qrcode');
require('dotenv').config();

function emailWrapper(content) {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const logoUrl = `${backendUrl}/logo.jpg`;

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
            <img src="${logoUrl}" alt="BANTU MyEvents">
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

/**
 * Génère le payload d'e-mail structuré attendu par le QueueManager (.NET 10)
 * à partir du message interne du backend.
 */
async function generateEmailPayload(messageData) {
    const { type, user, event, ticket, email, code, receiptUrl } = messageData;
    let to = "";
    let subject = "";
    let htmlContent = "";

    if (type === 'welcome_email') {
        to = user.email;
        subject = 'Welcome to MyEvents App!';
        htmlContent = emailWrapper(`
            <h1>Welcome, ${user.name}!</h1>
            <p>We are thrilled to have you join <span class="highlight">BANTU MyEvents</span>.</p>
            <p>Your account has been successfully created. You can now explore and participate in the best events near you.</p>
            <a href="${process.env.FRONTEND_URL || '#'}" class="button">Explore Events</a>
        `);
    } 
    
    else if (type === 'ticket_purchase_email') {
        to = user.email;
        subject = `Your ticket for ${event.title}`;
        const qrData = ticket.code.toString();
        // Génération du QR code en base64 pour l'injecter directement dans le corps HTML
        const qrImage = await qrCode.toDataURL(qrData);

        htmlContent = emailWrapper(`
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
                <img src="${qrImage}" alt="Access QR Code" />
                <p style="font-size: 12px; color: #a0aec0; margin-top: 10px;">Ticket Code: ${ticket.code}</p>
            </div>
            
            <p>See you soon for an unforgettable experience!</p>
        `);
    } 
    
    else if (type === 'event_created_email') {
        to = user.email;
        subject = `Your event "${event.title}" has been created!`;
        htmlContent = emailWrapper(`
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
        `);
    } 
    
    else if (type === 'event_deleted_email') {
        to = user.email;
        subject = `Your event "${event.title}" has been cancelled`;
        htmlContent = emailWrapper(`
            <h1>Event Cancelled</h1>
            <p>Hi ${user.name}, we confirm that your event <span class="highlight">${event.title}</span> has been successfully removed from our platform.</p>
        `);
    } 
    
    else if (type === 'event_updated_email') {
        to = user.email;
        subject = `Update for your event "${event.title}"`;
        htmlContent = emailWrapper(`
            <h1>Event Updated</h1>
            <p>Hi ${user.name}, the changes made to your event <span class="highlight">${event.title}</span> have been saved.</p>
            
            <div class="info-card">
                <p><strong>New Information:</strong></p>
                <ul>
                    <li><strong>Date:</strong> ${new Date(event.date).toLocaleDateString('en-US')}</li>
                    <li><strong>Location:</strong> ${event.location.address}</li>
                </ul>
            </div>
        `);
    } 
    
    else if (type === 'user_deletion_email') {
        to = user.email;
        subject = `Your account has been deleted`;
        htmlContent = emailWrapper(`
            <h1>Goodbye ${user.name}</h1>
            <p>We confirm that your BANTU MyEvents account has been deleted according to your request.</p>
            <p>We hope to see you again soon!</p>
        `);
    } 
    
    else if (type === 'registration_code_email') {
        to = email;
        subject = 'Your verification code';
        htmlContent = emailWrapper(`
            <h1>Account Verification</h1>
            <p>Thank you for joining <span class="highlight">BANTU MyEvents</span>!</p>
            <p>Use the code below to finalize your registration:</p>
            
            <div class="code-display">
                ${code}
            </div>
            
            <p>This code will expire in <span class="highlight">10 minutes</span>. If you did not initiate this request, you can safely ignore this email.</p>
        `);
    } 
    
    else if (type === 'reset_password_code_email') {
        to = email;
        subject = 'Réinitialisation de votre mot de passe';
        htmlContent = emailWrapper(`
            <h1>Réinitialisation de mot de passe</h1>
            <p>Bonjour,</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte <span class="highlight">BANTU MyEvents</span>.</p>
            <p>Veuillez utiliser le code ci-dessous pour procéder au changement :</p>
            
            <div class="code-display">
                ${code}
            </div>
            
            <p>Ce code est valide pendant <span class="highlight">10 minutes</span>. Si vous n'avez pas demandé ce changement, vous pouvez ignorer cet e-mail en toute sécurité.</p>
        `);
    } 
    
    else if (type === 'ticket_pending_email') {
        to = user.email;
        subject = `Action Required: Pay for your ticket for ${event.title}`;
        const timeoutHours = process.env.PAYMENT_TIMEOUT_HOURS || 2;
        htmlContent = emailWrapper(`
            <h1>Ticket Reservation Pending Payment</h1>
            <p>Hi ${user.name}, you have reserved a ticket for <span class="highlight">${event.title}</span>.</p>
            <p>To secure your spot, please complete the payment within the next <strong style="color: #ef4444;">${timeoutHours} hours</strong>.</p>
            <p>If the payment is not completed in time, your reservation will be automatically cancelled and deleted.</p>
            <div style="text-align: center; margin: 25px 0;">
                <a href="${receiptUrl || '#'}" class="button" style="background-color: #f59e0b;">💳 Complete Payment Now</a>
            </div>
        `);
    } 
    
    else if (type === 'event_pending_email') {
        to = user.email;
        subject = `Action Required: Activate your event "${event.title}"`;
        const timeoutHours = process.env.PAYMENT_TIMEOUT_HOURS || 2;
        htmlContent = emailWrapper(`
            <h1>Event Commission Payment Pending</h1>
            <p>Hi ${user.name}, your event <span class="highlight">${event.title}</span> has been created.</p>
            <p>To publish it and make it visible to the public, please pay the creation fee within the next <strong style="color: #ef4444;">${timeoutHours} hours</strong>.</p>
            <p>If the payment is not completed in time, your event request will be automatically deleted.</p>
            <div style="text-align: center; margin: 25px 0;">
                <a href="${receiptUrl || '#'}" class="button" style="background-color: #f59e0b;">💳 Pay Event Fee Now</a>
            </div>
        `);
    } 
    
    else if (type === 'ticket_expired_email') {
        to = user.email;
        subject = `Ticket Reservation Expired: ${event.title}`;
        htmlContent = emailWrapper(`
            <h1 style="color: #ef4444;">Reservation Cancelled</h1>
            <p>Hi ${user.name}, the time limit to pay for your ticket for <span class="highlight">${event.title}</span> has exceeded.</p>
            <p>Since the payment was not received within the required timeframe, your ticket reservation (Code: <strong>${ticket.code}</strong>) has expired and has been deleted.</p>
            <p>If you still wish to attend, please visit the event page and reserve a new ticket.</p>
        `);
    } 
    
    else if (type === 'event_expired_email') {
        to = user.email;
        subject = `Event Registration Expired: "${event.title}"`;
        htmlContent = emailWrapper(`
            <h1 style="color: #ef4444;">Event Registration Cancelled</h1>
            <p>Hi ${user.name}, the time limit to pay the activation fee for your event <span class="highlight">${event.title}</span> has exceeded.</p>
            <p>Since the activation fee was not paid within the required timeframe, your event creation request has expired and was deleted from our database.</p>
            <p>If you still wish to publish this event, please create a new event request and complete the payment.</p>
        `);
    } 
    
    else {
        console.log('Type de message inconnu pour la génération d\'email:', type);
        return null;
    }

    return {
        To: to,
        Subject: subject,
        Body: htmlContent,
        SenderName: "BANTU MyEvents"
    };
}

module.exports = { generateEmailPayload };