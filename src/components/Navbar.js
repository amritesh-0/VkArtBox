import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/vkartbox-logo.png';
import './Navbar.css';

const navLinks = [
  { label: 'Home', href: '/', id: 'home' },
  { label: 'About', href: '/', id: 'about' },
  { label: 'Collections', href: '/', id: 'collections' },
  { label: 'Blog', href: '/blogs' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (link) => {
    setMenuOpen(false);

    // If it's a section on home page
    if (link.id) {
      if (location.pathname === '/') {
        const el = document.getElementById(link.id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        // Wait for navigation then scroll
        setTimeout(() => {
          const el = document.getElementById(link.id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      // Normal route navigation
      navigate(link.href);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <Link to="/" className="nav-logo" onClick={() => handleNav(navLinks[0])}>
        <img src={logo} alt="VkArtBox" className="nav-logo__img" />
      </Link>

      <ul className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
        {navLinks.map(link => (
          <li key={link.label}>
            <a
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNav(link);
              }}
              className={location.pathname === link.href ? 'active' : ''}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <button className="nav-cta btn-gold" onClick={() => handleNav(navLinks[2])}>
        View Collection
      </button>

      <button
        className={`nav-hamburger ${menuOpen ? 'nav-hamburger--open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>
    </nav>
  );
}
