const mongoose = require('mongoose');
const User = mongoose.model('User');
const Event = mongoose.model('Event');
const Ticket = mongoose.model('Ticket');
const SocialPost = mongoose.model('SocialPost');
const ChatMessage = mongoose.model('ChatMessage');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { Readable } = require('stream');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Max sizes enforced server-side (client also checks, but backend is authoritative)
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;   // 5 MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

// Multer — store in memory for Cloudinary streaming
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_VIDEO_BYTES + 1024 * 1024 } // allow a tiny margin for zip overhead
});

const uploadBufferToCloudinary = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
        Readable.from(buffer).pipe(stream);
    });
};

/**
 * POST /events/:eventId/chat/upload
 * Accepts a single 'media' field (multipart/form-data).
 * - Images  > 5  MB  → rejected (client should have compressed already, this is a safety net)
 * - Videos  > 100 MB → rejected
 * - Any file type is accepted; zipped archives uploaded by the client are stored as 'raw'
 */
const uploadChatMedia = [upload.single('media'), async (req, res) => {
    try {
        const { eventId } = req.params;

        // Auth check
        const myTicket = await Ticket.findOne({ event: eventId, user: req.user.id });
        const eventObj = await Event.findById(eventId);
        const isOrganizer = eventObj && eventObj.organizer.toString() === req.user.id;
        if (!myTicket && !isOrganizer && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Accès refusé au chat.' });
        }

        if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu.' });

        const { mimetype, size, originalname, buffer } = req.file;
        const isImage = mimetype.startsWith('image/');
        const isVideo = mimetype.startsWith('video/');

        // Server-side size gate
        if (isImage && size > MAX_PHOTO_BYTES) {
            return res.status(413).json({ message: `Image trop volumineuse (max ${MAX_PHOTO_BYTES / 1024 / 1024} MB). Compressez-la avant l'envoi.` });
        }
        if (isVideo && size > MAX_VIDEO_BYTES) {
            return res.status(413).json({ message: `Vidéo trop volumineuse (max ${MAX_VIDEO_BYTES / 1024 / 1024} MB).` });
        }

        // Choose Cloudinary resource type
        const resourceType = isVideo ? 'video' : isImage ? 'image' : 'raw';
        const folder = `chat_media/${eventId}`;

        const uploadResult = await uploadBufferToCloudinary(buffer, {
            resource_type: resourceType,
            folder,
            public_id: `${Date.now()}_${originalname.replace(/\.[^/.]+$/, '')}`
        });

        const mediaType = isImage ? 'image' : isVideo ? 'video' : 'file';

        res.status(200).json({
            mediaUrl: uploadResult.secure_url,
            mediaType,
            fileName: originalname
        });
    } catch (e) {
        console.error('[Chat Upload]', e);
        res.status(500).json({ error: e.message });
    }
}];

// Suivre un organisateur ou un prestataire (Exclusif)
const toggleFollow = async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.user.id;

        if (targetUserId === currentUserId) {
            return res.status(400).json({ message: "Vous ne pouvez pas vous suivre." });
        }

        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) return res.status(404).json({ message: "Utilisateur introuvable." });

        const allowedRoles = ['event_organizer', 'service_provider', 'admin'];
        if (!allowedRoles.includes(targetUser.role)) {
            return res.status(403).json({ message: "Vous ne pouvez suivre que des organisateurs ou des prestataires." });
        }

        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            currentUser.following.pull(targetUserId);
            targetUser.followers.pull(currentUserId);
        } else {
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);
        }

        await currentUser.save();
        await targetUser.save();

        res.status(200).json({ isFollowing: !isFollowing });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// Aimer / Ne plus aimer un événement
const toggleLikeEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Événement introuvable." });

        const isLiked = event.likedBy.includes(userId);

        if (isLiked) {
            event.likedBy.pull(userId);
        } else {
            event.likedBy.push(userId);
        }

        await event.save();
        res.status(200).json({ isLiked: !isLiked, likesCount: event.likedBy.length });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// Publier un post (photo / vidéo)
