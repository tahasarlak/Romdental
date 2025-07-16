import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/types';

export interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  signup: (
    name: string,
    email: string,
    password: string,
    phone: string,
    university: string,
    gender: 'مرد' | 'زن',
    course: string,
    role?: 'Student' | 'Instructor' | 'Admin' | 'SuperAdmin',
    profilePicture?: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updatePassword: (email: string, currentPassword: string, newPassword: string) => Promise<void>;
  setUser: (user: User) => Promise<void>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  manageUser: (userId: number, updatedData: Partial<User>) => Promise<void>;
  universities: string[];
  addUniversity: (university: string) => void;
  deleteUser: (userId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [universities, setUniversities] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const signup = async (
    name: string,
    email: string,
    password: string,
    phone: string,
    university: string,
    gender: 'مرد' | 'زن',
    course: string,
    role: 'Student' | 'Instructor' | 'Admin' | 'SuperAdmin' = 'Student',
    profilePicture?: string
  ) => {
    const newUser: User = {
      id: Math.max(...users.map((u) => u.id), 0) + 1,
      name,
      email,
      password,
      phone,
      university,
      gender,
      role,
      course,
      profilePicture,
      wishlist: [],
      enrolledCourses: [],
      cart: [],
    };
    setUsers((prev) => [...prev, newUser]);
    setUserState(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('users', JSON.stringify([...users, newUser]));
  };

  const login = async (email: string, password: string) => {
    const foundUser = users.find((u) => u.email === email && u.password === password);
    if (foundUser) {
      setUserState(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(foundUser));
    } else {
      throw new Error('ایمیل یا رمز عبور اشتباه است.');
    }
  };

  const logout = () => {
    setUserState(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const updatePassword = async (email: string, currentPassword: string, newPassword: string) => {
    const foundUser = users.find((u) => u.email === email && u.password === currentPassword);
    if (foundUser) {
      const updatedUser = { ...foundUser, password: newPassword };
      setUsers((prev) => prev.map((u) => (u.id === foundUser.id ? updatedUser : u)));
      setUserState(updatedUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else {
      throw new Error('ایمیل یا رمز عبور اشتباه است.');
    }
  };

  const setUser = async (updatedUser: User) => {
    setUserState(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const manageUser = async (userId: number, updatedData: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updatedData } : u))
    );
    if (user && user.id === userId) {
      setUserState({ ...user, ...updatedData });
    }
    localStorage.setItem('users', JSON.stringify(users));
  };

  const addUniversity = (university: string) => {
    setUniversities((prev) => [...prev, university]);
  };

  const deleteUser = async (userId: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (user && user.id === userId) {
      setUserState(null);
      setIsAuthenticated(false);
    }
    localStorage.setItem('users', JSON.stringify(users.filter((u) => u.id !== userId)));
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedUsers = localStorage.getItem('users');
    if (storedUser) {
      setUserState(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isAuthenticated,
        setIsAuthenticated, // Added to the context value
        signup,
        login,
        logout,
        updatePassword,
        setUser,
        setUsers,
        manageUser,
        universities,
        addUniversity,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
};