import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';

// Re-export the AuthProvider as UserProvider for backward compatibility
export const UserProvider = AuthProvider;

// Create a useUser hook that maps to useAuth but returns the expected structure
export const useUser = () => {
  const authContext = useAuth();
  
  // Map the auth context to the expected user context structure
  return {
    userInfo: authContext.user,
    login: authContext.login,
    logout: authContext.logout,
    loading: authContext.loading
  };
};