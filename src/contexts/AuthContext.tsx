import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Types
interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Google provider
const googleProvider = new GoogleAuthProvider();

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Sign in with Google
    const signInWithGoogle = async () => {
        try {
            setError(null);
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to sign in with Google';
            setError(message);
            throw err;
        }
    };

    // Sign in with email/password
    const signInWithEmail = async (email: string, password: string) => {
        try {
            setError(null);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to sign in';
            setError(message);
            throw err;
        }
    };

    // Sign up with email/password
    const signUpWithEmail = async (email: string, password: string) => {
        try {
            setError(null);
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create account';
            setError(message);
            throw err;
        }
    };

    // Sign out
    const signOut = async () => {
        try {
            setError(null);
            await firebaseSignOut(auth);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to sign out';
            setError(message);
            throw err;
        }
    };

    // Clear error
    const clearError = () => setError(null);

    const value: AuthContextType = {
        user,
        loading,
        error,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
