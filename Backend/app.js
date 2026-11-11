require('dotenv').config();
const mongoose = require('mongoose');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

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

// ==========================================
// 🔍 MIDDLEWARE D'OBSERVABILITÉ TEMPS RÉEL (LENS & K8S)
// ==========================================
app.use((req, res, next) => {
  // Ignorer les sondes Kubernetes régulières et favicon pour ne pas saturer les logs
  if (req.path === '/health' || req.path === '/favicon.ico') {
    return next();
  }

  // 1. Identifiant de corrélation unique par requête
  const requestId = req.headers['x-request-id'] || crypto.randomUUID().slice(0, 8);
  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);

  const startTime = process.hrtime();
  const timestamp = new Date().toLocaleTimeString();

  // 2. Détection de l'utilisateur (via JWT si présent)
  let userIdentifier = 'Guest';
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.decode(authHeader.split(' ')[1]);
      if (decoded && (decoded.id || decoded._id || decoded.email)) {
        userIdentifier = 'User:' + (decoded.email || decoded.id || decoded._id);
      }
    } catch (_) {}
  }

  // 3. Log d'entrée dans le flux
  console.log(`📡 [${timestamp}] [REQ-${requestId}] ➔ ${req.method} ${req.originalUrl} | Client: ${req.ip} | ${userIdentifier}`);

  // 4. Capture et log de fin avec code statut et latence
  res.on('finish', () => {
    const diff = process.hrtime(startTime);
    const durationInMs = ((diff[0] * 1e9 + diff[1]) / 1e6).toFixed(2);
    const status = res.statusCode;
    const icon = status >= 500 ? '❌' : status >= 400 ? '⚠️' : '✅';

    console.log(`${icon} [REQ-${requestId}] ⬅️ ${status} (${durationInMs} ms) | ${req.method} ${req.originalUrl}`);
  });

  next();
});

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

//Route de santé pour kubernetes (Liveness et Readiness Probes)
app.get('/health', (req,res)=> {
  const isDbConnected = mongoose.connection.readyState ===1;
  if (isDbConnected) {
    return res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      db: 'connected'
    });
  }
  return res.status(503).json({
    status: 'error',
    db: 'disconnected'
  });
});

// Middleware to restrict API access to Bantu official Web/Mobile clients
const requireClientSecret = (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  if (req.originalUrl && (req.originalUrl.includes('/pdf') || req.originalUrl.startsWith('/api/payment/success') || req.originalUrl.startsWith('/api/payment/cancel'))) {
    return next();
  }

  const clientKey = req.headers['x-bantu-client-key'];
  const expectedKey = process.env.BANTU_CLIENT_KEY || 'BantuAppClientSecretSecured2026!';
  
  if (clientKey !== expectedKey) {
    return res.status(403).json({
      message: 'Access Denied: Invalid Client Signature. Requests must originate from BANTU official applications.'
    });
  }
  next();
};

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', requireClientSecret, apiRouter);

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
