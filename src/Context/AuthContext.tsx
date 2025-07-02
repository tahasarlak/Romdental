import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  name: string;
  email: string;
  phone: string;
  university: string;
  gender: 'مرد' | 'زن' | '';
  course?: string;
  profilePicture?: string;
  wishlist: number[];
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  users: User[];
  login: (identifier: string, password: string, course?: string, gender?: 'مرد' | 'زن') => Promise<void>;
  signup: (name: string, email: string, password: string, phone: string, university: string, gender: 'مرد' | 'زن', course?: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => Promise<void>;
  setUsers: (users: User[] | ((prev: User[]) => User[])) => void;
  addToWishlist: (userId: string, itemId: number) => void;
  removeFromWishlist: (userId: string, itemId: number) => void;
  updatePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUserState] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
    {
      name: 'علی محمدی',
      email: 'superadmin@example.com',
      phone: '09123456789',
      university: 'دانشگاه تهران',
      gender: 'مرد',
      profilePicture: '/assets/default-profile.jpg',
      wishlist: [],
      password: 'password123',
    },
  ]);

  const login = async (identifier: string, password: string, course?: string, gender?: 'مرد' | 'زن') => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (identifier && password) {
          const existingUser = users.find((u) => (u.email === identifier || u.phone === identifier) && u.password === password);
          if (existingUser) {
            setUserState({
              ...existingUser,
              course: course || existingUser.course,
              gender: gender || existingUser.gender,
              wishlist: existingUser.wishlist || [],
            });
            setIsAuthenticated(true);
            resolve();
          } else {
            reject(new Error('ایمیل، شماره تلفن یا رمز عبور اشتباه است'));
          }
        } else {
          reject(new Error('ایمیل یا شماره تلفن و رمز عبور الزامی است'));
        }
      }, 500);
    });
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    phone: string,
    university: string,
    gender: 'مرد' | 'زن',
    course?: string
  ) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (name && email && password && phone && university && gender) {
          if (users.some((u) => u.email === email || u.phone === phone)) {
            reject(new Error('ایمیل یا شماره تلفن قبلاً ثبت شده است'));
            return;
          }
          const newUser: User = {
            name,
            email,
            phone,
            university,
            gender,
            course,
            profilePicture: '/assets/default-profile.jpg',
            wishlist: [],
            password,
          };
          setUsers((prev) => [...prev, newUser]);
          setUserState(newUser);
          setIsAuthenticated(true);
          resolve();
        } else {
          reject(new Error('همه فیلدها باید پر شوند'));
        }
      }, 500);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserState(null);
  };

  const setUser = async (updatedUser: User | null) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (updatedUser) {
          setUsers((prev) =>
            prev.map((u) => (u.email === updatedUser.email ? updatedUser : u))
          );
          setUserState(updatedUser);
        } else {
          setUserState(null);
        }
        resolve();
      }, 500);
    });
  };

  const addToWishlist = (userId: string, itemId: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.email === userId || u.phone === userId
          ? { ...u, wishlist: [...u.wishlist, itemId] }
          : u
      )
    );
    if (user && (user.email === userId || user.phone === userId)) {
      setUserState({ ...user, wishlist: [...user.wishlist, itemId] });
    }
  };

  const removeFromWishlist = (userId: string, itemId: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.email === userId || u.phone === userId
          ? { ...u, wishlist: u.wishlist.filter((id) => id !== itemId) }
          : u
      )
    );
    if (user && (user.email === userId || user.phone === userId)) {
      setUserState({ ...user, wishlist: user.wishlist.filter((id) => id !== itemId) });
    }
  };

  const updatePassword = async (userId: string, currentPassword: string, newPassword: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const user = users.find((u) => (u.email === userId || u.phone === userId) && u.password === currentPassword);
        if (!user) {
          reject(new Error('رمز عبور فعلی اشتباه است'));
          return;
        }
        setUsers((prev) =>
          prev.map((u) =>
            u.email === userId || u.phone === userId ? { ...u, password: newPassword } : u
          )
        );
        if (user && (user.email === userId || user.phone === userId)) {
          setUserState({ ...user, password: newPassword });
        }
        resolve();
      }, 500);
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, users, login, signup, logout, setUser, setUsers, addToWishlist, removeFromWishlist, updatePassword }}>
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