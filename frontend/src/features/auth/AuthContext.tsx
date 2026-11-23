import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, authService } from '../../services/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: 'CUSTOMER' | 'OWNER';
  }) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  upgradeToOwner: (data: { ownerBio: string; ownerAddress: string; phone: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('borrowbuy_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    if (!localStorage.getItem('borrowbuy_token')) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await authService.getMe();
      setUser(res.data);
    } catch (err) {
      console.warn('Session expired or invalid token');
      localStorage.removeItem('borrowbuy_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await authService.login({ email, password });
    localStorage.setItem('borrowbuy_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: 'CUSTOMER' | 'OWNER';
  }): Promise<User> => {
    const res = await authService.register(data);
    localStorage.setItem('borrowbuy_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('borrowbuy_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const upgradeToOwner = async (data: { ownerBio: string; ownerAddress: string; phone: string }) => {
    const res = await authService.becomeOwner(data);
    localStorage.setItem('borrowbuy_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        upgradeToOwner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

