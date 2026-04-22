import React, { createContext, useState, useEffect, ReactNode } from 'react';
import {
  signUp,
  signIn,
  logout,
  resetPassword,
  onAuthChange,
  getUserByUID,
  auth,
} from '../services/firebaseService';
import { User, AuthContextType } from '../types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle user signup
   */
  const handleSignup = async (
    email: string,
    password: string,
    role: 'Donor' | 'Receiver',
    organizationName: string,
    organizationType?: string
  ) => {
    try {
      setError(null);
      await signUp(email, password, role, organizationName, organizationType);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Handle user login
   */
  const handleLogin = async (email: string, password: string) => {
    try {
      setError(null);
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      setError(null);
      await logout();
      setCurrentUser(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Handle password reset
   */
  const handleResetPassword = async (email: string) => {
    try {
      setError(null);
      await resetPassword(email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Listen to auth state changes and update user
   */
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user document from Firestore
          const userData = await getUserByUID(firebaseUser.uid);
          if (userData) {
            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: userData.role,
              organizationName: userData.organizationName,
              organizationType: userData.organizationType,
              createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt),
              updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : new Date(userData.updatedAt),
            });
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load user data');
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    signup: handleSignup,
    login: handleLogin,
    logout: handleLogout,
    resetPassword: handleResetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
