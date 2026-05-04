import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthContextType, User, LoginCredentials, RegisterData } from '../types/auth.types';
import { authService } from '../services/auth.service';
import { decodeToken } from '../utils/jwt.utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const savedToken = authService.getToken();
      if (savedToken) {
        const decodedUser = decodeToken(savedToken);
        if (decodedUser) {
          setToken(savedToken);
          setUser(decodedUser);
          authService.saveUser(decodedUser);
        } else {
          authService.logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    const decodedUser = decodeToken(response.token);
    if (!decodedUser) throw new Error('Invalid token received');
    
    authService.saveToken(response.token);
    authService.saveUser(decodedUser);
    setToken(response.token);
    setUser(decodedUser);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const response = await authService.register(data);
    const decodedUser = decodeToken(response.token);
    if (!decodedUser) throw new Error('Invalid token received');
    
    authService.saveToken(response.token);
    authService.saveUser(decodedUser);
    setToken(response.token);
    setUser(decodedUser);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
