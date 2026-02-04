import { createContext, useState, useEffect, type ReactNode } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup,
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

  // Effect: Listen for auth state changes
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

  const loginWithGoogle = async () => {
    console.log('Login clicked');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Always use popup for better reliability
      console.log('Using signInWithPopup...');
      await signInWithPopup(auth, provider);
      console.log('Popup login successful');
    } catch (error) {
      console.error('❌ Login error:', error);
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
