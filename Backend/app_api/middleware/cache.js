const client = require('../config/redis');

const cache = (keyFn, ttl = 60) => {
    return async (req, res, next) => {
        // Si le client Redis n'est pas connecté, on ignore le cache et on continue normalement
        if (!client.isOpen) {
            return next();
        }

        const key = typeof keyFn === "function"
            ? keyFn(req)
            : `${keyFn}_${req.originalUrl}`;

        try {
            const data = await client.get(key);

            if (data) {
                console.log('cache hit for key:', key);
                return res.json(JSON.parse(data));
            }

            const originalJson = res.json.bind(res);

            res.json = async (body) => {
                try {
                    if (client.isOpen) {
                        await client.setEx(key, ttl, JSON.stringify(body));
                        console.log(`cache miss for key: ${key}`);
                    }
                } catch (cacheErr) {
                    console.error(`Failed to write to cache for key ${key}:`, cacheErr.message);
                }
                return originalJson(body);
            };

            next();
        } catch (err) {
            console.error(`Cache read error for key ${key}:`, err.message);
            next(); // Si la lecture échoue, on continue sans planter
        }
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