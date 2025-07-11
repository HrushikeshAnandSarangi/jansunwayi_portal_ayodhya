import React, { createContext, useContext, useState, ReactNode } from 'react';

type User = {
  id: string;
  name: string;
  role: 'admin' | 'user';
};

type AppContextType = {
  currentLang: 'en' | 'hi';
  toggleLanguage: () => void;
  user: User | null;
  isLoggedIn: boolean; // <-- Add this line
  login: (email: string, password: string, role: 'admin' | 'user') => void;
  logout: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState<'en' | 'hi'>('en');
  const [user, setUser] = useState<User | null>(null);

  const toggleLanguage = () => {
    setCurrentLang(currentLang === 'en' ? 'hi' : 'en');
  };

  const login = async (email: string, password: string, role: 'admin' | 'user') => {
    if (role !== 'admin') throw new Error('Only admin login is supported');
    try {
      const res = await fetch('https://jansunwayi-portal-ayodhya.onrender.com/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        throw new Error('Invalid credentials');
      }
      const data = await res.json();
      setUser({ id: 'admin', name: data.email, role: 'admin' });
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    currentLang,
    toggleLanguage,
    user,
    isLoggedIn: !!user, // <-- Add this line
    login,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
