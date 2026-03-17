var mongoose=require('mongoose');
var User=mongoose.model('User');
var Ticket=mongoose.model('Ticket');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Fetch full user from DB so req.user.role is always available
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = { id: user._id.toString(), role: user.role, email: user.email };
        next();
    } catch (error) {
        console.error('Auth error: ', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const requireAdminOrOwner=(req,res,next)=>{
    if(req.user.role !== 'admin' && req.user.role !== 'event_organizer'){
        return res.status(403).json({message:'Admin or event organizer access required'});
    }
    next();
};
const requireAdmin=(req,res,next)=>{
    if(req.user.role !== 'admin'){
        return res.status(403).json({message:'Admin access required'});
    }
    next();
};

const registerUser= async (req, res)=>{
    try{
        const {name, lastName, email, password, interests}= req.body;

        if(!name || !lastName || !email || !password || !interests){
            return res.status(400).json({message:'All fields are required'});
        }
        const userExists= await User.findOne({email});
        if(userExists){
            return res.status(400).json({message:'Email already in use'});
        }
        const salt= await bcrypt.genSalt(10);
        const hasshedPassword= await bcrypt.hash(password,salt);

        const user= await User.create({
            name, lastName, email, password:hasshedPassword, interests:interests || []
        });
        if(user){
            const token= jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn:'1d'});
            res.status(201).json({
                message:'User registered successfully',
                token,
                user:{
                    id:user._id,
                    name:user.name,
                    lastName:user.lastName,
                    email:user.email,
                    interests:user.interests,
                    role:user.role
                }
            });
        }
    } catch (error){
        console.error('register error: ',error);
        res.status(500).json({message:'Server error', error: error.message});
    }
};

const login=async (req, res)=>{
    try{
        const {email, password}=req.body;
        if(!email || !password){
            return res.status(400).json({message:'Email and password are required'});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({message:'Invalid email or password'});
        }
        const isPasswordMatch= await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(401).json({message:'Invalid email or password'});
        }
        res.json({
            _id:user._id,
            name:user.name,
            lastName:user.lastName,
            email:user.email,
            interests:user.interests,
            role:user.role,
            token: jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn:'1d'}),
            tickets:user.myTickets
        });
    }catch(error){
        console.error('login error: ',error);
        res.status(500).json({message:'Server error during login', error: error.message});
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.email = req.body.email || user.email;
        user.interests = req.body.interests || user.interests;

        // Update password if provided
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            interests: updatedUser.interests,
            role: updatedUser.role,
            token: jwt.sign({id:updatedUser._id}, process.env.JWT_SECRET, {expiresIn:'1d'})
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            message: 'Server error during profile update',
            error: error.message
        });
    }
};

const deleteUser = async(req,res)=>{
    try{
        const user= await User.findById(req.user.id);
        if(!user){
            return res.status(404).json({message:'User not found'});
        }

        await Ticket.deleteMany({user:user._id});
        await user.deleteOne();
        res.json({message:'User and associated tickets deleted successfully'});
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            message: 'Server error during user deletion',
            error: error.message
        });
    }
};

module.exports={
    registerUser,
    login,
    updateProfile,
    deleteUser,
    requireAuth,
    requireAdminOrOwner,
    requireAdmin
};