require('dotenv').config();

const dns = require('dns');
// Configurer des DNS publics stables (Google et Cloudflare) pour contourner les problèmes de résolution SRV de certains routeurs/box internet
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

var mongoose = require('mongoose');

var dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI).catch(err => {
    console.error("Mongoose initial connection error:", err.message);
});

mongoose.connection.on('connected', function(){
    console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error',function(){
    console.log("Mongoose connection error ");
});
mongoose.connection.on('disconnected',function(){
    console.log("Mongoose disconnected");
});

process.on('SIGINT',function(){
    mongoose.connection.close(function(){
        console.log("Mongoose disconnected through app termination");
    });
    process.exit(0);
});

require('./User');
require('./Event');
require('./Ticket');
require('./ServiceProvider');
require('./Booking');
require('./SocialPost');
require('./ChatMessage');
require('./Notification');