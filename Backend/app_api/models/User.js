var Ticket=require('./Ticket');

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{type:String, required:true, trim: true},
    lastName:{type:String, required:true, trim: true},
    email:{type:String, required:true, trim: true, unique: true},
    password:{type:String, required:true, trim: true},
    interests:[{type:String, trim: true}],
    role:{
        type:String, required:true, trim: true, enum:['user', 'admin', 'event_organizer', 'service_provider', 'moderator'], default:'user'
    },
    plan:{type:String, required: true, enum:['free', 'pro', 'enterprise'],default:'free'},
    createdAt:{type:Date, default:Date.now},
    myTickets:[{type:mongoose.Schema.Types.ObjectId, ref:'Ticket'}],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isProfilePublic: { type: Boolean, default: false },
    expoPushToken: { type: String, default: null }
});

module.exports = mongoose.model('User', userSchema);