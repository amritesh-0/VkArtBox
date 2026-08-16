import React, { useState } from 'react';
import { CalendarDays, Check, Clock3, MapPin, ShieldCheck, Users } from 'lucide-react';
import './Webinar.css';

const WEBINAR = {
  title: 'Find Your Artistic Voice',
  date: 'Saturday, 20 September 2026',
  time: '4:00 PM – 5:30 PM IST',
  price: 499,
  description: 'A live, hands-on session for emerging artists who want to turn everyday observation into expressive, confident artwork.',
};

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
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isPaying, setIsPaying] = useState(false);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const joinWebinar = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });
    setIsPaying(true);

    try {
      const checkoutAvailable = await loadRazorpay();
      if (!checkoutAvailable) throw new Error('Unable to load the payment window. Please check your connection and try again.');

      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.message || 'Unable to start the payment.');

      const key = process.env.REACT_APP_RAZORPAY_KEY_ID;
      if (!key) throw new Error('Razorpay Key ID has not been configured.');

      const payment = new window.Razorpay({
        key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'VkArtBox',
        description: WEBINAR.title,
        order_id: orderData.id,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#B8860B' },
        modal: { ondismiss: () => setIsPaying(false) },
        handler: async (response) => {
          try {
            const verificationResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, attendee: form }),
            });
            const verification = await verificationResponse.json();
            if (!verificationResponse.ok || !verification.verified) throw new Error(verification.message || 'Payment verification failed.');
            setStatus({ type: 'success', message: 'Your seat is confirmed. We’ll send the webinar details to your email shortly.' });
          } catch (error) {
            setStatus({ type: 'error', message: error.message || 'Payment was received but could not be verified. Please contact us with your payment ID.' });
          } finally {
            setIsPaying(false);
          }
        },
      });
      payment.open();
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Something went wrong. Please try again.' });
      setIsPaying(false);
    }
  };

  return (
    <main className="webinar-page">
      <section className="webinar-hero">
        <div className="webinar-hero__content reveal visible">
          <p className="section-eyebrow">Live online masterclass</p>
          <h1>Find Your<br /><em>Artistic Voice</em></h1>
          <p className="webinar-hero__intro">{WEBINAR.description}</p>
          <div className="webinar-meta" aria-label="Webinar details">
            <span><CalendarDays size={17} /> {WEBINAR.date}</span>
            <span><Clock3 size={17} /> {WEBINAR.time}</span>
            <span><MapPin size={17} /> Online via Zoom</span>
          </div>
          <a className="btn-gold webinar-hero__cta" href="#registration">Reserve your seat</a>
        </div>
        <div className="webinar-hero__art" aria-hidden="true">
          <span className="webinar-hero__circle webinar-hero__circle--one" />
          <span className="webinar-hero__circle webinar-hero__circle--two" />
          <p>CREATE<br /><em>WITH INTENTION</em></p>
        </div>
      </section>

      <section className="webinar-details">
        <div>
          <p className="section-eyebrow">What you’ll explore</p>
          <h2 className="section-title">Make art that feels<br /><em>truly yours.</em></h2>
        </div>
        <div className="webinar-details__copy">
          <p>Move beyond copying what you see. This 90-minute live webinar will help you notice more, choose with confidence, and build a personal creative practice you’ll want to return to.</p>
          <ul>
            <li><Check size={18} /> A practical way to develop your visual point of view</li>
            <li><Check size={18} /> Simple exercises for composition and expression</li>
            <li><Check size={18} /> Live Q&amp;A with an experienced VkArtBox artist</li>
          </ul>
        </div>
      </section>

      <section className="webinar-registration" id="registration">
        <div className="webinar-registration__summary">
          <p className="section-eyebrow">Save your spot</p>
          <h2 className="section-title">Join the<br /><em>live session.</em></h2>
          <div className="webinar-price"><span>₹{WEBINAR.price}</span> per attendee</div>
          <div className="webinar-trust"><ShieldCheck size={20} /> Secure payment via Razorpay</div>
          <div className="webinar-trust"><Users size={20} /> Limited live seats available</div>
        </div>
        <form className="webinar-form" onSubmit={joinWebinar}>
          <label>Full name<input name="name" value={form.name} onChange={updateField} required autoComplete="name" /></label>
          <label>Email address<input name="email" type="email" value={form.email} onChange={updateField} required autoComplete="email" /></label>
          <label>Phone number<input name="phone" type="tel" value={form.phone} onChange={updateField} required autoComplete="tel" /></label>
          <button className="btn-gold webinar-form__submit" type="submit" disabled={isPaying}>{isPaying ? 'Opening secure payment…' : `Join now · ₹${WEBINAR.price}`}</button>
          {status.message && <p className={`webinar-status webinar-status--${status.type}`} role="status">{status.message}</p>}
          <p className="webinar-form__note">By continuing, you agree to receive webinar access details at the email address above.</p>
        </form>
      </section>
    </main>
  );
}
