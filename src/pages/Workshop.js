import React, { useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, MapPin, ShieldCheck, Award, UserCheck, Sparkles, BookOpen, Layers, Check, ArrowRight, Eye, X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import './Workshop.css';

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

const artworkGallery = [
  {
    src: '/assets/workshop/IMG_9848.JPG.jpeg',
    title: 'Step-by-Step Eye Rendering Breakdown',
    category: 'Eye Anatomy & Detailing',
    desc: 'Learn how to transition from initial light pencil sketch to realistic iris highlights and soft eyelid shading.'
  },
  {
    src: '/assets/workshop/IMG_9808.JPG.jpeg',
    title: 'Before & After Realism Transformation',
    category: 'Proportion & Realism Mastery',
    desc: 'Transform basic line drawings into hyper-realistic portraits using Loomis measurements and value mapping.'
  },
  {
    src: '/assets/workshop/IMG_9809.JPG.jpeg',
    title: 'High-Contrast Portrait Detailing',
    category: 'Value Mapping & Contrast',
    desc: 'Mastering facial features, freckle textures, skin pores, and soft graphite shading techniques.'
  },
  {
    src: '/assets/workshop/IMG_9810.JPG.jpeg',
    title: 'Detailed Realistic Portrait Study',
    category: 'Charcoal & Graphite Shading',
    desc: 'Creating realistic clothing textures, fur hats, hair highlights, and soft facial gradient values.'
  },
  {
    src: '/assets/workshop/IMG_9811.JPG.jpeg',
    title: 'Celebrity Portrait Graphite Study (MS Dhoni)',
    category: 'Portrait Structure',
    desc: 'Precision line work, beard stubble texture, nose/mouth proportions, and solid contrast control.'
  },
  {
    src: '/assets/workshop/IMG_9733.JPG.jpeg',
    title: 'Anatomical Eye Construction',
    category: 'Feature Construction',
    desc: 'Step-by-step breakdown of eye shape, pupil reflection, lash layering, and tear duct construction.'
  }
];

const curriculumData = [
  {
    day: 'Day 1',
    topic: 'Introduction to Drawing Tools',
    points: [
      'Basic introduction of drawing tools — pencils, grades, blending tools, erasers, and paper'
    ]
  },
  {
    day: 'Day 2',
    topic: 'Pencil Control & Grip',
    points: [
      'How to hold the pencil correctly',
      'Learn to handle and control pencil pressure',
      'Line drawing exercises',
      'Drawing basic forms and shapes'
    ]
  },
  {
    day: 'Day 3',
    topic: 'Perspective',
    points: [
      'Types of perspective',
      'Importance of perspective in portrait drawing',
      'Real-life examples of perspective'
    ]
  },
  {
    day: 'Day 4',
    topic: 'Proportions',
    points: [
      'Head angle',
      'Eye line',
      'Nose placement',
      'Mouth placement',
      'Ear placement',
      'Measuring facial features using pencil',
      'Marking common beginner mistakes when drawing a face'
    ]
  },
  {
    day: 'Day 5',
    topic: 'Methods to Draw a Face',
    points: [
      'Free-hand method (without calculation or tools)',
      'Loomis method',
      'Pencil measurement method'
    ]
  },
  {
    day: 'Day 6',
    topic: 'Facial Feature Construction',
    points: [
      'Using different construction methods',
      'Eye, nose, lips, and ear anatomy'
    ]
  },
  {
    day: 'Day 7',
    topic: 'Types of Shading',
    points: [
      'Contrast control',
      'Shadow and highlight',
      'Mapping values',
      'Layering of values',
      'Blocking'
    ]
  },
  {
    day: 'Day 8',
    topic: 'Applying Shading on the Face',
    points: [
      'Applying shading on the face and different facial features'
    ]
  }
];

export default function Workshop() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isPaying, setIsPaying] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [activeImage, setActiveImage] = useState(null);

  // Carousel State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const workshopTitle = "VKartbox Basic Graphite & Charcoal Workshop — 2026 Sept";
  const workshopPrice = 2499;
  const originalPrice = 4999;

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  // Carousel Navigation Functions
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === artworkGallery.length - 1 ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? artworkGallery.length - 1 : prevIndex - 1));
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
    setTouchStart(null);
    setTouchEnd(null);
  };

  const joinWorkshop = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });
    setIsPaying(true);

    try {
      const checkoutAvailable = await loadRazorpay();
      if (!checkoutAvailable) throw new Error('Unable to load the payment window. Please check your connection and try again.');

      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, workshopId: 'workshop-default' })
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
        description: workshopTitle,
        order_id: orderData.id,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#B8860B' },
        modal: { ondismiss: () => setIsPaying(false) },
        handler: async (response) => {
          try {
            const verificationResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response)
            });
            const verification = await verificationResponse.json();
            if (!verificationResponse.ok || !verification.verified) throw new Error(verification.message || 'Payment verification failed.');
            setStatus({
              type: 'success',
              message: verification.emailSent
                ? 'Your seat is confirmed! We have sent your workshop confirmation to your email.'
                : 'Your seat is confirmed! Your payment is complete; we will send the workshop details to your email shortly.'
            });
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

  const activeArtwork = artworkGallery[currentIndex];

  return (
    <main className="workshop-page">
      {/* Hero Section */}
      <section className="workshop-hero">
        <div className="workshop-hero__content">
          <div className="workshop-badge-row">
            <span className="workshop-badge">
              <Sparkles size={15} /> 8-Day Live Online Masterclass
            </span>
            <span className="workshop-badge-discount">
              50% OFF LIMITED TIME
            </span>
          </div>

          <h1>{workshopTitle}</h1>

          <p className="workshop-hero__subtitle">
            The fundamental structure and composition of Realistic Drawing.
          </p>

          <div className="workshop-instructor-pill">
            <UserCheck size={18} className="instructor-icon" />
            <span>Masterclass led by <strong>Vikash Kumar</strong></span>
          </div>

          <div className="workshop-meta-grid" aria-label="Workshop details">
            <div className="meta-pill">
              <CalendarDays size={18} />
              <div>
                <small>START DATE</small>
                <strong>12th Sept 2026</strong>
              </div>
            </div>
            <div className="meta-pill">
              <Clock3 size={18} />
              <div>
                <small>TIMING</small>
                <strong>2:00 PM – 5:00 PM (or 11 AM)</strong>
              </div>
            </div>
            <div className="meta-pill">
              <MapPin size={18} />
              <div>
                <small>MODE</small>
                <strong>Live Online Classes</strong>
              </div>
            </div>
            <div className="meta-pill">
              <Award size={18} />
              <div>
                <small>CERTIFICATE</small>
                <strong>Completion Certificate</strong>
              </div>
            </div>
          </div>

          <div className="workshop-hero__actions">
            <a className="btn-gold workshop-hero__cta" href="#registration">
              Reserve Your Seat · ₹{workshopPrice} <ArrowRight size={18} />
            </a>
            <a className="btn-secondary workshop-hero__secondary-cta" href="#showcase">
              <Eye size={16} /> View Artwork Gallery
            </a>
          </div>
        </div>

        {/* Hero Visual Card - Instructor Masterclass Showcase */}
        <div className="workshop-hero__art" aria-hidden="true">
          <div className="workshop-hero__art-card">
            <div className="hero-artwork-frame hero-instructor-frame">
              <img src="/assets/sir/IMG_0145.JPG.jpeg" alt="Vikash Kumar - Lead Instructor" />
            </div>
            <div className="art-card-top-tag">VkArtBox Masterclass</div>
            <p className="workshop-hero__art-title">PORTRAIT DRAWING</p>
            <p className="workshop-hero__art-sub">BASIC GRAPHITE & CHARCOAL</p>
            <div className="workshop-hero__art-divider" />
            <p className="workshop-hero__art-author">Instructor: <strong>Vikash Kumar</strong></p>
            <div className="art-price-container">
              <span className="art-price-original">₹{originalPrice}</span>
              <span className="workshop-hero__art-price">₹{workshopPrice}</span>
            </div>
            <div className="art-card-footer">
              <Check size={14} /> 8 Days Full Curriculum
            </div>
          </div>
        </div>
      </section>

      {/* 📹 Masterclass Video Overview / What You Will Learn Section */}
      <section className="workshop-video-section" id="video-overview">
        <div className="workshop-video-container">
          <div className="workshop-video-header">
            <h2 className="section-title">What You Will Learn in 8 Days</h2>
            <p className="workshop-video-intro">
              Watch this video overview by lead instructor <strong>Vikash Kumar</strong> to discover what you'll master throughout the 8-Day Portrait Masterclass.
            </p>
          </div>

          <div className="workshop-video-grid">
            {/* Mobile Reel Phone Frame Container */}
            <div className="video-reel-frame-wrapper">
              <div className="video-reel-phone-frame">
                <video
                  src="https://firebasestorage.googleapis.com/v0/b/vkartbox-web.firebasestorage.app/o/IMG_0162.MP4?alt=media&token=0685a865-bb38-4e3e-871e-9e1eadd80dda"
                  controls
                  playsInline
                  preload="metadata"
                  poster="/assets/sir/IMG_0145.JPG.jpeg"
                  className="workshop-reel-video"
                />
              </div>
            </div>

            {/* Video Overview Details & Key Takeaways */}
            <div className="workshop-video-details">
              <h3>Inside the 8-Day Intensive Program</h3>
              <p className="video-details-lead">
                Whether you are a beginner taking your first steps or an experienced artist refining portrait accuracy, this step-by-step masterclass is designed for real skill progression.
              </p>

              <div className="video-takeaways-list">
                <div className="takeaway-item">
                  <div className="takeaway-icon"><CheckCircle2 size={20} /></div>
                  <div>
                    <strong>Full Tool & Pressure Mastery</strong>
                    <p>Learn how to handle graphite grades (HB to 8B), charcoal pencils, paper stumps, and kneaded erasers.</p>
                  </div>
                </div>

                <div className="takeaway-item">
                  <div className="takeaway-icon"><CheckCircle2 size={20} /></div>
                  <div>
                    <strong>Proportion & Loomis Grid Method</strong>
                    <p>Never struggle with facial symmetry or feature placement again using exact proportion rules.</p>
                  </div>
                </div>

                <div className="takeaway-item">
                  <div className="takeaway-icon"><CheckCircle2 size={20} /></div>
                  <div>
                    <strong>Realistic Facial Feature Rendering</strong>
                    <p>Construct realistic eyes, nose contours, lips, ears, skin textures, and hair volume step-by-step.</p>
                  </div>
                </div>

                <div className="takeaway-item">
                  <div className="takeaway-icon"><CheckCircle2 size={20} /></div>
                  <div>
                    <strong>Shadow Mapping & Depth Layering</strong>
                    <p>Master core shadows, reflected light, cast shadows, and smooth value gradients for 3D realism.</p>
                  </div>
                </div>
              </div>

              <div className="video-details-action">
                <a href="#registration" className="btn-gold">
                  Reserve Your Seat · ₹{workshopPrice} <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights / Features Cards */}
      <section className="workshop-highlights">
        <div className="workshop-highlight-item">
          <div className="highlight-icon-box">
            <Sparkles size={24} />
          </div>
          <h3>Tool Control & Pressure</h3>
          <p>Master pencil grades, blending tools, pressure variation, and line precision from Day 1.</p>
        </div>
        <div className="workshop-highlight-item">
          <div className="highlight-icon-box">
            <BookOpen size={24} />
          </div>
          <h3>Proportions & Facial Anatomy</h3>
          <p>Understand head angles, eye lines, Loomis construction, and feature placements.</p>
        </div>
        <div className="workshop-highlight-item">
          <div className="highlight-icon-box">
            <Layers size={24} />
          </div>
          <h3>Shading & Value Mapping</h3>
          <p>Learn contrast control, shadow mapping, value layering, and step-by-step facial rendering.</p>
        </div>
      </section>

      {/* 🖼️ Carousel / Swiper Artwork Showcase Gallery Section */}
      <section className="workshop-showcase" id="showcase">
        <div className="workshop-showcase__header">
          <span className="section-eyebrow"><Eye size={16} inline /> Masterclass Artwork Showcase</span>
          <h2 className="section-title">See What You'll Learn & Create</h2>
          <p className="workshop-showcase__intro">
            Swipe or click through real artwork examples created using the exact 8-Day Graphite & Charcoal techniques taught by Vikash Kumar.
          </p>
        </div>

        {/* Carousel Showcase Container */}
        <div className="showcase-carousel-wrapper">
          <div
            className="carousel-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <button
              className="carousel-nav-btn carousel-nav-btn--prev"
              onClick={prevSlide}
              aria-label="Previous artwork slide"
            >
              <ChevronLeft size={28} />
            </button>

            <div className="carousel-slide">
              <div
                className="carousel-slide__image-box"
                onClick={() => setActiveImage(activeArtwork)}
              >
                <img
                  src={activeArtwork.src}
                  alt={activeArtwork.title}
                  className="carousel-slide__img"
                />
                <div className="carousel-slide__zoom-hint">
                  <ZoomIn size={18} /> Click for full view
                </div>
              </div>

              <div className="carousel-slide__info">
                <span className="carousel-slide__category">{activeArtwork.category}</span>
                <h3 className="carousel-slide__title">{activeArtwork.title}</h3>
                <p className="carousel-slide__desc">{activeArtwork.desc}</p>
                <div className="carousel-slide__meta">
                  <span>Artwork {currentIndex + 1} of {artworkGallery.length}</span>
                  <button className="btn-gold-sm" onClick={() => setActiveImage(activeArtwork)}>
                    Inspect Artwork Details <ZoomIn size={14} />
                  </button>
                </div>
              </div>
            </div>

            <button
              className="carousel-nav-btn carousel-nav-btn--next"
              onClick={nextSlide}
              aria-label="Next artwork slide"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="carousel-dots">
            {artworkGallery.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Thumbnail Bar for Instant Access */}
          <div className="carousel-thumbnails">
            {artworkGallery.map((art, index) => (
              <div
                key={index}
                className={`carousel-thumb ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              >
                <img src={art.src} alt={art.title} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal Lightbox for Artwork */}
      {activeImage && (
        <div className="artwork-modal" onClick={() => setActiveImage(null)}>
          <div className="artwork-modal__content" onClick={(e) => e.stopPropagation()}>
            <button className="artwork-modal__close" onClick={() => setActiveImage(null)} aria-label="Close image modal">
              <X size={24} />
            </button>
            <div className="artwork-modal__image">
              <img src={activeImage.src} alt={activeImage.title} />
            </div>
            <div className="artwork-modal__details">
              <span className="artwork-modal__badge">{activeImage.category}</span>
              <h2>{activeImage.title}</h2>
              <p>{activeImage.desc}</p>
              <a href="#registration" className="btn-gold" onClick={() => setActiveImage(null)}>
                Enroll in Workshop to Learn This Technique
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 8-Day Curriculum Summary Section */}
      <section className="workshop-curriculum" id="curriculum">
        <div className="workshop-curriculum__header">
          <span className="section-eyebrow">Complete Roadmap</span>
          <h2 className="section-title">8-Day Portrait Drawing Curriculum</h2>
          <p className="workshop-curriculum__intro">
            A step-by-step structured path from basic tool handling to rendering complete realistic portraits.
          </p>

          {/* Toggle between Grid View & Table View */}
          <div className="curriculum-view-toggle">
            <button
              type="button"
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              <Layers size={16} /> Day Cards
            </button>
            <button
              type="button"
              className={viewMode === 'table' ? 'active' : ''}
              onClick={() => setViewMode('table')}
            >
              <BookOpen size={16} /> Summary Table
            </button>
          </div>
        </div>

        {/* View Mode 1: Day Cards Grid */}
        {viewMode === 'grid' && (
          <div className="curriculum-grid">
            {curriculumData.map((item, index) => (
              <div className="day-card" key={index}>
                <div className="day-card-header">
                  <span className="day-card-badge">{item.day}</span>
                  <h3 className="day-card-topic">{item.topic}</h3>
                </div>
                <div className="day-card-body">
                  <ul className="points-list">
                    {item.points.map((point, pIdx) => (
                      <li key={pIdx}>
                        <span className="arrow-bullet">→</span> {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Mode 2: Schedule Table */}
        {viewMode === 'table' && (
          <div className="workshop-table-wrapper">
            <table className="workshop-schedule-table">
              <thead>
                <tr>
                  <th className="col-day">DAY</th>
                  <th className="col-topic">TOPIC</th>
                  <th className="col-cover">WHAT WE'LL COVER</th>
                </tr>
              </thead>
              <tbody>
                {curriculumData.map((item, index) => (
                  <tr key={index}>
                    <td className="col-day-cell">
                      <span className="day-badge">{item.day}</span>
                    </td>
                    <td className="col-topic-cell">
                      <strong>{item.topic}</strong>
                    </td>
                    <td className="col-cover-cell">
                      <ul className="points-list">
                        {item.points.map((point, pIdx) => (
                          <li key={pIdx}>
                            <span className="arrow-bullet">→</span> {point}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="workshop-curriculum__note">
          <p>
            <strong>Note:</strong> This 8-day plan builds from foundational tool handling through to full facial shading, giving beginners a structured path from basic pencil control to a complete rendered portrait.
          </p>
        </div>
      </section>

      {/* Registration Section */}
      <section className="workshop-registration" id="registration">
        <div className="workshop-registration__summary">
          <span className="section-eyebrow">Enrollment Open</span>
          <h2 className="section-title">Join the<br /><em>live workshop.</em></h2>

          <div className="workshop-price-tag">
            <span className="price-old">₹{originalPrice}</span>
            <span className="price-current">₹{workshopPrice}</span>
            <small>Per Attendee (Full 8 Days)</small>
          </div>

          <div className="workshop-trust-list">
            <div className="workshop-trust-item"><ShieldCheck size={20} /> 100% Secure Payment via Razorpay</div>
            <div className="workshop-trust-item"><UserCheck size={20} /> Live Guidance by Vikash Kumar</div>
            <div className="workshop-trust-item"><Award size={20} /> Certificate Provided Upon Completion</div>
            <div className="workshop-trust-item"><CalendarDays size={20} /> Starts 12th Sept 2026 (2–5 PM or 11 AM)</div>
          </div>
        </div>

        {status.type === 'success' ? (
          <div className="workshop-success-card" role="status">
            <CheckCircle2 size={48} aria-hidden="true" />
            <p className="section-eyebrow">Registration Confirmed</p>
            <h3>You’re officially enrolled!</h3>
            <p>{status.message}</p>
            <div className="workshop-success-card__event">
              <strong>{workshopTitle}</strong>
              <span>Starts 12th Sept 2026 · 2:00 PM – 5:00 PM IST</span>
            </div>
            <p className="workshop-success-card__note">
              A confirmation email has been sent to <strong>{form.email}</strong> with access instructions and class links.
            </p>
          </div>
        ) : (
          <form className="workshop-form" onSubmit={joinWorkshop}>
            <h3 className="form-heading">Reserve Your Spot</h3>
            <p className="form-subheading">Fill in your contact details to proceed to secure checkout.</p>

            <label>
              Full name
              <input name="name" value={form.name} onChange={updateField} required autoComplete="name" placeholder="e.g. Rahul Sharma" />
            </label>
            <label>
              Email address
              <input name="email" type="email" value={form.email} onChange={updateField} required autoComplete="email" placeholder="rahul@example.com" />
            </label>
            <label>
              Phone number
              <input name="phone" type="tel" value={form.phone} onChange={updateField} required autoComplete="tel" placeholder="+91 98765 43210" />
            </label>

            <button className="btn-gold workshop-form__submit" type="submit" disabled={isPaying}>
              {isPaying ? 'Opening secure payment window…' : `Enroll Now · ₹${workshopPrice}`}
            </button>

            {status.message && (
              <p className={`workshop-status workshop-status--${status.type}`} role="status">
                {status.message}
              </p>
            )}

            <p className="workshop-form__note">
              <ShieldCheck size={14} inline /> Instant confirmation & receipt sent to your email after payment.
            </p>
          </form>
        )}
      </section>
    </main>
  );
}
