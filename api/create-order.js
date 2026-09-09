const https = require('https');
const { getAdminDb } = require('./firebase-admin');

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
    const { name, email, phone, workshopId, webinarId } = await readBody(req);
    if (![name, email, phone].every((value) => typeof value === 'string' && value.trim())) return res.status(400).json({ message: 'Name, email, and phone are required.' });
    
    const rawId = workshopId || webinarId || 'workshop-default';
    const targetId = typeof rawId === 'string' && rawId.trim() ? rawId.trim() : 'workshop-default';

    // This endpoint currently sells one public workshop.  Do not accept an
    // arbitrary item ID (or price/title) from the browser: those values decide
    // what a customer is charged and must be owned by the server.
    if (targetId !== 'workshop-default') {
      return res.status(404).json({ message: 'Workshop not found.' });
    }
    
    let title = 'VKartbox Basic Graphite & Charcoal Workshop — 2026 Sept';
    const price = 2499;
    let eventDate = '12th Sept 2026';
    let eventTime = '2:00 PM - 5:00 PM IST';

    try {
      const workshopSnapshot = await getAdminDb().collection('workshops').doc(targetId).get();
      const webinarSnapshot = !workshopSnapshot.exists ? await getAdminDb().collection('webinars').doc(targetId).get() : null;
      const snap = workshopSnapshot.exists ? workshopSnapshot : webinarSnapshot;

      if (snap && snap.exists) {
        const item = snap.data();
        if (item?.title) title = item.title;
        if (item?.date) eventDate = item.date;
        if (item?.time) eventTime = item.time;
      }
    } catch (err) {
      console.warn('Could not fetch workshop snapshot, using static workshop defaults:', err.message);
    }

    const amount = Math.round(price * 100);
    const order = await razorpayRequest('/v1/orders', {
      amount,
      currency: 'INR',
      receipt: `workshop_${Date.now()}`,
      notes: {
        attendee_name: name.trim(),
        attendee_email: email.trim(),
        attendee_phone: phone.trim(),
        workshop_id: targetId,
        webinar_id: targetId,
        event: title,
        event_date: eventDate,
        event_time: eventTime,
      },
    });
    return res.status(200).json({ id: order.id, amount: order.amount, currency: order.currency });
  } catch (error) { return res.status(500).json({ message: error.message || 'Unable to create payment order.' }); }
};
