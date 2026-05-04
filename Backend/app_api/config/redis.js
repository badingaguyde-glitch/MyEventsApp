const { createClient} = require('redis');

const client = createClient({
    url: 'redis://redis:6379'
});

client.on('error', (err) =>console.log('Redis error:', err));

(async ()=>{
    await client.connect();
    console.log('Connected to Redis');
})();

module.exports = client;