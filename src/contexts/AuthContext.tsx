import { createContext, useState, useEffect, type ReactNode } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect, 
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import type { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  authError: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // Check if we just came back from a redirect
        const result = await getRedirectResult(auth);
        
        if (result?.user && isMounted) {
          console.log('Redirect login successful:', result.user.email);
          
          // User just logged in via redirect
          const userRef = doc(db, 'users', result.user.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            console.log('Creating new user document');
            // Create new user
            const newUser: Omit<User, 'uid'> = {
              googleId: result.user.uid,
              nama: result.user.displayName || 'Pengguna',
              email: result.user.email || '',
              foto: result.user.photoURL || undefined,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            await setDoc(userRef, {
              ...newUser,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            
            if (isMounted) {
              setCurrentUser({ uid: result.user.uid, ...newUser });
            }
          } else {
            console.log('User document exists');
            if (isMounted) {
              const userData = userSnap.data() as Omit<User, 'uid'>;
              setCurrentUser({ uid: result.user.uid, ...userData });
            }
          }
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat login';
          setAuthError(errorMessage);
        }
      }

      // Listen for auth state changes
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!isMounted) return;
        
        console.log('Auth state changed:', user?.email || 'null');
        setFirebaseUser(user);
        
        if (user) {
          // Get user document from Firestore
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data() as Omit<User, 'uid'>;
            setCurrentUser({ uid: user.uid, ...userData });
          } else {
            // User exists in Auth but not in Firestore (shouldn't happen normally)
            const newUser: Omit<User, 'uid'> = {
              googleId: user.uid,
              nama: user.displayName || 'Pengguna',
              email: user.email || '',
              foto: user.photoURL || undefined,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            await setDoc(userRef, {
              ...newUser,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            
            setCurrentUser({ uid: user.uid, ...newUser });
          }
        } else {
          setCurrentUser(null);
        }
        
        setLoading(false);
      });

      return () => {
        unsubscribe();
      };
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Check if running on localhost
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      if (isLocalhost) {
        // Use popup for localhost (better for development)
        console.log('Using signInWithPopup for localhost...');
        await signInWithPopup(auth, provider);
      } else {
        // Use redirect for production
        setIsRedirecting(true);
        console.log('Using signInWithRedirect for production...');
        await signInWithRedirect(auth, provider);
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsRedirecting(false);
      const errorMessage = error instanceof Error ? error.message : 'Gagal login dengan Google';
      setAuthError(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const value = {
    currentUser,
    firebaseUser,
    loading: loading || isRedirecting,
    authError,
    loginWithGoogle,
    logout,
    clearAuthError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
