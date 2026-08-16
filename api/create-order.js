const https = require('https');

const WEBINAR_AMOUNT = 49900;

function readBody(req) {
  if (typeof req.body === 'object' && req.body) return Promise.resolve(req.body);
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Invalid request body.')); } });
  });
}

function razorpayRequest(path, payload) {
  const data = JSON.stringify(payload);
  const token = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
  return new Promise((resolve, reject) => {
    const request = https.request({ hostname: 'api.razorpay.com', path, method: 'POST', headers: { Authorization: `Basic ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, (response) => {
      let output = '';
      response.on('data', (chunk) => { output += chunk; });
      response.on('end', () => { const parsed = output ? JSON.parse(output) : {}; response.statusCode >= 200 && response.statusCode < 300 ? resolve(parsed) : reject(new Error(parsed.error?.description || 'Razorpay order creation failed.')); });
    });
    request.on('error', reject); request.write(data); request.end();
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed.' });
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return res.status(500).json({ message: 'Razorpay is not configured on the server.' });
  try {
    const { name, email, phone } = await readBody(req);
    if (![name, email, phone].every((value) => typeof value === 'string' && value.trim())) return res.status(400).json({ message: 'Name, email, and phone are required.' });
    const order = await razorpayRequest('/v1/orders', { amount: WEBINAR_AMOUNT, currency: 'INR', receipt: `webinar_${Date.now()}`, notes: { attendee_name: name.trim(), attendee_email: email.trim(), attendee_phone: phone.trim(), event: 'Find Your Artistic Voice' } });
    return res.status(200).json({ id: order.id, amount: order.amount, currency: order.currency });
  } catch (error) { return res.status(500).json({ message: error.message || 'Unable to create payment order.' }); }
};
