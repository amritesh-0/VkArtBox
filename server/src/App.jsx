import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ManageBlogs from './pages/ManageBlogs';
import ManageCollections from './pages/ManageCollections';
import BlogForm from './pages/BlogForm';
import ArtworkForm from './pages/ArtworkForm';
import './Admin.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="blogs" element={<ManageBlogs />} />
          <Route path="blogs/new" element={<BlogForm />} />
          <Route path="collections" element={<ManageCollections />} />
          <Route path="collections/new" element={<ArtworkForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
