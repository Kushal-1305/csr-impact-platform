// context/AuthContext.jsx — Global state for authentication.
//
// React Context = a "global store" accessible by any component in the tree.
// Without context, you'd have to pass the user object as a prop through
// every component — that gets messy fast. Context solves this.
//
// How it works:
//   1. AuthProvider wraps the whole app (in main.jsx)
//   2. Any component can call useAuth() to get the current user & auth functions
//   3. When user logs in/out, all components automatically re-render with new state

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

// Step 1: Create the context "bulletin board"
const AuthContext = createContext(null);

// Step 2: The Provider component that wraps the entire app
export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);   // Currently logged-in user
  const [loading, setLoading] = useState(true); // True while checking login status on startup

  // On app start: check if a token exists in localStorage (user was previously logged in)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login: save token + user to localStorage and update state
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Logout: clear everything
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Step 3: Custom hook — shortcut so any component can do: const { user } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
