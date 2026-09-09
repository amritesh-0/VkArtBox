const PIXEL_ID = '255046325788793';

// `fbq` is installed in public/index.html before the React bundle loads. Keep
// this guard so checkout and registration continue to work if a visitor blocks
// the Pixel script.
export function trackMetaEvent(eventName, parameters, options) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', eventName, parameters, options);
  }
}

export function trackPurchaseOnce(paymentId, amount, currency) {
  if (!paymentId || typeof window === 'undefined') return;

  const storageKey = `meta-purchase-${PIXEL_ID}-${paymentId}`;
  try {
    if (window.localStorage.getItem(storageKey)) return;
    window.localStorage.setItem(storageKey, 'sent');
  } catch {
    // Storage may be unavailable in private browsing. The in-memory caller
    // guard still prevents duplicate events during this checkout session.
  }

  trackMetaEvent('Purchase', { value: amount, currency }, { eventID: paymentId });
}
