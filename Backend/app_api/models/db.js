require('dotenv').config();

var mongoose = require('mongoose');

var dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI);

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