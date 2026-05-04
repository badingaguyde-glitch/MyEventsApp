const client = require('../config/redis');

const cache = (keyFn, ttl = 60) => {
    return async (req, res, next) => {

        const key = typeof keyFn === "function"
            ? keyFn(req)
            : keyFn;

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

module.exports = cache;