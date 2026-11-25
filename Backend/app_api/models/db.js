require('dotenv').config();

const dns = require('dns');
// N'appliquer les DNS publics de contournement que hors de Kubernetes pour préserver CoreDNS en production
if (!process.env.KUBERNETES_SERVICE_HOST && process.env.NODE_ENV !== 'production') {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
}

var mongoose = require('mongoose');

var dbURI = process.env.MONGODB_URI;

const connectWithRetry = () => {
    mongoose.connect(dbURI, {
        serverSelectionTimeoutMS: 5000,
    }).catch(err => {
        console.error("Mongoose connection error, retrying in 5 seconds:", err.message);
        setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

mongoose.connection.on('connected', function(){
    console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error',function(err){
    console.log("Mongoose connection error:", err && err.message ? err.message : err);
});
mongoose.connection.on('disconnected',function(){
    console.log("Mongoose disconnected. Reconnecting in 5s...");
    setTimeout(connectWithRetry, 5000);
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