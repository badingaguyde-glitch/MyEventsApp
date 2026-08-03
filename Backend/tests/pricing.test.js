const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const User = require('../app_api/models/User');
const Event = require('../app_api/models/Event');
const Ticket = require('../app_api/models/Ticket');
require('../app_api/models/Notification');
const { createEvent } = require('../app_api/controller/EventControllers');
const { bulkCancelTickets } = require('../app_api/controller/TicketControllers');

// Configure test environment
require('dotenv').config();

const dbURI = process.env.MONGODB_URI;

test.describe('BANTU Pricing Tiers & Business Logic Integration Tests', () => {
  let dbConnection;
  let testFreeUser;
  let testEnterpriseUser;
  let testCoOrganizer;

  test.before(async () => {
    // Connect to Atlas test database
    if (mongoose.connection.readyState === 0) {
      dbConnection = await mongoose.connect(dbURI);
    }
    
    // Clean up any old test users
    await User.deleteMany({ email: /@test-pricing-bantu\.com$/ });
    await Event.deleteMany({ title: /Test Pricing Event/ });

    // Create test accounts
    testFreeUser = await User.create({
      name: 'Free',
      lastName: 'Organizer',
      email: 'free@test-pricing-bantu.com',
      password: 'password123',
      role: 'event_organizer',
      plan: 'free',
      interests: ['Tech']
    });

    testEnterpriseUser = await User.create({
      name: 'Enterprise',
      lastName: 'Organizer',
      email: 'enterprise@test-pricing-bantu.com',
      password: 'password123',
      role: 'event_organizer',
      plan: 'enterprise',
      interests: ['Music']
    });

    testCoOrganizer = await User.create({
      name: 'Co',
      lastName: 'Organizer',
      email: 'co@test-pricing-bantu.com',
      password: 'password123',
      role: 'event_organizer',
      plan: 'free',
      interests: ['Arts']
    });
  });

  test.after(async () => {
    // Clean up database
    await User.deleteMany({ email: /@test-pricing-bantu\.com$/ });
    await Event.deleteMany({ title: /Test Pricing Event/ });
    await mongoose.connection.close();
    
    // Force exit process to prevent hanging due to background Redis / RabbitMQ connections
    setTimeout(() => {
      process.exit(0);
    }, 500);
  });

  test('Free organizer should NOT be allowed to create events with capacity > 100', async () => {
    // Mock req and res objects
    const req = {
      body: {
        title: 'Test Pricing Event (Large)',
        description: 'Large event description',
        category: ['Tech'],
        date: new Date(Date.now() + 86400000), // tomorrow
        time: '18:00',
        location: { venue: 'Hall', address: '123 St', city: 'NYC' },
        capacity: 150, // More than 100 limit for free
        price: 0
      },
      user: {
        id: testFreeUser._id.toString(),
        role: testFreeUser.role,
        email: testFreeUser.email,
        plan: testFreeUser.plan
      }
    };

    let responseStatus = 0;
    let responseData = null;

    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      }
    };

    await createEvent(req, res);

    assert.strictEqual(responseStatus, 400);
    assert.match(responseData.message, /plus de 100 participants/);
  });

  test('Free organizer should NOT be allowed to add co-organizers / teams', async () => {
    const req = {
      body: {
        title: 'Test Pricing Event (Team)',
        description: 'Team event description',
        category: ['Tech'],
        date: new Date(Date.now() + 86400000),
        time: '18:00',
        location: { venue: 'Hall', address: '123 St', city: 'NYC' },
        capacity: 50,
        price: 0,
        coOrganizers: [testCoOrganizer._id.toString()] // Free user trying to add team members
      },
      user: {
        id: testFreeUser._id.toString(),
        role: testFreeUser.role,
        email: testFreeUser.email,
        plan: testFreeUser.plan
      }
    };

    let responseStatus = 0;
    let responseData = null;

    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      }
    };

    await createEvent(req, res);

    assert.strictEqual(responseStatus, 403);
    assert.match(responseData.message, /exclusive aux comptes Entreprise/);
  });

  test('Enterprise organizer SHOULD be allowed to add teams and events with capacity > 100', async () => {
    const req = {
      body: {
        title: 'Test Pricing Event (Enterprise Ok)',
        description: 'Large enterprise event description',
        category: ['Tech'],
        date: new Date(Date.now() + 86400000),
        time: '18:00',
        location: { venue: 'Hall', address: '123 St', city: 'NYC' },
        capacity: 250, // Capacity > 100 allowed for Enterprise
        price: 0,
        coOrganizers: [testCoOrganizer._id.toString()] // Allowed for Enterprise
      },
      user: {
        id: testEnterpriseUser._id.toString(),
        role: testEnterpriseUser.role,
        email: testEnterpriseUser.email,
        plan: testEnterpriseUser.plan
      }
    };

    let responseStatus = 0;
    let responseData = null;

    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      }
    };

    await createEvent(req, res);

    // If payment creation fee config is present, it might try to create a Stripe session.
    // If feeAmount is 0 (as simulated in plan/configs), response is 201.
    // In any case, it should NOT return 400 (capacity limit) or 403 (co-organizer limit).
    assert.notStrictEqual(responseStatus, 400);
    assert.notStrictEqual(responseStatus, 403);
  });

  test('Non-Enterprise user should NOT be allowed to bulk cancel tickets', async () => {
    const req = {
      body: {
        ticketIds: [new mongoose.Types.ObjectId().toString()]
      },
      user: {
        id: testFreeUser._id.toString(),
        role: testFreeUser.role,
        email: testFreeUser.email,
        plan: testFreeUser.plan // Free
      }
    };

    let responseStatus = 0;
    let responseData = null;

    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      }
    };

    await bulkCancelTickets(req, res);

    assert.strictEqual(responseStatus, 403);
    assert.match(responseData.message, /réservée exclusivement aux comptes Entreprise/);
  });

  test('Enterprise user SHOULD be allowed to bulk cancel tickets', async () => {
    // Create a mock ticket
    const mockTicket = await Ticket.create({
      ticketCode: 'TEST-BULK-CANCEL-123',
      event: new mongoose.Types.ObjectId(),
      user: testFreeUser._id,
      status: 'active',
      price: 0
    });

    const req = {
      body: {
        ticketIds: [mockTicket._id.toString()]
      },
      user: {
        id: testEnterpriseUser._id.toString(),
        role: testEnterpriseUser.role,
        email: testEnterpriseUser.email,
        plan: testEnterpriseUser.plan // Enterprise
      }
    };

    let responseStatus = 0;
    let responseData = null;

    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      }
    };

    await bulkCancelTickets(req, res);

    // Clean up mock ticket
    await Ticket.deleteOne({ _id: mockTicket._id });

    assert.strictEqual(responseStatus, 200);
    assert.match(responseData.message, /Remboursement\/annulation en masse/);
  });
});
