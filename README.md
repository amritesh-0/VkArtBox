# VkArtBox — React Landing Page

A stunning, animated landing page for VkArtBox built with React.

## ✨ Features

- **Hero Section** — Saraswati circular medallion with parallax mouse tracking, particle canvas, animated gold rays & mandala
- **About** — Family story with Van Gogh quote card
- **Portraits Gallery** — 8-card responsive grid with hover effects
- **Wildlife Section** — Editorial asymmetric layout
- **Collection Carousel** — 3 interactive cards (Portraits / Wildlife / Prints) with full hover-reveal photo grids
- **Quote Band** — Full-bleed inspirational section
- **Newsletter** — Email subscription with success state
- **Footer** — 5-column with all links and socials

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Installation

```bash
# 1. Navigate to the project folder
cd vkartbox

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

The app will open at **http://localhost:3000**

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## 📁 Project Structure

```
vkartbox/
├── public/
│   └── index.html          # HTML template with Google Fonts
├── src/
│   ├── assets/
│   │   └── Saraswati.jpeg  # Hero image (embedded locally)
│   ├── components/
│   │   ├── Navbar.js / .css
│   │   ├── Hero.js / .css
│   │   ├── About.js / .css
│   │   ├── Portraits.js / .css
│   │   ├── Wildlife.js / .css
│   │   ├── CollectionCarousel.js / .css   ← Main interactive feature
│   │   ├── QuoteBand.js / .css
│   │   ├── Newsletter.js / .css
│   │   ├── Footer.js / .css
│   │   └── ParticleCanvas.js
│   ├── hooks/
│   │   └── useScrollReveal.js
│   ├── App.js
│   ├── index.js
│   └── index.css           # Global styles & CSS variables
└── package.json
```

## 🎨 Design System

| Token | Value |
|-------|-------|
| `--gold` | `#C9A84C` |
| `--gold-light` | `#F0D080` |
| `--deep` | `#06061A` |
| `--midnight` | `#0C0C28` |
| Font Display | Cormorant Garamond |
| Font UI | Cinzel / Cinzel Decorative |
| Font Body | Crimson Pro |

## 🌐 Image Sources

- **Saraswati** — Local asset (`src/assets/Saraswati.jpeg`)
- **All other images** — Loaded from `https://www.vkartbox.com/assets/img/`

To host fully offline, download those images and update the `src` paths in `Portraits.js`, `Wildlife.js`, and `CollectionCarousel.js`.

---

*Handcrafted with love © 2026 VkArtBox*
# VkArtBox
