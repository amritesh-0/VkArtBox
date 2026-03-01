import React from 'react';
import logo from '../assets/vkartbox-logo.png';
import './Footer.css';

const socials = [
  { label: 'Fb', href: 'https://www.facebook.com/vkartbox' },
  { label: 'Tw', href: 'https://twitter.com/VkArtbox' },
  { label: 'Ig', href: 'https://www.instagram.com/vk_artbox/' },
  { label: 'Yt', href: 'https://www.youtube.com/vkartbox' },
  { label: 'Pt', href: 'https://in.pinterest.com/vkartbox/' },
];

const shopLinks = ['Quick Sketch', 'Wildlife', 'Portraits', 'Prints'];
const exploreLinks = ['Home', 'Journal', 'Events', 'Register'];
const supportLinks = ['Privacy Policy', 'Contact Us', 'FAQ', 'Shipping'];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">

        {/* Brand */}
        <div className="footer__brand">
          <img src={logo} alt="VkArtBox" className="footer__logo-img" />
          <p className="footer__tagline">Hand-drawn Visions · India</p>
          <p className="footer__addr">
            A502 Classic Swastik City,<br />
            Mangal Nagar, Indore<br />
            Madhya Pradesh, India<br /><br />
            mail@vkartbox.com
          </p>
          <div className="footer__socials">
            {socials.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="footer__soc">
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div className="footer__col">
          <div className="footer__col-title">Shop</div>
          <ul className="footer__links">
            {shopLinks.map(l => <li key={l}><button className="footer__link-btn" onClick={() => { }}>{l}</button></li>)}
          </ul>
        </div>

        {/* Explore */}
        <div className="footer__col">
          <div className="footer__col-title">Explore</div>
          <ul className="footer__links">
            {exploreLinks.map(l => <li key={l}><button className="footer__link-btn" onClick={() => { }}>{l}</button></li>)}
          </ul>
        </div>

        {/* Support */}
        <div className="footer__col">
          <div className="footer__col-title">Support</div>
          <ul className="footer__links">
            {supportLinks.map(l => <li key={l}><button className="footer__link-btn" onClick={() => { }}>{l}</button></li>)}
          </ul>
        </div>

        {/* About blurb */}
        <div className="footer__col">
          <div className="footer__col-title">About</div>
          <p className="footer__about">
            We are a family of creators crafting beautiful drawings with enormous love and quality from the heart of India.
          </p>
        </div>
      </div>

      <div className="footer__bottom">
        <span className="footer__copy">
          Handcrafted with love © 2015 – {new Date().getFullYear()} VkArtBox. All rights reserved.
        </span>
        <span className="footer__heart">Made in Indore, with love ♥</span>
      </div>
    </footer>
  );
}
