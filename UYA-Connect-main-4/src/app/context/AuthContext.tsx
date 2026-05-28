import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, users, Gender } from '../data/mockData';

export interface RegisterData {
  name: string;
  age: number;
  address: string;
  email: string;
  gender: Gender;
  contactNumber: string;
  password: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;
  register: (data: RegisterData) => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start with no user logged in.
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  const login = (email: string, password: string): boolean => {
    // Simple mock login - find user by email in both default users and registered users.
    const allUsers = [...users, ...registeredUsers];
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const register = (data: RegisterData): { success: boolean; message: string } => {
    const allUsers = [...users, ...registeredUsers];

    if (allUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, message: 'Email already exists' };
    }

    if (
      !data.name.trim() ||
      !data.age ||
      !data.address.trim() ||
      !data.email.trim() ||
      !data.gender ||
      !data.contactNumber.trim() ||
      !data.password
    ) {
      return { success: false, message: 'All fields are required' };
    }

    if (data.age < 1) {
      return { success: false, message: 'Please enter a valid age' };
    }

    if (data.password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      age: data.age,
      address: data.address.trim(),
      email: data.email.trim(),
      gender: data.gender,
      contactNumber: data.contactNumber.trim(),
      role: 'member',
      status: 'active',
    };

    setRegisteredUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser); // Auto-login after registration.
    return { success: true, message: 'Registration successful' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, setCurrentUser, register }}>
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
