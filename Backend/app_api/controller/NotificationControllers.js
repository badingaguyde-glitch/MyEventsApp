const mongoose = require('mongoose');
const Notification = mongoose.model('Notification');
const User = mongoose.model('User');

// Récupérer toutes les notifications de l'utilisateur connecté (les 50 dernières)
const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('sender', 'name lastName');

        res.status(200).json(notifications);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// Nombre de notifications non lues (pour le badge)
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user.id,
            isRead: false
        });
        res.status(200).json({ count });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// Marquer une notification spécifique comme lue
const markAsRead = async (req, res) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { isRead: true }
        );
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// Marquer toutes les notifications comme lues
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// Sauvegarder le token Expo Push de l'appareil de l'utilisateur
const savePushToken = async (req, res) => {
    try {
        const { expoPushToken } = req.body;
        if (!expoPushToken) {
            return res.status(400).json({ message: 'expoPushToken is required' });
        }
        await User.findByIdAndUpdate(req.user.id, { expoPushToken });
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    savePushToken
};
