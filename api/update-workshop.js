const { getAdminDb, FieldValue } = require('./firebase-admin');

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
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
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
    console.error('Error updating workshop title/price:', error);
    return res.status(500).json({ message: error.message || 'Unable to update workshop details.' });
  }
};
