require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
require('./app_api/models/db');

// Lancement des Workers RabbitMQ en arrière-plan
require('./app_api/config/mailSender');
require('./app_api/config/paymentProcessor');
require('./app_api/config/cleanupProcessor');

var apiRouter = require('./app_api/routes/index');

var cors = require('cors');

var app = express();

app.set('trust proxy', true);

app.use(logger('dev'));
app.use(cors());

// ==========================================
// ⚠️ ROUTE WEBHOOK STRIPE (DOIT ÊTRE AVANT express.json())
// ==========================================
const { stripeWebhook } = require('./app_api/controller/PaymentControllers');
// On utilise express.raw() spécifiquement pour cette route pour que Stripe puisse vérifier la signature
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
// ==========================================

// Parse les autres requêtes en JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);

module.exports = app;
