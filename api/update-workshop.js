async function requireAdmin(req) {
  const authorization = req.headers.authorization || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new Error('Unauthorized');

  const { getAuth } = require('firebase-admin/auth');
  const { getAdminDb } = require('./firebase-admin');
  // Initializes the Admin SDK before retrieving Firebase Auth.
  getAdminDb();
  const decodedToken = await getAuth().verifyIdToken(match[1]);
  if (decodedToken.admin !== true) {
    throw new Error('Forbidden');
  }
}

function setAdminCorsHeaders(req, res) {
  const requestOrigin = (req.headers.origin || '').replace(/\/$/, '');
  // Keep the production admin origin explicit. ADMIN_APP_ORIGIN can add a
  // staging/admin origin without ever reflecting an arbitrary Origin header.
  const allowedOrigins = new Set([
    'https://admin.vkartbox.com',
    ...(process.env.ADMIN_APP_ORIGIN || '').split(',').map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean),
  ]);
  if (allowedOrigins.has(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
}

function readBody(req) {
  if (typeof req.body === 'object' && req.body) return Promise.resolve(req.body);
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid request body.'));
      }
    });
  });
}

module.exports = async (req, res) => {
  setAdminCorsHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    await requireAdmin(req);
    const { getAdminDb, FieldValue } = require('./firebase-admin');
    const { title, price, workshopId = 'workshop-default' } = await readBody(req);

    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return res.status(400).json({ message: 'Title must be a non-empty string.' });
    }

    const numericPrice = price !== undefined ? Number(price) : undefined;
    if (numericPrice !== undefined && (!Number.isFinite(numericPrice) || numericPrice <= 0)) {
      return res.status(400).json({ message: 'Price must be a positive number.' });
    }

    if (title === undefined && numericPrice === undefined) {
      return res.status(400).json({ message: 'Please provide at least a title or a price to update.' });
    }

    const updatePayload = {
      updatedAt: FieldValue.serverTimestamp()
    };

    if (title !== undefined) updatePayload.title = title.trim();
    if (numericPrice !== undefined) updatePayload.price = numericPrice;

    const docRef = getAdminDb().collection('workshops').doc(workshopId);
    await docRef.set(updatePayload, { merge: true });

    // Also mirror to webinars collection if used
    const webinarRef = getAdminDb().collection('webinars').doc(workshopId);
    await webinarRef.set(updatePayload, { merge: true });

    return res.status(200).json({
      success: true,
      message: 'Workshop title and price updated successfully.',
      data: {
        workshopId,
        title: updatePayload.title,
        price: updatePayload.price
      }
    });
  } catch (error) {
    if (error.message === 'Unauthorized') return res.status(401).json({ message: 'Admin authentication is required.' });
    if (error.message === 'Forbidden') return res.status(403).json({ message: 'Admin access is required.' });
    console.error('Error updating workshop title/price:', error);
    return res.status(500).json({ message: error.message || 'Unable to update workshop details.' });
  }
};
