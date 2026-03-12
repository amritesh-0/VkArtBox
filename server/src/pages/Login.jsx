import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import toast from 'react-hot-toast';
import { LockKeyhole, Mail } from 'lucide-react';
import { auth } from '../firebase';
import { useAuth } from '../components/AuthProvider';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, authLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const destination = location.state?.from?.pathname || '/';

    if (!authLoading && user) {
        return <Navigate to={destination} replace />;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!email.trim() || !password) {
            toast.error('Enter your admin email and password.');
            return;
        }

        setSubmitting(true);
        const toastId = toast.loading('Signing in...');

        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
            toast.success('Signed in successfully.', { id: toastId });
            navigate(destination, { replace: true });
        } catch (error) {
            console.error('Admin login failed:', error);
            toast.error('Invalid credentials or access denied.', { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="admin-auth-shell">
            <div className="admin-auth-card">
                <p className="admin-auth-kicker">VkArtBox Admin</p>
                <h1 className="admin-auth-title">Sign in to manage content</h1>
                <p className="admin-auth-copy">
                    Use your Firebase Authentication admin account to access blogs, collections, and dashboard tools.
                </p>

                <form className="admin-auth-form" onSubmit={handleSubmit}>
                    <label className="admin-auth-field">
                        <span>Email</span>
                        <div className="admin-auth-input-wrap">
                            <Mail size={16} />
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="admin@vkartbox.com"
                                autoComplete="email"
                            />
                        </div>
                    </label>

                    <label className="admin-auth-field">
                        <span>Password</span>
                        <div className="admin-auth-input-wrap">
                            <LockKeyhole size={16} />
                            <input
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Enter password"
                                autoComplete="current-password"
                            />
                        </div>
                    </label>

                    <button type="submit" className="btn-primary admin-auth-submit" disabled={submitting}>
                        {submitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
