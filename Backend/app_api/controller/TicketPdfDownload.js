const PDFDocument = require('pdfkit');
const qrcode = require('qrcode');
const axios = require('axios');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');

const downloadTicketPDF = async (req, res) => {
    try {
        const ticketId = req.params.id;

        // 1. Récupérer le ticket et l'événement associé (avec l'organisateur)
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: "Billet non trouvé." });

        const event = await Event.findById(ticket.eventId).populate('organizer');
        if (!event) return res.status(404).json({ message: "Événement associé non trouvé." });

        // 2. Déterminer les règles de style selon le plan de l'organisateur
        const isPro = event.organizer && (event.organizer.plan === 'pro' || event.organizer.plan === 'enterprise');

        // Paramètres par défaut (FREE)
        let layoutType = 'classic';
        let showEventImage = true;
        let showPrice = true;
        let showLocationDetails = true;
        let primaryColor = '#1e3c72';
        let textColor = '#333333';
        let backgroundColor = '#ffffff';
        let accentColor = '#ff4c3b';
        let borderColor = '#e2e8f0';
        let fontFamily = 'Helvetica';
        let titleFontSize = 22;
        let bodyFontSize = 11;
        let customTitle = '';
        let customNotes = '';
        let termsAndConditions = '';
        let sponsorLogoUrl = '';

        // Appliquer la personnalisation si l'organisateur est PRO ou Enterprise
        if (isPro && event.ticketTemplate) {
            layoutType = event.ticketTemplate.layoutType || layoutType;
            showEventImage = event.ticketTemplate.showEventImage ?? showEventImage;
            showPrice = event.ticketTemplate.showPrice ?? showPrice;
            showLocationDetails = event.ticketTemplate.showLocationDetails ?? showLocationDetails;
            primaryColor = event.ticketTemplate.primaryColor || primaryColor;
            textColor = event.ticketTemplate.textColor || textColor;
            backgroundColor = event.ticketTemplate.backgroundColor || backgroundColor;
            accentColor = event.ticketTemplate.accentColor || accentColor;
            borderColor = event.ticketTemplate.borderColor || borderColor;
            fontFamily = event.ticketTemplate.fontFamily || fontFamily;
            titleFontSize = event.ticketTemplate.titleFontSize || titleFontSize;
            bodyFontSize = event.ticketTemplate.bodyFontSize || bodyFontSize;
            customTitle = event.ticketTemplate.customTitle || '';
            customNotes = event.ticketTemplate.customNotes || '';
            termsAndConditions = event.ticketTemplate.termsAndConditions || '';
            sponsorLogoUrl = event.ticketTemplate.sponsorLogoUrl || '';
        }

        // 3. Initialiser le document PDF (A4 standard)
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Billet-${ticket.ticketCode || ticket._id}.pdf`);
        doc.pipe(res);

        // Titre de l'événement à afficher
        const ticketTitle = customTitle || event.title;

        // Générer le QR Code sous forme de buffer PNG
        const qrBuffer = await qrcode.toBuffer(ticket.ticketCode || ticket._id.toString(), { margin: 1 });

        // --- RENDER DU STYLE SELON LE LAYOUT ---

        if (layoutType === 'modern') {
            // --- LAYOUT MODERN (Style ticket de cinéma/concert avec bande détachable) ---

            // Fond du ticket
            doc.roundedRect(40, 100, 515, 320, 15).fillColor(backgroundColor).fill();
            doc.roundedRect(40, 100, 515, 320, 15).lineWidth(2).strokeColor(primaryColor).stroke();

            // Bande de couleur sur le côté gauche
            doc.path(`M 40 115 L 40 405 A 15 15 0 0 0 55 420 L 70 420 L 70 100 L 55 100 A 15 15 0 0 0 40 115 Z`)
                .fillColor(primaryColor).fill();

            // Ligne de découpe détachable verticale (à 400px sur la largeur)
            doc.strokeColor(borderColor).lineWidth(1).dash(4, { space: 4 })
                .moveTo(410, 100).lineTo(410, 420).stroke().undash();

            // Contenu Gauche (Détails)
            let leftY = 125;
            if (showEventImage && event.image && event.image !== 'default-event.jpg') {
                try {
                    const imageRes = await axios.get(event.image, { responseType: 'arraybuffer' });
                    doc.image(Buffer.from(imageRes.data), 90, leftY, { width: 300, height: 70, cover: [300, 70] });
                    leftY += 85;
                } catch { }
            }

            doc.fillColor(primaryColor).fontSize(titleFontSize).font(`${fontFamily}-Bold`).text(ticketTitle, 90, leftY, { width: 300 });
            leftY += titleFontSize + 15;

            doc.fillColor(textColor).fontSize(bodyFontSize).font(fontFamily);
            doc.font(`${fontFamily}-Bold`).text('Date :', 90, leftY).font(fontFamily).text(new Date(event.date).toLocaleDateString('fr-FR'), 140, leftY);

            if (showLocationDetails) {
                leftY += 20;
                doc.font(`${fontFamily}-Bold`).text('Lieu :', 90, leftY).font(fontFamily).text(`${event.location.venue}, ${event.location.city}`, 140, leftY, { width: 250 });
            }

            leftY += 20;
            doc.font(`${fontFamily}-Bold`).text('Nom :', 90, leftY).font(fontFamily).text(`${ticket.userName || ''} ${ticket.userLastName || ''}`, 140, leftY);

            if (showPrice) {
                leftY += 20;
                doc.fillColor(accentColor).font(`${fontFamily}-Bold`).text(`${event.price} $`, 90, leftY);
            }

            // Contenu Droit (Partie détachable avec QR Code)
            doc.image(qrBuffer, 425, 140, { width: 115, height: 115 });
            doc.fillColor('#718096').fontSize(8).font('Courier').text(ticket.ticketCode || ticket._id.toString(), 420, 270, { align: 'center', width: 125 });

        } else if (layoutType === 'badge') {
            // --- LAYOUT BADGE (Format Badge de conférence vertical à plier) ---
            doc.roundedRect(150, 100, 295, 450, 10).fillColor(backgroundColor).fill();
            doc.roundedRect(150, 100, 295, 450, 10).lineWidth(3).strokeColor(primaryColor).stroke();

            // Trou de clip de badge au sommet
            doc.circle(297, 120, 8).fillColor('#ffffff').fill();
            doc.circle(297, 120, 8).lineWidth(1.5).strokeColor(primaryColor).stroke();

            let badgeY = 145;
            doc.fillColor(primaryColor).fontSize(14).font(`${fontFamily}-Bold`).text('ACCÈS ÉVÉNEMENT', 160, badgeY, { align: 'center', width: 275 });
            badgeY += 25;

            doc.fillColor(textColor).fontSize(16).font(`${fontFamily}-Bold`).text(ticketTitle, 160, badgeY, { align: 'center', width: 275 });
            badgeY += 45;

            // QR Code grand au milieu
            doc.image(qrBuffer, 217, badgeY, { width: 160, height: 160 });
            badgeY += 175;

            doc.fillColor(primaryColor).fontSize(18).font(`${fontFamily}-Bold`).text(`${ticket.userName || ''} ${ticket.userLastName || ''}`, 160, badgeY, { align: 'center', width: 275 });
            badgeY += 25;

            doc.fillColor(textColor).fontSize(10).font(fontFamily).text(`Date : ${new Date(event.date).toLocaleDateString('fr-FR')}`, 160, badgeY, { align: 'center', width: 275 });
            badgeY += 15;
            doc.font(fontFamily).text(`${event.location.venue}`, 160, badgeY, { align: 'center', width: 275 });

            if (showPrice) {
                badgeY += 25;
                doc.fillColor(accentColor).font(`${fontFamily}-Bold`).fontSize(14).text(`${event.price} $`, 160, badgeY, { align: 'center', width: 275 });
            }

        } else {
            // --- LAYOUT CLASSIC (Format A4 Vertical Standard) ---
            doc.roundedRect(40, 40, 515, 600, borderRadius).fillColor(backgroundColor).fill();
            doc.roundedRect(40, 40, 515, 600, borderRadius).lineWidth(2).strokeColor(primaryColor).stroke();

            // Header coloré
            doc.path(`M ${40 + borderRadius} 40 L ${555 - borderRadius} 40 A ${borderRadius} ${borderRadius} 0 0 1 555 ${40 + borderRadius} L 555 100 L 40 100 L 40 ${40 + borderRadius} A ${borderRadius} ${borderRadius} 0 0 1 ${40 + borderRadius} 40 Z`)
                .fillColor(primaryColor).fill();

            doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('BANTU MyEvents - TICKET', 60, 60, { align: 'center', width: 475 });

            let currentY = 120;
            if (showEventImage && event.image && event.image !== 'default-event.jpg') {
                try {
                    const imageRes = await axios.get(event.image, { responseType: 'arraybuffer' });
                    doc.image(Buffer.from(imageRes.data), 60, currentY, { width: 475, height: 120, cover: [475, 120] });
                    currentY += 140;
                } catch { }
            }

            doc.fillColor(textColor).fontSize(titleFontSize).font(`${fontFamily}-Bold`).text(ticketTitle, 60, currentY, { width: 475 });
            currentY += 40;

            doc.fontSize(bodyFontSize).font(`${fontFamily}-Bold`).text('DATE & HEURE :', 60, currentY)
                .font(fontFamily).text(new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 180, currentY);
            currentY += 20;

            if (showLocationDetails) {
                doc.font(`${fontFamily}-Bold`).text('LIEU :', 60, currentY)
                    .font(fontFamily).text(`${event.location.venue}, ${event.location.address}, ${event.location.city}`, 180, currentY, { width: 350 });
                currentY += 35;
            }

            doc.font(`${fontFamily}-Bold`).text('PARTICIPANT :', 60, currentY)
                .font(fontFamily).text(`${ticket.userName || ''} ${ticket.userLastName || ''} (${ticket.userEmail || ''})`, 180, currentY);
            currentY += 25;

            if (showPrice) {
                doc.font(`${fontFamily}-Bold`).text('TARIF :', 60, currentY)
                    .font(`${fontFamily}-Bold`).fillColor(accentColor).text(`${event.price} $`, 180, currentY);
                currentY += 35;
            }

            // Ligne de découpe
            doc.strokeColor(borderColor).lineWidth(1).dash(4, { space: 4 }).moveTo(60, currentY).lineTo(515, currentY).stroke().undash();
            currentY += 20;

            // QR Code
            doc.image(qrBuffer, 220, currentY, { width: 140, height: 140 });
            currentY += 150;

            doc.fillColor('#718096').fontSize(10).font('Courier').text(`Code Billet : ${ticket.ticketCode || ticket._id}`, 60, currentY, { align: 'center', width: 475 });
        }

        // --- BAS DE PAGE (Commun à tous les layouts, affiché sous la carte principale) ---
        let footerY = 660;

        // Affichage des Notes personnalisées (PRO)
        if (customNotes) {
            doc.fillColor(textColor).fontSize(10).font('Helvetica-Oblique').text(customNotes, 60, footerY, { align: 'center', width: 475 });
            footerY += 30;
        }

        // Affichage des Mentions Légales / CGV (PRO)
        if (termsAndConditions) {
            doc.fillColor('#a0aec0').fontSize(7).font('Helvetica').text(termsAndConditions, 60, footerY, { align: 'center', width: 475 });
            footerY += 40;
        }

        // Logo de Sponsor (PRO)
        if (sponsorLogoUrl) {
            try {
                const sponsorRes = await axios.get(sponsorLogoUrl, { responseType: 'arraybuffer' });
                doc.fillColor(textColor).fontSize(8).font('Helvetica-Bold').text('PARTENAIRE OFFICIEL :', 60, footerY - 15, { align: 'center', width: 475 });
                doc.image(Buffer.from(sponsorRes.data), 247, footerY, { width: 100, height: 40, fit: [100, 40] });
            } catch { }
        }

        doc.end();

    } catch (error) {
        console.error("Erreur génération PDF :", error);
        res.status(500).json({ message: "Erreur lors de la génération du billet PDF", error: error.message });
    }
};

export default { downloadTicketPDF };