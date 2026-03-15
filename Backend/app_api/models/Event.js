const mongoose = require('mongoose');

const eventSchema= new mongoose.Schema({
    title:{type:String, required:true, trim: true},
    description:{type:String, required:true},
    category:{type:String, required:true, trim: true, enum:['concert', 'theater', 'conference', 'sports', 'work shop', 'other']},
    date:{type:Date, required:true},
    location:{
        venue:{type:String, required:true},
        address:{type:String, required:true},
        city:{type:String, required:true}
    },
    coordinates:{type:[Number], index:'2dsphere'},
    price:{type:Number, required:true, min:0},
    image:{type:String, required:true, default:'default-event.jpg'},
    organizer:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    status:{type:String, required: true, enum:['active', 'cancelled', 'completed'], default:'active'},
    createdAt:{type:Date, default:Date.now}
});

module.exports = mongoose.model('Event', eventSchema);