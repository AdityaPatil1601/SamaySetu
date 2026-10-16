import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../data/seedData';
import { CollegeStorage } from '../services/storage/collegeStorage';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (role: UserRole, specificUserId?: string) => void;
  logout: () => void;
  switchUser: (user: User) => void;
  availableUsers: User[];
  hasRole: (allowed: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => CollegeStorage.loadCurrentUser());

  // Enforce permanent light theme - remove any legacy dark class
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    CollegeStorage.saveCurrentUser(currentUser);
  }, [currentUser]);

  const login = (targetRole: UserRole, specificUserId?: string) => {
    let matchedUser: User | undefined;
    if (specificUserId) {
      matchedUser = DEMO_USERS.find(u => u.id === specificUserId);
    }
    if (!matchedUser) {
      matchedUser = DEMO_USERS.find(u => u.role === targetRole);
    }
    if (matchedUser) {
      setCurrentUser(matchedUser);
      CollegeStorage.logActivity(
        'STRUCTURE_CHANGE',
        `User Logged In`,
        `${matchedUser.name} signed in as ${matchedUser.role.toUpperCase()}`
      );
    }
  };

  const logout = () => {
    setCurrentUser(null);
    CollegeStorage.saveCurrentUser(null);
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    CollegeStorage.logActivity(
      'STRUCTURE_CHANGE',
      `Switched Active User`,
      `Active account switched to ${user.name} (${user.role})`
    );
  };

  const hasRole = (allowed: UserRole[]): boolean => {
    if (!currentUser) return false;
    return allowed.includes(currentUser.role);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isAuthenticated: !!currentUser,
        login,
        logout,
        switchUser,
        availableUsers: DEMO_USERS,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
