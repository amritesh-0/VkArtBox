import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './components/AuthProvider';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import ManageBlogs from './pages/ManageBlogs';
import ManageCollections from './pages/ManageCollections';
import BlogForm from './pages/BlogForm';
import ArtworkForm from './pages/ArtworkForm';
import Login from './pages/Login';
import Settings from './pages/Settings';
import CareerApplications from './pages/CareerApplications';
import ContactMessages from './pages/ContactMessages';
import './Admin.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: 'var(--admin-bg-secondary)',
            color: 'var(--admin-text-primary)',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.9rem',
            border: '1px solid var(--admin-border)'
          }
        }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="blogs" element={<ManageBlogs />} />
              <Route path="blogs/new" element={<BlogForm />} />
              <Route path="blogs/:id/edit" element={<BlogForm />} />
              <Route path="collections" element={<ManageCollections />} />
              <Route path="collections/new" element={<ArtworkForm />} />
              <Route path="collections/:id/edit" element={<ArtworkForm />} />
              <Route path="applications" element={<CareerApplications />} />
              <Route path="contacts" element={<ContactMessages />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
