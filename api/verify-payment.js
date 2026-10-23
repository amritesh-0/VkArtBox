const crypto = require('crypto');
const https = require('https');
const { FieldValue, getAdminDb } = require('./firebase-admin');
const { WORKSHOPS } = require('./workshop-catalog');


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

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

function resendRequest(payload) {
  const data = JSON.stringify(payload);
  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname: 'api.resend.com', path: '/emails', method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (response) => {
      let output = '';
      response.on('data', (chunk) => { output += chunk; });
      response.on('end', () => {
        let parsed = {};
        try { parsed = output ? JSON.parse(output) : {}; } catch { /* Use the status below. */ }
        if (response.statusCode >= 200 && response.statusCode < 300) return resolve(parsed);
        return reject(new Error(parsed.message || parsed.name || 'Unable to send workshop confirmation email.'));
      });
    });
    request.on('error', reject);
    request.write(data);
    request.end();
  });
}

async function sendConfirmationEmail({ name, email, event, eventDate, eventTime }) {
  if (!process.env.RESEND_API_KEY || !process.env.WORKSHOP_EMAIL_FROM) {
    throw new Error('Workshop confirmation email is not configured.');
  }

  const participantName = escapeHtml(name);
  const workshopName = escapeHtml(event || 'VK Artbox Workshop');
  const date = escapeHtml(eventDate || '12 September 2026');
  const time = escapeHtml(eventTime || 'To be confirmed');
  const siteUrl = (process.env.PUBLIC_SITE_URL || 'https://www.vkartbox.com').replace(/\/$/, '');
  const instructorImage = process.env.WORKSHOP_EMAIL_IMAGE_URL || `${siteUrl}/assets/sir/IMG_0145.JPG.jpeg`;
  const text = `Hi ${name},\n\nYour registration for ${event || 'the VK Artbox Workshop'} with Vikash Kumar is confirmed.\n\nWorkshop details\nWorkshop: ${event || 'VK Artbox Workshop'}\nDate: ${eventDate || 'To be announced'}\nTime: ${eventTime || 'To be announced'}\nMode: Online\n\nThe complete workshop details and joining link will be shared with you soon.\n\nWarmly,\nTeam VK Artbox`;
  const html = `<!doctype html><html><body style="margin:0;background:#f7f4ee;color:#29221b;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border:1px solid #e5ded3;border-radius:12px;overflow:hidden"><tr><td><img src="${escapeHtml(instructorImage)}" alt="Vikash Kumar, workshop instructor" width="620" style="display:block;width:100%;height:auto" /></td></tr><tr><td style="padding:32px"><h1 style="margin:0 0 20px;font-size:26px;color:#7d5a17">Your workshop registration is confirmed 🎉</h1><p>Hi ${participantName},</p><p>We’re happy to confirm your registration for <strong>${workshopName}</strong> with <strong>Vikash Kumar</strong>.</p><h2 style="font-size:20px;color:#7d5a17">Workshop Details</h2><table role="presentation" cellspacing="0" cellpadding="7" style="width:100%;background:#faf7f0;border-radius:8px"><tr><td><strong>Workshop</strong></td><td>${workshopName}</td></tr><tr><td><strong>Date</strong></td><td>${date}</td></tr><tr><td><strong>Time</strong></td><td>${time}</td></tr><tr><td><strong>Mode</strong></td><td>Online</td></tr></table><p>The complete workshop details and joining link will be shared with you soon. We can’t wait to create, learn, and explore together.</p><p>Warmly,<br /><strong>Team VK Artbox</strong></p></td></tr></table></td></tr></table></body></html>`;

  return resendRequest({
    from: process.env.WORKSHOP_EMAIL_FROM,
    to: [email],
    subject: `Registration confirmed — ${event || 'VK Artbox Workshop'}`,
    html,
    text,
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

    const [order, payment] = await Promise.all([
      razorpayGet(`/v1/orders/${encodeURIComponent(razorpay_order_id)}`),
      razorpayGet(`/v1/payments/${encodeURIComponent(razorpay_payment_id)}`),
    ]);
    const attendee = order.notes || {};
    const targetId = attendee.workshop_id;
    const workshopAmount = Number(attendee.workshop_amount);
    if (!WORKSHOPS[targetId] || !Number.isInteger(workshopAmount) || workshopAmount <= 0 || order.amount !== workshopAmount || order.currency !== 'INR' || !attendee.event || !attendee.attendee_name || !attendee.attendee_email || !attendee.attendee_phone) {
      return res.status(400).json({ verified: false, message: 'This payment order is not a valid workshop registration.' });
    }

    // A valid Checkout signature alone is insufficient proof that funds were
    // captured. Confirm the payment directly with Razorpay and bind every
    // payment property that determines whether this registration is paid.
    if (
      order.status !== 'paid' ||
      order.amount_paid !== order.amount ||
      payment.order_id !== razorpay_order_id ||
      payment.status !== 'captured' ||
      payment.amount !== order.amount ||
      payment.currency !== order.currency
    ) {
      return res.status(400).json({ verified: false, message: 'Payment has not been captured for this workshop order.' });
    }

    const registrationRecord = {
      name: attendee.attendee_name,
      email: attendee.attendee_email,
      phone: attendee.attendee_phone,
      event: attendee.event,
      workshopId: attendee.workshop_id || targetId,
      eventDate: attendee.event_date || '',
      eventTime: attendee.event_time || '',
      amount: order.amount,
      currency: order.currency,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpayPaymentStatus: payment.status,
      status: 'paid',
      registeredAt: FieldValue.serverTimestamp(),
    };

    // The payment ID is the document ID, making retries idempotent.
    const db = getAdminDb();
    const workshopRegistration = db.collection('workshopRegistrations').doc(razorpay_payment_id);
    await workshopRegistration.set(registrationRecord, { merge: true });

    // Atomically claim email delivery so a replayed payment callback cannot
    // send duplicate confirmations. Payment success is never rolled back if
    // the email provider is temporarily unavailable.
    const emailClaim = await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(workshopRegistration);
      if (existing.data()?.confirmationEmail?.status === 'sent') return 'sent';
      if (existing.data()?.confirmationEmail?.status === 'sending') return 'sending';
      transaction.set(workshopRegistration, {
        confirmationEmail: { status: 'sending', updatedAt: FieldValue.serverTimestamp() },
      }, { merge: true });
      return 'claimed';
    });

    let emailSent = emailClaim === 'sent';
    if (emailClaim === 'claimed') {
      try {
        const delivery = await sendConfirmationEmail(registrationRecord);
        const confirmationEmail = { status: 'sent', provider: 'resend', messageId: delivery.id || '', sentAt: FieldValue.serverTimestamp() };
        await workshopRegistration.set({ confirmationEmail }, { merge: true });
        emailSent = true;
      } catch (emailError) {
        console.error('Workshop payment confirmed but confirmation email failed:', emailError.message);
        const confirmationEmail = { status: 'failed', error: emailError.message, updatedAt: FieldValue.serverTimestamp() };
        await workshopRegistration.set({ confirmationEmail }, { merge: true });
      }
    }

    return res.status(200).json({ verified: true, emailSent, paymentId: razorpay_payment_id });
  } catch (error) { return res.status(500).json({ verified: false, message: error.message || 'Unable to verify payment.' }); }
};
