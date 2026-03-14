const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    ticketCode:{type:String, required:true, unique: true},
    event:{type:mongoose.Schema.Types.ObjectId, ref:'Event', required:true},
    user:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    status:{type:String, required:true, enum:['active', 'used', 'cancelled'], default:'active'},
    checkInTime:{type:Date},
    checkInBy:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    price:{type:Number, required:true, min:0}
});

ticketSchema.pre('save', async function(next) {
    if (!this.ticketCode) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code;
        let isUnique = false;
        
        while (!isUnique) {
            code = 'TKT-';
            for (let i = 0; i < 8; i++) {
                code += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            const existingTicket = await mongoose.model('Ticket').findOne({ ticketCode: code });
            isUnique = !existingTicket;
        }
        
        this.ticketCode = code;
    }
    next();
});

module.exports = mongoose.model('Ticket', ticketSchema);