import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
            if (!nextUser) {
                setUser(null);
                setIsAdmin(false);
                setAuthLoading(false);
                return;
            }

            try {
                // The same custom claim is enforced by Firestore, Storage, and
                // the protected workshop API. A signed-in user is not an admin
                // unless a trusted server has granted this claim.
                const token = await nextUser.getIdTokenResult();
                setUser(nextUser);
                setIsAdmin(token.claims.admin === true);
            } catch (error) {
                console.error('Unable to verify admin permissions:', error);
                setUser(null);
                setIsAdmin(false);
            } finally {
                setAuthLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const value = useMemo(() => ({
        user,
        isAdmin,
        authLoading,
        logout: () => signOut(auth),
    }), [user, isAdmin, authLoading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
