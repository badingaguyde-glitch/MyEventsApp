var mongoose = require('mongoose');
var User = mongoose.model('User');
var Ticket = mongoose.model('Ticket');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { publishToQueue } = require('../config/rabbitmq');

const verificationCodes = new Map();
const resetPasswordCodes = new Map();


const generateRegistrationCode = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        verificationCodes.set(email, {
            code,
            expiresAt: Date.now() + 10 * 60 * 1000
        });
        
        publishToQueue('email_queue', {
            type: 'registration_code_email',
            email,
            code
        });
        
        res.status(200).json({ message: 'Verification code sent' });
    } catch (error) {
        console.error('generateRegistrationCode error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const checkEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ message: 'Email and code are required' });
        }
        
        const record = verificationCodes.get(email);
        if (!record) {
            return res.status(400).json({ message: 'No verification code found for this email' });
        }
        
        if (Date.now() > record.expiresAt) {
            verificationCodes.delete(email);
            return res.status(400).json({ message: 'Verification code expired' });
        }
        
        if (record.code !== code.toString()) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }
        
        verificationCodes.delete(email);
        res.status(200).json({ message: 'Code verified successfully' });
    } catch (error) {
        console.error('checkEmail error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = { id: user._id.toString(), role: user.role, email: user.email, plan: user.plan || 'free' };
        next();
    } catch (error) {
        console.error('Auth error: ', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const requireAdminOrOwner = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'event_organizer' && req.user.id !== req.event.organizer.toString()) {
        return res.status(403).json({ message: 'Admin or event organizer access required' });
    }
    next();
};
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

const registerUser = async (req, res) => {
    try {
        const { name, lastName, email, password, interests } = req.body;

        if (!name || !lastName || !email || !password || !interests) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        const salt = await bcrypt.genSalt(10);
        const hasshedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name, lastName, email, password: hasshedPassword, interests: interests || []
        });
        if (user) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
            publishToQueue('email_queue', {
                type: 'welcome_email',
                user: {
                    name: user.name,
                    lastName: user.lastName,
                    email: user.email
                }
            });
            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    lastName: user.lastName,
                    email: user.email,
                    interests: user.interests,
                    role: user.role,
                    plan: user.plan || 'free'
                }
            });
        }
    } catch (error) {
        console.error('register error: ', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        res.json({
            _id: user._id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            interests: user.interests,
            role: user.role,
            plan: user.plan || 'free',
            token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' }),
            tickets: user.myTickets
        });
    } catch (error) {
        console.error('login error: ', error);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        user.name = req.body.name || user.name;
        user.lastName = req.body.lastName || user.lastName;
        user.email = req.body.email || user.email;
        user.interests = req.body.interests || user.interests;


        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            interests: updatedUser.interests,
            role: updatedUser.role,
            token: jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            message: 'Server error during profile update',
            error: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await Ticket.deleteMany({ user: user._id });
        events = await Event.find({ organizer: user._id });
        if (events.length > 0) {
            await Event.deleteMany({ organizer: user._id });
        }
        publishToQueue('email_queue', {
            type: 'user_deletion_email',
            user: {
                name: user.name,
                lastName: user.lastName,
                email: user.email
            }
        });
        await user.deleteOne();
        res.json({ message: 'User and associated tickets and events deleted successfully' });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            message: 'Server error during user deletion',
            error: error.message
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        resetPasswordCodes.set(email, {
            code,
            expiresAt: Date.now() + 10 * 60 * 1000
        });
        
        publishToQueue('email_queue', {
            type: 'reset_password_code_email',
            email,
            code
        });
        
        res.status(200).json({ message: 'Reset code sent' });
    } catch (error) {
        console.error('forgotPassword error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ message: 'Email and code are required' });
        }
        
        const record = resetPasswordCodes.get(email);
        if (!record) {
            return res.status(400).json({ message: 'No reset code found for this email' });
        }
        
        if (Date.now() > record.expiresAt) {
            resetPasswordCodes.delete(email);
            return res.status(400).json({ message: 'Reset code expired' });
        }
        
        if (record.code !== code.toString()) {
            return res.status(400).json({ message: 'Invalid reset code' });
        }
        
        res.status(200).json({ message: 'Reset code verified successfully' });
    } catch (error) {
        console.error('verifyResetCode error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({ message: 'Email, code, and new password are required' });
        }
        
        const record = resetPasswordCodes.get(email);
        if (!record) {
            return res.status(400).json({ message: 'No reset session found for this email' });
        }
        
        if (Date.now() > record.expiresAt) {
            resetPasswordCodes.delete(email);
            return res.status(400).json({ message: 'Reset session expired' });
        }
        
        if (record.code !== code.toString()) {
            return res.status(400).json({ message: 'Invalid code' });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        
        resetPasswordCodes.delete(email);
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('resetPassword error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    generateRegistrationCode,
    checkEmail,
    registerUser,
    login,
    updateProfile,
    deleteUser,
    requireAuth,
    requireAdminOrOwner,
    requireAdmin,
    forgotPassword,
    verifyResetCode,
    resetPassword
};