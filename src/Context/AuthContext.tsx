import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  name: string;
  email: string;
  phone: string;
  university: string;
  profilePicture?: string;
  wishlist: number[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  users: User[];
  login: (identifier: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phone: string, university: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setUsers: (users: User[] | ((prev: User[]) => User[])) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
    {
      name: "علی محمدی",
      email: "superadmin@example.com",
      phone: "09123456789",
      university: "دانشگاه تهران",
      profilePicture: "/assets/default-profile.jpg",
      wishlist: [],
    }
  ]);

  const login = async (identifier: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (identifier && password) {
          const existingUser = users.find(
            (u) => u.email === identifier || u.phone === identifier
          );
          if (existingUser) {
            setUser({ ...existingUser, wishlist: existingUser.wishlist || [] });
            setIsAuthenticated(true);
            resolve();
          } else {
            reject(new Error('کاربری با این ایمیل یا شماره تلفن یافت نشد!'));
          }
        } else {
          reject(new Error('ایمیل یا شماره تلفن و رمز عبور وارد نشده است!'));
        }
      }, 500);
    });
  };

  const signup = async (name: string, email: string, password: string, phone: string, university: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (name && email && password && phone && university) {
          const newUser: User = { 
            name, 
            email, 
            phone,
            university,
            profilePicture: '/assets/default-profile.jpg', 
            wishlist: [] 
          };
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
  return context;
};