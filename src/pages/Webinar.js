import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { CalendarDays, Check, CheckCircle2, Clock3, MapPin, ShieldCheck, Users } from 'lucide-react';
import { db } from '../firebase';
import './Webinar.css';

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Webinar() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [webinars, setWebinars] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loadingWebinars, setLoadingWebinars] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isPaying, setIsPaying] = useState(false);
  const webinar = webinars.find((item) => item.id === selectedId);

  useEffect(() => {
    const fetchWebinars = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, 'webinars'), where('isPublished', '==', true)));
        const available = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        setWebinars(available);
        setSelectedId(available[0]?.id || '');
      } catch (error) {
        console.error('Unable to load webinars:', error);
        setStatus({ type: 'error', message: 'Unable to load webinar details. Please try again shortly.' });
      } finally { setLoadingWebinars(false); }
    };
    fetchWebinars();
  }, []);

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const selectWebinar = (event) => { setSelectedId(event.target.value); setStatus({ type: '', message: '' }); };

  const joinWebinar = async (event) => {
    event.preventDefault();
    if (!webinar) return;
    setStatus({ type: '', message: '' });
    setIsPaying(true);
    try {
      const checkoutAvailable = await loadRazorpay();
      if (!checkoutAvailable) throw new Error('Unable to load the payment window. Please check your connection and try again.');
      const orderResponse = await fetch('/api/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, webinarId: webinar.id }) });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.message || 'Unable to start the payment.');
      const key = process.env.REACT_APP_RAZORPAY_KEY_ID;
      if (!key) throw new Error('Razorpay Key ID has not been configured.');
      const payment = new window.Razorpay({
        key, amount: orderData.amount, currency: orderData.currency, name: 'VkArtBox', description: webinar.title, order_id: orderData.id,
        prefill: { name: form.name, email: form.email, contact: form.phone }, theme: { color: '#B8860B' }, modal: { ondismiss: () => setIsPaying(false) },
        handler: async (response) => {
          try {
            const verificationResponse = await fetch('/api/verify-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(response) });
            const verification = await verificationResponse.json();
            if (!verificationResponse.ok || !verification.verified) throw new Error(verification.message || 'Payment verification failed.');
            setStatus({ type: 'success', message: 'Your seat is confirmed. We’ll send the webinar details to your email shortly.' });
          } catch (error) { setStatus({ type: 'error', message: error.message || 'Payment was received but could not be verified. Please contact us with your payment ID.' }); }
          finally { setIsPaying(false); }
        },
      });
      payment.open();
    } catch (error) { setStatus({ type: 'error', message: error.message || 'Something went wrong. Please try again.' }); setIsPaying(false); }
  };

  if (loadingWebinars) return <main className="webinar-page"><section className="webinar-empty-state">Loading upcoming webinars...</section></main>;
  if (!webinar) return <main className="webinar-page"><section className="webinar-empty-state">There are no webinars open for registration right now. Please check back soon.</section></main>;

  return <main className="webinar-page">
    <section className="webinar-hero">
      <div className="webinar-hero__content reveal visible">
        <p className="section-eyebrow">Live online masterclass</p>
        {webinars.length > 1 && <label className="webinar-picker">Choose a webinar<select value={selectedId} onChange={selectWebinar}>{webinars.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>}
        <h1>{webinar.title}</h1><p className="webinar-hero__intro">{webinar.description}</p>
        <div className="webinar-meta" aria-label="Webinar details"><span><CalendarDays size={17} /> {webinar.date}</span><span><Clock3 size={17} /> {webinar.time}</span><span><MapPin size={17} /> Online via Zoom</span></div>
        <a className="btn-gold webinar-hero__cta" href="#registration">Reserve your seat</a>
      </div>
      <div className="webinar-hero__art" aria-hidden="true"><span className="webinar-hero__circle webinar-hero__circle--one" /><span className="webinar-hero__circle webinar-hero__circle--two" /><p>CREATE<br /><em>WITH INTENTION</em></p></div>
    </section>
    <section className="webinar-details"><div><p className="section-eyebrow">What you’ll explore</p><h2 className="section-title">Make art that feels<br /><em>truly yours.</em></h2></div><div className="webinar-details__copy"><p>{webinar.description}</p><ul><li><Check size={18} /> A practical way to develop your visual point of view</li><li><Check size={18} /> Simple exercises for composition and expression</li><li><Check size={18} /> Live Q&amp;A with an experienced VkArtBox artist</li></ul></div></section>
    <section className="webinar-registration" id="registration"><div className="webinar-registration__summary"><p className="section-eyebrow">Save your spot</p><h2 className="section-title">Join the<br /><em>live session.</em></h2><div className="webinar-price"><span>₹{webinar.price}</span> per attendee</div><div className="webinar-trust"><ShieldCheck size={20} /> Secure payment via Razorpay</div><div className="webinar-trust"><Users size={20} /> Limited live seats available</div></div>
      {status.type === 'success' ? <div className="webinar-success-card" role="status"><CheckCircle2 size={42} aria-hidden="true" /><p className="section-eyebrow">Registration complete</p><h3>You’re on the list.</h3><p>{status.message}</p><div className="webinar-success-card__event"><strong>{webinar.title}</strong><span>{webinar.date} · {webinar.time}</span></div><p className="webinar-success-card__note">Please keep an eye on <strong>{form.email}</strong>. Your Zoom access details and event reminders will be sent there.</p></div> : <form className="webinar-form" onSubmit={joinWebinar}><label>Full name<input name="name" value={form.name} onChange={updateField} required autoComplete="name" /></label><label>Email address<input name="email" type="email" value={form.email} onChange={updateField} required autoComplete="email" /></label><label>Phone number<input name="phone" type="tel" value={form.phone} onChange={updateField} required autoComplete="tel" /></label><button className="btn-gold webinar-form__submit" type="submit" disabled={isPaying}>{isPaying ? 'Opening secure payment…' : `Join now · ₹${webinar.price}`}</button>{status.message && <p className={`webinar-status webinar-status--${status.type}`} role="status">{status.message}</p>}<p className="webinar-form__note">By continuing, you agree to receive webinar access details at the email address above.</p></form>}
    </section>
  </main>;
}
