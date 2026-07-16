import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { initializeAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseApp } from './firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const firebaseAuth = initializeAuth(firebaseApp);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      if (!auth) throw new Error('Auth not initialized');
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [auth]);

  const register = useCallback(async (email, password, displayName) => {
    try {
      setError(null);
      setLoading(true);
      if (!auth) throw new Error('Auth not initialized');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update display name if provided
      if (displayName && userCredential.user.updateProfile) {
        await userCredential.user.updateProfile({ displayName });
      }
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [auth]);

  const logout = useCallback(async () => {
    try {
      setError(null);
      if (!auth) throw new Error('Auth not initialized');
      await signOut(auth);
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, auth }}>
      {children}
    </AuthContext.Provider>
  );
};
