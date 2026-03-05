# VkArtBox

VkArtBox is a React-based portfolio and content website for an art brand, featuring an immersive home experience, a journal/blog section, and detailed article pages.

## Overview

- Built with React 18 and React Router
- Multi-page routing for home, contact, blog listing, and blog details
- Rich visual style with animated hero, particle background, and interactive collection cards
- Responsive layout optimized for desktop, tablet, and mobile

## Routes

- `/` -> Home
- `/contact` -> Contact page
- `/blogs` -> Blog listing
- `/blog/:id` -> Blog detail page

## Tech Stack

- React 18
- React Router DOM
- React Scripts (Create React App)
- Plain CSS modules by feature/page

## Getting Started

### Prerequisites

- Node.js 16+ (Node.js 18+ recommended)
- npm

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm start
```

Default local URL: `http://localhost:3000`

### Create Production Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

## Available Scripts

- `npm start` - Starts the development server
- `npm run build` - Builds optimized production assets into `build/`
- `npm test` - Runs the test runner in watch mode
- `npm run eject` - Ejects CRA configuration (irreversible)

## Project Structure

```text
vkartbox/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── Hero.js
│   │   ├── About.js
│   │   ├── CollectionCarousel.js
│   │   ├── QuoteBand.js
│   │   ├── Newsletter.js
│   │   ├── Footer.js
│   │   └── ParticleCanvas.js
│   ├── data/
│   │   └── blogData.js
│   ├── hooks/
│   │   └── useScrollReveal.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Contact.js
│   │   ├── Blogs.js
│   │   └── BlogDetail.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Notes

- Some content imagery is served from external URLs.
- If running in a fully offline environment, replace external image URLs with local assets.

## License

This project is private and intended for VkArtBox use unless stated otherwise.