import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { User, CategorizedUsers, WishlistItem } from '../types/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  users: User[];
  categorizedUsers: CategorizedUsers;
  universities: string[];
  loading: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  login: (
    identifier: string,
    passwordInput: string,
    course?: string,
    gender?: 'مرد' | 'زن',
    role?: 'Student' | 'Instructor' | 'Blogger'
  ) => Promise<void>;
  signup: (
    name: string,
    email: string,
    passwordInput: string,
    phone: string,
    university: string,
    gender: 'مرد' | 'زن',
    course?: string,
    role?: 'Student' | 'Instructor' | 'Blogger' | 'Admin' | 'SuperAdmin',
    profilePicture?: string
  ) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => Promise<void>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  updatePassword: (userId: string, currentPasswordInput: string, newPassword: string) => Promise<void>;
  enrollInCourse: (userId: string, courseId: number) => Promise<void>;
  manageUser: (userId: string, updates: Partial<User>) => Promise<void>;
  addUniversity: (university: string) => void;
  deleteUser: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const hashPassword = (password: string): string => {
  return `hashed_${password}`;
};

const categorizeUsers = (users: User[]): CategorizedUsers => {
  const superAdmins: User[] = [];
  const admins: User[] = [];
  const instructors: User[] = [];
  const students: User[] = [];
  const bloggers: User[] = [];
  const multiRole: User[] = [];

  users.forEach((user) => {
    const roles = [
      user.role === 'SuperAdmin' && 'SuperAdmin',
      user.role === 'Admin' && 'Admin',
      user.role === 'Instructor' && 'Instructor',
      user.role === 'Student' && 'Student',
      user.role === 'Blogger' && 'Blogger',
    ].filter(Boolean);

    if (roles.length > 1) multiRole.push(user);
    if (user.role === 'SuperAdmin') superAdmins.push(user);
    if (user.role === 'Admin') admins.push(user);
    if (user.role === 'Instructor') instructors.push(user);
    if (user.role === 'Student') students.push(user);
    if (user.role === 'Blogger') bloggers.push(user);
  });

  return { superAdmins, admins, instructors, students, bloggers, multiRole };
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^09[0-9]{9}$/;
  return phoneRegex.test(phone);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const MALE_PROFILE_PICTURES = [
    '/assets/Profile/male-profile-1.jpg',
    '/assets/Profile/male-profile-2.jpg',
    '/assets/Profile/male-profile-3.jpg',
  ];
  const FEMALE_PROFILE_PICTURES = [
    '/assets/Profile/female-profile-1.jpg',
    '/assets/Profile/female-profile-2.jpg',
    '/assets/Profile/female-profile-3.jpg',
  ];

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUserState] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'علی محمدی',
      email: 'superadmin@example.com',
      phone: '09123456789',
      university: 'دانشگاه تهران',
      gender: 'مرد',
      profilePicture: MALE_PROFILE_PICTURES[0],
      wishlist: [{
        id: 1, type: 'course', name: '',
        likeDate: '',
        userId: 0
      }],
      enrolledCourses: [],
      cart: [],
      password: hashPassword('password123'),
      token: 'superadmin-token',
      course: 'مدیریت',
      role: 'SuperAdmin',
    },
    {
      id: 2,
      name: 'سارا احمدی',
      email: 'sara.ahmadi@example.com',
      phone: '09123456790',
      university: 'Smashko',
      gender: 'زن',
      profilePicture: FEMALE_PROFILE_PICTURES[0],
      wishlist: [],
      enrolledCourses: [1, 3],
      cart: [],
      password: hashPassword('sara12322'),
      token: 'instructor-token',
      course: 'آناتومی دندان',
      role: 'Instructor',
    },
    {
      id: 3,
      name: 'نیما رحیمی',
      email: 'nima.rahimi@example.com',
      phone: '09123456791',
      university: 'Sechenov',
      gender: 'مرد',
      profilePicture: MALE_PROFILE_PICTURES[1],
      wishlist: [
        {
          id: 1, type: 'course', name: '',
          likeDate: '',
          userId: 0
        },
        {
          id: 2, type: 'instructor', name: '',
          likeDate: '',
          userId: 0
        },
      ],
      enrolledCourses: [],
      cart: [],
      password: hashPassword('11111111111'),
      token: 'student-token-1623456789',
      course: 'ترمیمی',
      role: 'Student',
    },
  ]);
  const [universities, setUniversities] = useState<string[]>(['دانشگاه تهران', 'Smashko', 'Sechenov']);
  const [loading, setLoading] = useState<boolean>(false);

  const categorizedUsers = useMemo(() => categorizeUsers(users), [users]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedUser && storedAuth === 'true') {
      const parsedUser = JSON.parse(storedUser) as User;
      setUserState(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (
    identifier: string,
    passwordInput: string,
    course?: string,
    gender?: 'مرد' | 'زن',
    role?: 'Student' | 'Instructor' | 'Blogger'
  ) => {
    setLoading(true);
    try {
      if (!validateEmail(identifier) && !validatePhone(identifier)) {
        throw new Error('ایمیل یا شماره تلفن نامعتبر است.');
      }
      if (!validatePassword(passwordInput)) {
        throw new Error('رمز عبور باید حداقل ۸ کاراکتر باشد.');
      }

      const existingUser = users.find(
        (u) => (u.email === identifier || u.phone === identifier) && u.password === hashPassword(passwordInput)
      );
      if (!existingUser) throw new Error('ایمیل، شماره تلفن یا رمز عبور اشتباه است');

      const updatedUser = {
        ...existingUser,
        course: course || existingUser.course,
        gender: gender || existingUser.gender,
        role: role && ['Student', 'Instructor', 'Blogger'].includes(role) ? role : existingUser.role,
        token: `${existingUser.role.toLowerCase()}-token-${Date.now()}`,
      };
      setUserState(updatedUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('isAuthenticated', 'true');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    passwordInput: string,
    phone: string,
    university: string,
    gender: 'مرد' | 'زن',
    course?: string,
    role: 'Student' | 'Instructor' | 'Blogger' | 'Admin' | 'SuperAdmin' = 'Student',
    profilePicture?: string
  ) => {
    setLoading(true);
    try {
      if (!name.trim()) throw new Error('نام نمی‌تواند خالی باشد.');
      if (!validateEmail(email)) throw new Error('ایمیل نامعتبر است.');
      if (!validatePhone(phone)) throw new Error('شماره تلفن باید با فرمت ۰۹xxxxxxxxx باشد.');
      if (!validatePassword(passwordInput)) throw new Error('رمز عبور باید حداقل ۸ کاراکتر باشد.');
      if (!university.trim()) throw new Error('دانشگاه نمی‌تواند خالی باشد.');
      if (!['مرد', 'زن'].includes(gender)) throw new Error('جنسیت باید "مرد" یا "زن" باشد.');

      if (users.some((u) => u.email === email || u.phone === phone)) {
        throw new Error('ایمیل یا شماره تلفن قبلاً ثبت شده است');
      }
      if (role === 'Admin' && (!user || user.role !== 'SuperAdmin')) {
        throw new Error('فقط سوپرادمین می‌تواند نقش ادمین را تخصیص دهد');
      }

      const pictures = gender === 'مرد' ? MALE_PROFILE_PICTURES : FEMALE_PROFILE_PICTURES;
      const newUser: User = {
        id: Math.max(...users.map((u) => u.id || 0), 0) + 1,
        name: DOMPurify.sanitize(name),
        email: DOMPurify.sanitize(email),
        phone: DOMPurify.sanitize(phone),
        university: DOMPurify.sanitize(university),
        gender,
        course: course ? DOMPurify.sanitize(course) : undefined,
        profilePicture: profilePicture || pictures[Math.floor(Math.random() * pictures.length)],
        wishlist: [],
        enrolledCourses: role === 'Student' ? [] : [],
        cart: [],
        password: hashPassword(passwordInput),
        token: `${role.toLowerCase()}-token-${Date.now()}`,
        role,
      };

      setUsers((prev) => [...prev, newUser]);
      setUserState(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('isAuthenticated', 'true');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserState(null);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  };

  const setUser = async (updatedUser: User | null) => {
    setLoading(true);
    try {
      if (updatedUser) {
        if (!['مرد', 'زن'].includes(updatedUser.gender)) {
          throw new Error('جنسیت باید "مرد" یا "زن" باشد.');
        }
        setUsers((prev) => prev.map((u) => (u.email === updatedUser.email ? updatedUser : u)));
        setUserState(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('isAuthenticated', 'true');
      } else {
        setUserState(null);
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      }
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (userId: string, currentPasswordInput: string, newPassword: string) => {
    setLoading(true);
    try {
      if (!validatePassword(newPassword)) throw new Error('رمز عبور جدید باید حداقل ۸ کاراکتر باشد.');
      const targetUser = users.find(
        (u) => (u.email === userId || u.phone === userId) && u.password === hashPassword(currentPasswordInput)
      );
      if (!targetUser) throw new Error('رمز عبور فعلی اشتباه است');
      if (user?.role !== 'SuperAdmin' && user?.email !== targetUser.email && user?.phone !== targetUser.phone) {
        throw new Error('فقط سوپرادمین می‌تواند رمز عبور کاربران دیگر را تغییر دهد');
      }
      const updatedUser = { ...targetUser, password: hashPassword(newPassword) };
      setUsers((prev) => prev.map((u) => (u.email === userId || u.phone === userId ? updatedUser : u)));
      if (user && (user.email === userId || user.phone === userId)) {
        setUserState(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (userId: string, courseId: number) => {
    setLoading(true);
    try {
      if (!user) {
        throw new Error('برای ثبت‌نام در دوره باید وارد حساب شوید.');
      }
      if (user.role !== 'Student') throw new Error('فقط دانشجویان می‌توانند در دوره‌ها ثبت‌نام کنند');
      if (typeof courseId !== 'number' || courseId <= 0) throw new Error('شناسه دوره نامعتبر است.');
      const updatedUser = {
        ...user,
        enrolledCourses: [...new Set([...user.enrolledCourses, courseId])],
      };
      setUsers((prev) => prev.map((u) => (u.email === userId || u.phone === userId ? updatedUser : u)));
      if (user.email === userId || user.phone === userId) {
        setUserState(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const manageUser = async (userId: string, updates: Partial<User>) => {
    setLoading(true);
    try {
      if (!user || !['SuperAdmin', 'Admin'].includes(user.role)) {
        throw new Error('فقط سوپرادمین و ادمین می‌توانند کاربران را مدیریت کنند');
      }
      if (updates.role === 'SuperAdmin' && user.role !== 'SuperAdmin') {
        throw new Error('فقط سوپرادمین می‌تواند نقش سوپرادمین را تخصیص دهد');
      }
      if (updates.gender && !['مرد', 'زن'].includes(updates.gender)) {
        throw new Error('جنسیت باید "مرد" یا "زن" باشد.');
      }
      const targetUser = users.find((u) => u.email === userId || u.phone === userId);
      if (!targetUser) throw new Error('کاربر یافت نشد');
      const updatedUser: User = {
        ...targetUser,
        ...updates,
        name: updates.name ? DOMPurify.sanitize(updates.name) : targetUser.name,
        email: updates.email ? DOMPurify.sanitize(updates.email) : targetUser.email,
        phone: updates.phone ? DOMPurify.sanitize(updates.phone) : targetUser.phone,
        university: updates.university ? DOMPurify.sanitize(updates.university) : targetUser.university,
        course: updates.course ? DOMPurify.sanitize(updates.course) : targetUser.course,
        profilePicture: updates.profilePicture || targetUser.profilePicture,
        gender: updates.gender || targetUser.gender,
        role: updates.role || targetUser.role,
        wishlist: updates.wishlist || targetUser.wishlist,
        enrolledCourses: updates.enrolledCourses || targetUser.enrolledCourses,
        cart: updates.cart || targetUser.cart,
        password: updates.password || targetUser.password,
        token: targetUser.token,
        id: targetUser.id,
      };
      setUsers((prev) => prev.map((u) => (u.email === userId || u.phone === userId ? updatedUser : u)));
      if (user && (user.email === userId || user.phone === userId)) {
        setUserState(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const addUniversity = (university: string) => {
    if (university && !universities.includes(university)) {
      setUniversities((prev) => [...prev, university]);
    }
  };

  const deleteUser = async (email: string) => {
    setLoading(true);
    try {
      if (!user || user.role !== 'SuperAdmin') {
        throw new Error('فقط سوپرادمین می‌تواند کاربران را حذف کند');
      }
      const targetUser = users.find((u) => u.email === email);
      if (!targetUser) throw new Error('کاربر یافت نشد');
      if (targetUser.role === 'SuperAdmin') {
        throw new Error('نمی‌توان کاربر سوپرادمین را حذف کرد');
      }
      setUsers((prev) => prev.filter((u) => u.email !== email));
      if (user.email === email) {
        setUserState(null);
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        users,
        categorizedUsers,
        universities,
        loading,
        setIsAuthenticated,
        login,
        signup,
        logout,
        setUser,
        setUsers,
        updatePassword,
        enrollInCourse,
        manageUser,
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

export default AuthProvider;