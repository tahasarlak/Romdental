import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  name: string;
  email: string;
  profilePicture?: string;
  wishlist: number[]; // Explicitly defined as number[]
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setUsers: (users: User[] | ((prev: User[]) => User[])) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const login = async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const existingUser = users.find((u) => u.email === email);
          if (existingUser) {
            setUser({ ...existingUser, wishlist: existingUser.wishlist || [] });
            setIsAuthenticated(true);
            resolve();
          } else {
            reject(new Error('کاربری با این ایمیل یافت نشد!'));
          }
        } else {
          reject(new Error('ایمیل یا رمز عبور وارد نشده است!'));
        }
      }, 500);
    });
  };

  const signup = async (name: string, email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (name && email && password) {
          const newUser: User = { 
            name, 
            email, 
            profilePicture: '/assets/default-profile.jpg', 
            wishlist: [] 
          }; // Explicitly annotate newUser as User
          setUsers((prev) => [...prev, newUser]);
          setUser(newUser);
          setIsAuthenticated(true);
          resolve();
        } else {
          reject(new Error('همه فیلدها باید پر شوند!'));
        }
      }, 500);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        users,
        login,
        signup,
        logout,
        setUser,
        setUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;};