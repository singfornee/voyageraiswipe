import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User,
  Auth,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface Profile {
  displayName: string;
  profileIcon: string;
  preferences: string[];  // Ensure preferences are included
}

// Define the interface for your AuthContext
interface AuthContextProps {
  currentUser: User | null;
  profile: Profile;  // Use the Profile interface for the profile data
  setProfile: (profile: Profile) => void;  // Ensure setProfile uses the Profile interface
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loading: boolean;
}

// Create the AuthContext with a default value of undefined
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>({ displayName: '', profileIcon: '', preferences: [] });
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth as Auth, email, password);
  };

  const register = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth as Auth, email, password);
  };

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth as Auth);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth as Auth, provider);
      const user = result.user;

      await fetchUserProfile(user);

      setCurrentUser(user);
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  const fetchUserProfile = async (user: User) => {
    const userDocRef = doc(db, 'userPreferences', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setProfile({
        displayName: userData?.displayName || user.displayName || '',
        profileIcon: userData?.profileIcon || '',
        preferences: userData?.preferences || [],
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth as Auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        await fetchUserProfile(user);
      } else {
        setProfile({ displayName: '', profileIcon: '', preferences: [] });
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    profile,
    setProfile,
    login,
    register,
    resetPassword,
    logout,
    loginWithGoogle,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
