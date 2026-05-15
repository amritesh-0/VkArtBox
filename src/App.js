import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParticleCanvas from './components/ParticleCanvas';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import CollectionDetail from './pages/CollectionDetail';
import Careers from './pages/Careers';
import CareerApplication from './pages/CareerApplication';
import PrivacyPolicy from './pages/PrivacyPolicy';

function AdminRedirect() {
  useEffect(() => {
    window.location.replace('https://admin.vkartbox.com');
  }, []);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ParticleCanvas />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/careers/apply" element={<CareerApplication />} />
        <Route path="/admin" element={<AdminRedirect />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/collection/:id" element={<CollectionDetail />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
