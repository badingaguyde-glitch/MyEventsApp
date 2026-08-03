/**
 * pushHelper.js
 * Sends push notifications via the Expo Push Notification API.
 * No SDK needed server-side — plain HTTP POST to exp.host.
 */
const https = require('https');

/**
 * Sends one or more push notifications.
 * @param {Array<{to: string, title: string, body: string, data?: object}>} messages
 */
const sendExpoPushNotifications = (messages) => {
    if (!messages || messages.length === 0) return;

    // Filter only valid Expo push tokens
    const validMessages = messages.filter(
        m => m.to && typeof m.to === 'string' && m.to.startsWith('ExponentPushToken[')
    );
    if (validMessages.length === 0) return;

    const payload = JSON.stringify(validMessages);

    const options = {
        hostname: 'exp.host',
        path: '/--/api/v2/push/send',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                const errors = (parsed.data || []).filter(r => r.status === 'error');
                if (errors.length > 0) {
                    console.warn('[PushHelper] Some notifications failed:', JSON.stringify(errors));
                }
            } catch (_) {}
        });
    });

    req.on('error', (e) => {
        console.error('[PushHelper] HTTP error:', e.message);
    });

    req.write(payload);
    req.end();
};

module.exports = { sendExpoPushNotifications };
