const https = require('https');
const { getAdminDb } = require('./firebase-admin');
const { getLiveWorkshop } = require('./workshop-catalog');

const MAX_BODY_BYTES = 4096; // 4 KB — more than enough for name + email + phone + workshopId

function readBody(req) {
  if (typeof req.body === 'object' && req.body) return Promise.resolve(req.body);
  return new Promise((resolve, reject) => {
    let raw = '';
    let bytes = 0;
    req.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes > MAX_BODY_BYTES) {
        req.destroy();
        return reject(new Error('Request body too large.'));
      }
      raw += chunk;
    });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch { reject(new Error('Invalid request body.')); }
    });
    req.on('error', reject);
  });
}

function razorpayRequest(path, payload) {
  const data = JSON.stringify(payload);
  const token = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
  return new Promise((resolve, reject) => {
    const request = https.request({ hostname: 'api.razorpay.com', path, method: 'POST', headers: { Authorization: `Basic ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, (response) => {
      let output = '';
      response.on('data', (chunk) => { output += chunk; });
      response.on('end', () => {
        let parsed = {};
        try { parsed = output ? JSON.parse(output) : {}; } catch { return reject(new Error('Invalid response from payment gateway.')); }
        response.statusCode >= 200 && response.statusCode < 300
          ? resolve(parsed)
          : reject(new Error(parsed.error?.description || 'Payment gateway order creation failed.'));
      });
    });
    request.on('error', reject); request.write(data); request.end();
  });
}

function setPaymentCorsHeaders(req, res) {
  const requestOrigin = (req.headers.origin || '').replace(/\/$/, '');
  const allowedOrigins = new Set([
    'https://www.vkartbox.com',
    'https://vkartbox.com',
    ...(process.env.PUBLIC_SITE_ORIGINS || '').split(',').map((o) => o.trim().replace(/\/$/, '')).filter(Boolean),
  ]);
  if (allowedOrigins.has(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
}

module.exports = async (req, res) => {
  setPaymentCorsHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed.' });
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return res.status(500).json({ message: 'Payment gateway is not configured.' });
  try {
    const { name, email, phone, workshopId } = await readBody(req);
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanPhone = typeof phone === 'string' ? phone.trim() : '';
    if (!cleanName || cleanName.length > 120 || !/^\S+@\S+\.\S+$/.test(cleanEmail) || cleanEmail.length > 254 || !cleanPhone || cleanPhone.length > 40) {
      return res.status(400).json({ message: 'Please provide a valid name, email address, and phone number.' });
    }

    const liveWorkshop = await getLiveWorkshop(getAdminDb());
    if (!liveWorkshop) return res.status(409).json({ message: 'There is no live workshop available for registration.' });
    // The browser may only request the currently live server-owned workshop.
    if (workshopId !== liveWorkshop.id) return res.status(409).json({ message: 'This workshop is no longer available. Please refresh and try again.' });
    const { id: targetId, title, price, date: eventDate, time: eventTime } = liveWorkshop;

    const amount = Math.round(price * 100);
    const order = await razorpayRequest('/v1/orders', {
      amount,
      currency: 'INR',
      receipt: `workshop_${Date.now()}`,
      notes: {
        attendee_name: cleanName,
        attendee_email: cleanEmail,
        attendee_phone: cleanPhone,
        workshop_id: targetId,
        event: title,
        event_date: eventDate,
        event_time: eventTime,
        workshop_amount: String(amount),
      },
    });
    return res.status(200).json({ id: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('create-order error:', error);
    return res.status(500).json({ message: 'Unable to create payment order. Please try again.' });
  }
};
