import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParticleCanvas from './components/ParticleCanvas';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';

function App() {
  return (
    <BrowserRouter>
      <ParticleCanvas />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
