import { useState } from 'react';
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
} from 'firebase/auth';
import toast from 'react-hot-toast';
import { KeyRound } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';

const initialPasswordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
};

const Settings = () => {
    const { user } = useAuth();
    const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
    const [changingPassword, setChangingPassword] = useState(false);

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdatePassword = async (event) => {
        event.preventDefault();

        if (!user?.email) {
            toast.error('No authenticated admin found.');
            return;
        }

        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            toast.error('Enter the current and new password.');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters.');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('New passwords do not match.');
            return;
        }

        setChangingPassword(true);
        const toastId = toast.loading('Updating password...');

        try {
            const credential = EmailAuthProvider.credential(user.email, passwordForm.currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, passwordForm.newPassword);
            toast.success('Password updated successfully.', { id: toastId });
            setPasswordForm(initialPasswordForm);
        } catch (error) {
            console.error('Failed to update password:', error);
            toast.error(error.message || 'Failed to update password.', { id: toastId });
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h2>Settings</h2>
            </div>

            <div className="settings-grid">
                <section className="admin-card settings-card">
                    <div className="settings-card__header">
                        <KeyRound size={20} />
                        <div>
                            <h3>Change Password</h3>
                            <p>Signed in as {user?.email || 'current admin'}.</p>
                        </div>
                    </div>

                    <form className="admin-form" onSubmit={handleUpdatePassword}>
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter current password"
                            />
                        </div>

                        <div className="form-group-row">
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Minimum 6 characters"
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Repeat new password"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary" disabled={changingPassword}>
                                {changingPassword ? 'Updating...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default Settings;
