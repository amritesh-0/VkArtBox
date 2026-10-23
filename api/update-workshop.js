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
    const { WORKSHOPS, isSafePrice } = require('./workshop-catalog');
    const { workshops, activeWorkshopId } = await readBody(req);

    if (!Array.isArray(workshops) || workshops.length !== Object.keys(WORKSHOPS).length || !WORKSHOPS[activeWorkshopId]) {
      return res.status(400).json({ message: 'Please provide both workshops and one valid live workshop.' });
    }

    const receivedIds = new Set(workshops.map((workshop) => workshop?.id));
    if (receivedIds.size !== Object.keys(WORKSHOPS).length || Object.keys(WORKSHOPS).some((id) => !receivedIds.has(id))) {
      return res.status(400).json({ message: 'Workshop catalogue is invalid.' });
    }

    const db = getAdminDb();
    const batch = db.batch();
    const responseWorkshops = [];
    for (const submitted of workshops) {
      const base = WORKSHOPS[submitted.id];
      const title = typeof submitted.title === 'string' ? submitted.title.trim() : '';
      const price = Number(submitted.price);
      if (!title || title.length > 160 || !isSafePrice(price)) {
        return res.status(400).json({ message: `Please enter a valid title and price for ${base.title}.` });
      }
      const data = {
        id: base.id,
        title,
        price,
        originalPrice: base.originalPrice || null,
        duration: base.duration,
        date: base.date,
        time: base.time,
        mode: base.mode,
        isLive: base.id === activeWorkshopId,
        updatedAt: FieldValue.serverTimestamp(),
      };
      batch.set(db.collection('workshops').doc(base.id), data, { merge: true });
      responseWorkshops.push({ ...data, updatedAt: undefined });
    }
    await batch.commit();
    return res.status(200).json({ success: true, message: 'Live workshop and pricing updated successfully.', data: { activeWorkshopId, workshops: responseWorkshops } });
  } catch (error) {
    if (error.message === 'Unauthorized') return res.status(401).json({ message: 'Admin authentication is required.' });
    if (error.message === 'Forbidden') return res.status(403).json({ message: 'Admin access is required.' });
    console.error('Error updating workshop title/price:', error);
    return res.status(500).json({ message: error.message || 'Unable to update workshop details.' });
  }
};
