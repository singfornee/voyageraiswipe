import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, User, Auth } from 'firebase/auth';
import { auth, db } from '../firebase';  // Ensure db is imported from your firebase config
import { doc, getDoc } from 'firebase/firestore';  // Import Firestore functions

// Define the interface for your AuthContext
interface AuthContextProps {
  currentUser: User | null;
  profile: { displayName: string; profileIcon: string };  // Add profile data to the context
  setProfile: (profile: { displayName: string; profileIcon: string }) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;  // Add resetPassword to the context
  logout: () => Promise<void>;
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
  const [profile, setProfile] = useState<{ displayName: string; profileIcon: string }>({ displayName: '', profileIcon: '' });
  const [loading, setLoading] = useState(true);

  // Define the login function
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

  // Fetch user profile data from Firestore
  const fetchUserProfile = async (user: User) => {
    const userDocRef = doc(db, 'userPreferences', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setProfile({
        displayName: userData?.displayName || user.displayName || '',
        profileIcon: userData?.profileIcon || '',
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
        setProfile({ displayName: '', profileIcon: '' });
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    profile,
    setProfile,  // Expose setProfile function to update profile state
    login,
    register,
    resetPassword, // Add resetPassword to the context
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
