const client = require('../config/redis');

const cache = (keyFn, ttl = 60) => {
    return async (req, res, next) => {

        const key = typeof keyFn === "function"
            ? keyFn(req)
            : `${keyFn}_${req.originalUrl}`;

        const data = await client.get(key);

        if (data) {
            console.log('cache hit for key:', key);
            return res.json(JSON.parse(data));
        }

        const originalJson = res.json.bind(res);

        res.json = async (body) => {
            await client.setEx(key, ttl, JSON.stringify(body));

            console.log(`cache miss for key: ${key}`);
            return originalJson(body);
        };

        next();
    };
};

cache.clearPattern = async (pattern) => {
    try {
        const keys = await client.keys(pattern);
        if (keys && keys.length > 0) {
            await client.del(keys);
            console.log(`Cleared cache keys matching: ${pattern} (${keys.length} keys)`);
        }
    } catch (err) {
        console.error(`Error clearing cache pattern ${pattern}:`, err);
    }
};

module.exports = cache;