import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/vkartbox-logo.png';
import { SOCIAL_LINKS, SocialIcon } from './SocialLinks';
import './Footer.css';

const shopLinks = [
  { label: 'Portraits', href: '/collection/portraits' },
  { label: 'Wildlife', href: '/collection/wildlife' },
];

const exploreLinks = [
  { label: 'Collections', href: '/', id: 'collections' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Careers', href: '/careers' },
];

const supportLinks = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'Apply Now', href: '/careers/apply' },
  { label: 'Email Us', href: 'mailto:mail@vkartbox.com', external: true },
];

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (link) => {
    if (link.external) {
      window.location.href = link.href;
      return;
    }

    if (link.id) {
      if (location.pathname === '/') {
        const el = document.getElementById(link.id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(link.href);
        setTimeout(() => {
          const el = document.getElementById(link.id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      return;
    }

    navigate(link.href);
  };

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
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="footer__soc"
                aria-label={social.label}
                title={social.label}
              >
                <SocialIcon type={social.key} className="footer__soc-icon" />
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div className="footer__col">
          <div className="footer__col-title">Shop</div>
          <ul className="footer__links">
            {shopLinks.map((link) => (
              <li key={link.label}>
                <button className="footer__link-btn" onClick={() => handleNav(link)}>{link.label}</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Explore */}
        <div className="footer__col">
          <div className="footer__col-title">Explore</div>
          <ul className="footer__links">
            {exploreLinks.map((link) => (
              <li key={link.label}>
                <button className="footer__link-btn" onClick={() => handleNav(link)}>{link.label}</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div className="footer__col">
          <div className="footer__col-title">Support</div>
          <ul className="footer__links">
            {supportLinks.map((link) => (
              <li key={link.label}>
                <button className="footer__link-btn" onClick={() => handleNav(link)}>{link.label}</button>
              </li>
            ))}
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
        <Link to="/contact" className="footer__heart">Made in Indore, with love</Link>
      </div>
    </footer>
  );
}
