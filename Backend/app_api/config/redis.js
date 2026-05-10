const { createClient} = require('redis');

const client = createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

client.on('error', (err) =>console.log('Redis error:', err));

(async ()=>{
    await client.connect();
    console.log('Connected to Redis');
})();

module.exports = client;