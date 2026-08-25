const crypto = require('crypto');
const https = require('https');
const { FieldValue, getAdminDb } = require('./firebase-admin');


function readBody(req) {
  if (typeof req.body === 'object' && req.body) return Promise.resolve(req.body);
  return new Promise((resolve, reject) => { let raw = ''; req.on('data', (chunk) => { raw += chunk; }); req.on('end', () => { try { resolve(JSON.parse(raw)); } catch { reject(new Error('Invalid request body.')); } }); });
}

function razorpayGet(path) {
  const token = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
  return new Promise((resolve, reject) => {
    const request = https.request({ hostname: 'api.razorpay.com', path, method: 'GET', headers: { Authorization: `Basic ${token}` } }, (response) => {
      let output = '';
      response.on('data', (chunk) => { output += chunk; });
      response.on('end', () => {
        let parsed = {};
        try { parsed = output ? JSON.parse(output) : {}; } catch { return reject(new Error('Invalid response from Razorpay.')); }
        return response.statusCode >= 200 && response.statusCode < 300
          ? resolve(parsed)
          : reject(new Error(parsed.error?.description || 'Unable to retrieve the payment order.'));
      });
    });
    request.on('error', reject);
    request.end();
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed.' });
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return res.status(500).json({ message: 'Razorpay is not configured on the server.' });
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await readBody(req);
    if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every(Boolean)) return res.status(400).json({ message: 'Incomplete payment response.' });
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    const signature = Buffer.from(razorpay_signature);
    const verified = signature.length === Buffer.byteLength(expected) && crypto.timingSafeEqual(Buffer.from(expected), signature);
    if (!verified) return res.status(400).json({ verified: false, message: 'Payment signature did not match.' });

    const order = await razorpayGet(`/v1/orders/${encodeURIComponent(razorpay_order_id)}`);
    const attendee = order.notes || {};
    if (!Number.isInteger(order.amount) || order.amount <= 0 || order.currency !== 'INR' || !attendee.webinar_id || !attendee.event || !attendee.attendee_name || !attendee.attendee_email || !attendee.attendee_phone) {
      return res.status(400).json({ verified: false, message: 'This payment order is not a valid webinar registration.' });
    }

    // The payment ID is the document ID, making retries idempotent.
    await getAdminDb().collection('webinarRegistrations').doc(razorpay_payment_id).set({
      name: attendee.attendee_name,
      email: attendee.attendee_email,
      phone: attendee.attendee_phone,
      event: attendee.event,
      webinarId: attendee.webinar_id,
      eventDate: attendee.event_date || '',
      eventTime: attendee.event_time || '',
      amount: order.amount,
      currency: order.currency,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: 'paid',
      registeredAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return res.status(200).json({ verified: true });
  } catch (error) { return res.status(500).json({ verified: false, message: error.message || 'Unable to verify payment.' }); }
};
