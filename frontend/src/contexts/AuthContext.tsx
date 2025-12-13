import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users - seeded as per requirements
const DEMO_USERS: { [key: string]: { password: string; user: User } } = {
  'hire-me@anshumat.org': {
    password: 'HireMe@2025!',
    user: {
      id: '1',
      email: 'hire-me@anshumat.org',
      name: 'Demo Admin',
      role: 'admin',
      department: 'Management',
      createdAt: new Date().toISOString(),
    },
  },
  'employee@demo.com': {
    password: 'Employee@123',
    user: {
      id: '2',
      email: 'employee@demo.com',
      name: 'John Employee',
      role: 'employee',
      department: 'Engineering',
      createdAt: new Date().toISOString(),
    },
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('payroll_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check demo users first
    const demoUser = DEMO_USERS[email.toLowerCase()];
    if (demoUser && demoUser.password === password) {
      setUser(demoUser.user);
      localStorage.setItem('payroll_user', JSON.stringify(demoUser.user));
      toast.success(`Welcome back, ${demoUser.user.name}!`);
      return true;
    }

    // Check registered users
    const registeredUsers = JSON.parse(localStorage.getItem('payroll_registered_users') || '{}');
    const registeredUser = registeredUsers[email.toLowerCase()];
    if (registeredUser && registeredUser.password === password) {
      setUser(registeredUser.user);
      localStorage.setItem('payroll_user', JSON.stringify(registeredUser.user));
      toast.success(`Welcome back, ${registeredUser.user.name}!`);
      return true;
    }

    toast.error('Invalid email or password');
    return false;
  };

  const signup = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    // Check if user already exists
    if (DEMO_USERS[email.toLowerCase()]) {
      toast.error('This email is already registered');
      return false;
    }

    const registeredUsers = JSON.parse(localStorage.getItem('payroll_registered_users') || '{}');
    if (registeredUsers[email.toLowerCase()]) {
      toast.error('This email is already registered');
      return false;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      name,
      role,
      department: role === 'admin' ? 'Management' : 'General',
      createdAt: new Date().toISOString(),
    };

    registeredUsers[email.toLowerCase()] = {
      password,
      user: newUser,
    };

    localStorage.setItem('payroll_registered_users', JSON.stringify(registeredUsers));
    setUser(newUser);
    localStorage.setItem('payroll_user', JSON.stringify(newUser));
    toast.success('Account created successfully!');
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('payroll_user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
