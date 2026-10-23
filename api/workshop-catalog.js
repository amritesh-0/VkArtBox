const WORKSHOPS = {
  'workshop-default': {
    id: 'workshop-default',
    title: 'VKartbox Basic Graphite & Charcoal Workshop — 2026 Sept',
    price: 2499,
    originalPrice: 4999,
    duration: '8-Day Live Online Masterclass',
    date: '12th Sept 2026',
    time: '2:00 PM - 5:00 PM IST',
    mode: 'Live Online Classes',
    isLive: true,
  },
  'workshop-starter-drawing': {
    id: 'workshop-starter-drawing',
    title: 'A 2-Day Basic Drawing Starter Workshop',
    price: 999,
    originalPrice: null,
    duration: '2-Day Live Online Workshop',
    date: 'Dates to be announced',
    time: 'Time to be announced',
    mode: 'Live Online Workshop',
    isLive: false,
  },
};

function isSafePrice(value) {
  return Number.isInteger(value) && value > 0 && value <= 100000;
}

async function getLiveWorkshop(db) {
  const snapshot = await db.collection('workshops').get();
  const saved = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const live = saved.filter((item) => item.isLive === true);
  if (live.length > 1) throw new Error('Workshop configuration has more than one live workshop.');
  if (live.length === 1 && WORKSHOPS[live[0].id]) {
    const base = WORKSHOPS[live[0].id];
    const price = Number(live[0].price);
    return { ...base, ...live[0], id: base.id, price: isSafePrice(price) ? price : base.price };
  }
  // Existing installations have no settings document until the first admin save.
  // Preserve the original workshop as the safe migration default only in that case.
  const legacyDefault = saved.find((item) => item.id === 'workshop-default' && item.isLive === undefined);
  if (saved.length === 0 || (saved.length === 1 && legacyDefault)) {
    const legacyPrice = Number(legacyDefault?.price);
    return { ...WORKSHOPS['workshop-default'], ...legacyDefault, price: isSafePrice(legacyPrice) ? legacyPrice : WORKSHOPS['workshop-default'].price };
  }
  return null;
}

module.exports = { WORKSHOPS, getLiveWorkshop, isSafePrice };
