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

// Renvoyer un statut 204 pour éviter les erreurs de favicon.ico
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);

// Gestion des requêtes non trouvées (404)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Gestionnaire d'erreurs global (500)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

module.exports = app;
