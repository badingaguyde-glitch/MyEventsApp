var Ticket=require('./Ticket');

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{type:String, required:true, trim: true},
    lastName:{type:String, required:true, trim: true},
    email:{type:String, required:true, trim: true, unique: true},
    password:{type:String, required:true, trim: true},
    interests:[{type:String, trim: true}],
    role:{type:String, required:true, trim: true, enum:['user', 'admin', 'event_organizer'], default:'user'},
    createdAt:{type:Date, default:Date.now},
    myTickets:[{type:mongoose.Schema.Types.ObjectId, ref:'Ticket'}]
});

module.exports = mongoose.model('User', userSchema);