const createPost = async (req, res) => {
    try {
        const { eventId, mediaType, mediaUrl, caption } = req.body;
        if (!mediaType || !mediaUrl) {
            return res.status(400).json({ message: "mediaType and mediaUrl are required" });
        }

        const post = await SocialPost.create({
            user: req.user.id,
            event: eventId || null,
            mediaType,
            mediaUrl,
            caption
        });

        res.status(201).json(post);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

const uploadPostMedia = [upload.single('media'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu.' });

        const { mimetype, size, originalname, buffer } = req.file;
        const isImage = mimetype.startsWith('image/');
        const isVideo = mimetype.startsWith('video/');

        if (isImage && size > MAX_PHOTO_BYTES) {
            return res.status(413).json({ message: `Image trop volumineuse (max ${MAX_PHOTO_BYTES / 1024 / 1024} MB).` });
        }
        if (isVideo && size > MAX_VIDEO_BYTES) {
            return res.status(413).json({ message: `Vidéo trop volumineuse (max ${MAX_VIDEO_BYTES / 1024 / 1024} MB).` });
        }

        const resourceType = isVideo ? 'video' : isImage ? 'image' : 'raw';
        const folder = `social_media/${req.user.id}`;

        const uploadResult = await uploadBufferToCloudinary(buffer, {
            resource_type: resourceType,
            folder,
            public_id: `${Date.now()}_${originalname.replace(/\.[^/.]+$/, '')}`
        });

        const mediaType = isImage ? 'image' : isVideo ? 'video' : 'file';

        res.status(200).json({
            mediaUrl: uploadResult.secure_url,
            mediaType,
            fileName: originalname
        });
    } catch (e) {
        console.error('[Post Media Upload]', e);
        res.status(500).json({ error: e.message });
    }
}];

// Obtenir le fil d'actualités (Posts des comptes suivis + posts personnels)
const getSocialFeed = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentUser = await User.findById(userId);

        const posts = await SocialPost.find({
            $or: [
                { user: { $in: currentUser.following } },
                { user: userId }
            ]
        })
        .sort({ createdAt: -1 })
        .populate('user', 'name lastName email')
        .populate('event', 'title date location')
        .populate('comments.user', 'name lastName');

        res.status(200).json(posts);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// Aimer / Commenter un post
const toggleLikePost = async (req, res) => {
    try {
        const post = await SocialPost.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post introuvable" });

        const isLiked = post.likes.includes(req.user.id);
        if (isLiked) post.likes.pull(req.user.id);
        else post.likes.push(req.user.id);

        await post.save();
        res.status(200).json({ isLiked: !isLiked, likesCount: post.likes.length });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

const addCommentToPost = async (req, res) => {
    try {
        const { content } = req.body;
        const post = await SocialPost.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post introuvable" });

        post.comments.push({ user: req.user.id, content });
        await post.save();

        const updatedPost = await SocialPost.findById(post._id).populate('comments.user', 'name lastName');
        res.status(201).json(updatedPost.comments);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// Retrouver les personnes rencontrées lors d'un événement (seulement si profil public)
const getEventAttendees = async (req, res) => {
    try {
        const { eventId } = req.params;
        
        const myTicket = await Ticket.findOne({ event: eventId, user: req.user.id });
        const eventObj = await Event.findById(eventId);
        const isOrganizer = eventObj && eventObj.organizer.toString() === req.user.id;

        if (!myTicket && !isOrganizer && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Vous devez participer à cet événement ou en être l'organisateur." });
        }

        const tickets = await Ticket.find({ event: eventId, status: { $in: ['active', 'used'] } })
            .populate('user', 'name lastName email following followers isProfilePublic role');

        const attendees = tickets
            .map(t => t.user)
            .filter(user => user && (user.isProfilePublic === true || user._id.toString() === req.user.id))
            .filter((value, index, self) => 
                value && self.findIndex(u => u._id.toString() === value._id.toString()) === index
            );

        res.status(200).json(attendees);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// Récupérer les messages du chat d'un événement
const getEventMessages = async (req, res) => {
    try {
        const { eventId } = req.params;

        const myTicket = await Ticket.findOne({ event: eventId, user: req.user.id });
        const eventObj = await Event.findById(eventId);
        const isOrganizer = eventObj && eventObj.organizer.toString() === req.user.id;

        if (!myTicket && !isOrganizer && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Vous devez participer à cet événement pour rejoindre le chat." });
        }

        const messages = await ChatMessage.find({ event: eventId })
            .sort({ createdAt: 1 })
            .populate('user', 'name lastName role');

        res.status(200).json(messages);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// Envoyer un message dans le chat (texte ou média)
const sendEventMessage = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { content, mediaUrl, mediaType, fileName } = req.body;

        // Must have at least text or a media URL
        if (!content && !mediaUrl) {
            return res.status(400).json({ message: 'Un message doit contenir du texte ou un média.' });
        }

        const myTicket = await Ticket.findOne({ event: eventId, user: req.user.id });
        const eventObj = await Event.findById(eventId);
        const isOrganizer = eventObj && eventObj.organizer.toString() === req.user.id;

        if (!myTicket && !isOrganizer && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Vous n'avez pas l'autorisation d'envoyer des messages." });
        }

        const message = await ChatMessage.create({
            event: eventId,
            user: req.user.id,
            content: content || null,
            mediaUrl: mediaUrl || null,
            mediaType: mediaType || null,
            fileName: fileName || null
        });

        const populated = await ChatMessage.findById(message._id).populate('user', 'name lastName role');
        res.status(201).json(populated);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = {
    toggleFollow,
    toggleLikeEvent,
    createPost,
    getSocialFeed,
    toggleLikePost,
    addCommentToPost,
    getEventAttendees,
    getEventMessages,
    sendEventMessage,
    uploadChatMedia,
    uploadPostMedia
};
