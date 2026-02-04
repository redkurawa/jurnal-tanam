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
  const [authError, setAuthError] = useState<string | null>(null);

  // Effect 1: Handle redirect result (runs first when page loads)
  useEffect(() => {
    console.log('Checking for redirect result...');
    
    getRedirectResult(auth)
      .then(async (result) => {
        console.log('Redirect result:', result);
        
        if (result?.user) {
          console.log('✅ User logged in via redirect:', result.user.email);
          
          try {
            // Check/create user in Firestore
            const userRef = doc(db, 'users', result.user.uid);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) {
              console.log('Creating new user in Firestore...');
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
              
              setCurrentUser({ uid: result.user.uid, ...newUser });
            } else {
              console.log('User exists in Firestore');
              const userData = userSnap.data() as Omit<User, 'uid'>;
              setCurrentUser({ uid: result.user.uid, ...userData });
            }
          } catch (dbError) {
            console.error('❌ Firestore error:', dbError);
            setAuthError('Gagal menyimpan data user');
          }
        } else {
          console.log('ℹ️ Redirect result is null - this is normal if not coming from Google OAuth');
        }
      })
      .catch((error) => {
        console.error('❌ getRedirectResult error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        if (error.code === 'auth/unauthorized-domain') {
          setAuthError('Domain tidak diizinkan. Tambahkan domain ini ke Firebase Console > Authentication > Settings > Authorized Domains');
        } else if (error.code === 'auth/popup-closed-by-user') {
          setAuthError('Login dibatalkan. Silakan coba lagi.');
        } else if (error.code !== 'auth/no-auth-event') {
          setAuthError(`Error: ${error.message || 'Terjadi kesalahan saat login'}`);
        }
      });
  }, []);

  // Effect 2: Listen for auth state changes
  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email || 'no user');
      setFirebaseUser(user);
      
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data() as Omit<User, 'uid'>;
            setCurrentUser({ uid: user.uid, ...userData });
          } else {
            // Create user if not exists
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
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check if running on localhost
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

  const loginWithGoogle = async () => {
    console.log('Login clicked, isLocalhost:', isLocalhost);
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      if (isLocalhost) {
        console.log('Using signInWithPopup for localhost...');
        await signInWithPopup(auth, provider);
      } else {
        console.log('Using signInWithRedirect for production...');
        await signInWithRedirect(auth, provider);
      }
    } catch (error) {
      console.error('Login error:', error);
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
    loading,
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
