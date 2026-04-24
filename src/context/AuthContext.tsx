import React, { createContext, useState, type ReactNode } from 'react';
import {
  signUp,
  signIn,
  logout,
  resetPassword,
  getUserByUID,
} from '../services/firebaseService';
import type { User, AuthContextType } from '../types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      const firebaseUser = await signUp(email, password, role, organizationName, organizationType);
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
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user login
   */
  const handleLogin = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const firebaseUser = await signIn(email, password);
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
      } else {
        console.error('User data not found for UID:', firebaseUser.uid);
        setError('User data not found. Please contact admin.');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
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