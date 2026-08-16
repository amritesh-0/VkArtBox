const crypto = require('crypto');

function readBody(req) {
  if (typeof req.body === 'object' && req.body) return Promise.resolve(req.body);
  return new Promise((resolve, reject) => { let raw = ''; req.on('data', (chunk) => { raw += chunk; }); req.on('end', () => { try { resolve(JSON.parse(raw)); } catch { reject(new Error('Invalid request body.')); } }); });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed.' });
  if (!process.env.RAZORPAY_KEY_SECRET) return res.status(500).json({ message: 'Razorpay is not configured on the server.' });
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await readBody(req);
    if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every(Boolean)) return res.status(400).json({ message: 'Incomplete payment response.' });
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    const verified = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));
    if (!verified) return res.status(400).json({ verified: false, message: 'Payment signature did not match.' });
    return res.status(200).json({ verified: true });
  } catch (error) { return res.status(500).json({ verified: false, message: error.message || 'Unable to verify payment.' }); }
};
