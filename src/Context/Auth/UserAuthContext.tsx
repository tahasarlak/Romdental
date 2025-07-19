import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import DOMPurify from 'dompurify';
import { useNotificationContext } from '../NotificationContext';
import { User, CategorizedUsers } from '../../types/types';

interface AuthContextType {
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
    role: 'Student' | 'Instructor' | 'Blogger' | 'Admin' | 'SuperAdmin'
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updatePassword: (email: string, currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  setUser: (user: User) => Promise<void>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  checkUserExists: (email: string, phone: string) => Promise<boolean>;
  universities: string[];
  addUniversity: (university: string) => void;
  deleteUser: (email: string) => Promise<void>;
  categorizedUsers: CategorizedUsers;
  manageUser: (userId: number, updates: Partial<User>) => Promise<void>;
  createDefaultUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const categorizeUsers = (users: User[]): CategorizedUsers => {
  return {
    students: users.filter((u) => u.role === 'Student'),
    instructors: users.filter((u) => u.role === 'Instructor'),
    bloggers: users.filter((u) => u.role === 'Blogger'),
    admins: users.filter((u) => u.role === 'Admin' || u.role === 'SuperAdmin'),
  };
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?\d{10,12}$/;
  return phoneRegex.test(phone);
};

const validatePassword = (password: string): boolean => {
  return (
    password.length >= 6 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*]/.test(password)
  );
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showNotification } = useNotificationContext();
  const [user, setUserState] = useState<User | null>(null);
  const [users, setUsersState] = useState<User[]>(() => {
    try {
      const storedUsers = localStorage.getItem('users');
      return storedUsers ? JSON.parse(storedUsers) : [];
    } catch (error) {
      showNotification('خطا در بارگذاری کاربران از localStorage!', 'error');
      return [];
    }
  });
  const [universities, setUniversities] = useState<string[]>(() => {
    try {
      const storedUniversities = localStorage.getItem('universities');
      return storedUniversities ? JSON.parse(storedUniversities) : ['دانشگاه تهران', 'Smashko', 'Sechenov'];
    } catch (error) {
      showNotification('خطا در بارگذاری دانشگاه‌ها از localStorage!', 'error');
      return ['دانشگاه تهران', 'Smashko', 'Sechenov'];
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const categorizedUsers = useMemo(() => categorizeUsers(users), [users]);

  const setUsers: React.Dispatch<React.SetStateAction<User[]>> = useCallback(
    (newUsers) => {
      const updatedUsers = typeof newUsers === 'function' ? newUsers(users) : newUsers;
      setUsersState(updatedUsers);
      try {
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      } catch (error) {
        showNotification('خطا در ذخیره‌سازی کاربران!', 'error');
      }
    },
    [showNotification, users]
  );

  const addUniversity = useCallback(
    (university: string) => {
      const sanitizedUniversity = DOMPurify.sanitize(university);
      if (sanitizedUniversity && !universities.includes(sanitizedUniversity)) {
        setUniversities((prev) => {
          const newUniversities = [...prev, sanitizedUniversity];
          try {
            localStorage.setItem('universities', JSON.stringify(newUniversities));
          } catch (error) {
            showNotification('خطا در ذخیره‌سازی دانشگاه!', 'error');
          }
          return newUniversities;
        });
      }
    },
    [universities, showNotification]
  );

  const checkUserExists = useCallback(
    async (email: string, phone: string): Promise<boolean> => {
      const sanitizedEmail = DOMPurify.sanitize(email);
      const sanitizedPhone = DOMPurify.sanitize(phone);
      return users.some((u) => u.email === sanitizedEmail || u.phone === sanitizedPhone);
    },
    [users]
  );

  const signup = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      phone: string,
      university: string,
      gender: 'مرد' | 'زن',
      course: string,
      role: 'Student' | 'Instructor' | 'Blogger' | 'Admin' | 'SuperAdmin'
    ) => {
      try {
        const sanitizedName = DOMPurify.sanitize(name);
        const sanitizedEmail = DOMPurify.sanitize(email);
        const sanitizedPassword = DOMPurify.sanitize(password);
        const sanitizedPhone = DOMPurify.sanitize(phone);
        const sanitizedUniversity = DOMPurify.sanitize(university);
        const sanitizedCourse = DOMPurify.sanitize(course);

        if (!sanitizedName.trim()) throw new Error('نام نمی‌تواند خالی باشد.');
        if (!validateEmail(sanitizedEmail)) throw new Error('ایمیل نامعتبر است.');
        if (!validatePhone(sanitizedPhone)) throw new Error('شماره تلفن باید با فرمت +98xxxxxxxxxx یا 09xxxxxxxxx باشد.');
        if (!sanitizedUniversity.trim()) throw new Error('دانشگاه نمی‌تواند خالی باشد.');
        if (!['مرد', 'زن'].includes(gender)) throw new Error('جنسیت باید "مرد" یا "زن" باشد.');
        if (!validatePassword(sanitizedPassword)) {
          throw new Error('رمز عبور باید حداقل ۶ کاراکتر، شامل حرف بزرگ، عدد و کاراکتر خاص باشد.');
        }

        const userExists = await checkUserExists(sanitizedEmail, sanitizedPhone);
        if (userExists) throw new Error('ایمیل یا شماره تلفن قبلاً ثبت شده است.');

        const newUser: User = {
          id: Math.max(...users.map((u) => u.id), 0) + 1,
          name: sanitizedName,
          email: sanitizedEmail,
          password: sanitizedPassword,
          phone: sanitizedPhone,
          university: sanitizedUniversity,
          gender,
          role,
          course: sanitizedCourse,
          profilePicture: `/assets/Profile/default-${role.toLowerCase()}.jpg`,
          wishlist: [],
          enrolledCourses: [],
          cart: [],
          token: `${role.toLowerCase()}-token-${Date.now()}`,
        };

        setUsers((prev) => [...prev, newUser]);
        setUserState(newUser);
        setIsAuthenticated(true);
        document.cookie = `authToken=${newUser.token}; path=/; secure; HttpOnly; SameSite=Strict`;
        addUniversity(sanitizedUniversity);
        showNotification(`${role} با موفقیت ثبت شد!`, 'success');
      } catch (error: any) {
        showNotification(error.message || `خطا در ثبت ${role}!`, 'error');
        throw error;
      }
    },
    [users, addUniversity, checkUserExists, showNotification]
  );

  const createDefaultUsers = useCallback(async () => {
    const defaultUsers: {
      name: string;
      email: string;
      password: string;
      phone: string;
      university: string;
      gender: 'مرد' | 'زن';
      course: string;
      role: 'Student' | 'Instructor' | 'Blogger' | 'Admin' | 'SuperAdmin';
    }[] = [
      {
        name: 'دانشجوی نمونه',
        email: 'student@example.com',
        password: 'Student@123',
        phone: '09123456789',
        university: 'دانشگاه تهران',
        gender: 'مرد',
        course: 'پادفک',
        role: 'Student',
      },
      {
        name: 'مدرس نمونه',
        email: 'instructor@example.com',
        password: 'Instructor@123',
        phone: '09123456790',
        university: 'Smashko',
        gender: 'زن',
        course: 'کورش ۱',
        role: 'Instructor',
      },
      {
        name: 'بلاگر نمونه',
        email: 'blogger@example.com',
        password: 'Blogger@123',
        phone: '09123456791',
        university: 'Sechenov',
        gender: 'مرد',
        course: '',
        role: 'Blogger',
      },
      {
        name: 'ادمین نمونه',
        email: 'admin@example.com',
        password: 'Admin@123',
        phone: '09123456792',
        university: 'دانشگاه تهران',
        gender: 'زن',
        course: '',
        role: 'Admin',
      },
      {
        name: 'سوپرادمین نمونه',
        email: 'superadmin@example.com',
        password: 'SuperAdmin@123',
        phone: '09123456793',
        university: 'دانشگاه تهران',
        gender: 'مرد',
        course: '',
        role: 'SuperAdmin',
      },
    ];

    try {
      for (const defaultUser of defaultUsers) {
        const userExists = await checkUserExists(defaultUser.email, defaultUser.phone);
        if (!userExists) {
          const newUser: User = {
            id: Math.max(...users.map((u) => u.id), 0) + 1,
            name: defaultUser.name,
            email: defaultUser.email,
            password: defaultUser.password,
            phone: defaultUser.phone,
            university: defaultUser.university,
            gender: defaultUser.gender,
            role: defaultUser.role,
            course: defaultUser.course,
            profilePicture: `/assets/Profile/default-${defaultUser.role.toLowerCase()}.jpg`,
            wishlist: [],
            enrolledCourses: [],
            cart: [],
            token: `${defaultUser.role.toLowerCase()}-token-${Date.now()}`,
          };
          setUsers((prev) => [...prev, newUser]);
          addUniversity(defaultUser.university);
        }
      }
    } catch (error: any) {
      console.error('Error creating default users:', error);
      showNotification('خطا در ایجاد کاربران پیش‌فرض!', 'error');
    }
  }, [users, addUniversity, checkUserExists, showNotification]);

  useEffect(() => {
    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('authToken='))
        ?.split('=')[1];
      console.log('Token:', token); // لاگ توکن
      if (token) {
        const parsedUser = users.find((u) => u.token === token);
        console.log('Found User:', parsedUser); // لاگ کاربر
        if (parsedUser) {
          setUserState(parsedUser);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          showNotification('کاربر یافت نشد، لطفاً دوباره وارد شوید.', 'error');
        }
      } else {
        setIsAuthenticated(false);
        showNotification('توکن یافت نشد، لطفاً دوباره وارد شوید.', 'error');
      }
      createDefaultUsers();
    } catch (error) {
      console.error('Error loading user:', error);
      showNotification('خطا در بارگذاری کاربر!', 'error');
    }
  }, [createDefaultUsers, showNotification, users]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const sanitizedEmail = DOMPurify.sanitize(email);
        const sanitizedPassword = DOMPurify.sanitize(password);

        if (!validateEmail(sanitizedEmail) && !validatePhone(sanitizedEmail)) {
          throw new Error('ایمیل یا شماره تلفن نامعتبر است.');
        }
        if (!validatePassword(sanitizedPassword)) {
          throw new Error('رمز عبور نامعتبر است.');
        }

        const foundUser = users.find(
          (u) => (u.email === sanitizedEmail || u.phone === sanitizedEmail) && u.password === sanitizedPassword
        );
        if (!foundUser) throw new Error('ایمیل یا رمز عبور اشتباه است.');

        setUserState(foundUser);
        setIsAuthenticated(true);
        document.cookie = `authToken=${foundUser.token}; path=/; secure; HttpOnly; SameSite=Strict`;
        showNotification('ورود با موفقیت انجام شد!', 'success');
      } catch (error: any) {
        showNotification(error.message || 'خطا در ورود!', 'error');
        throw error;
      }
    },
    [users, showNotification]
  );

  const forgotPassword = useCallback(
    async (email: string) => {
      try {
        const sanitizedEmail = DOMPurify.sanitize(email);
        if (!validateEmail(sanitizedEmail)) {
          throw new Error('ایمیل نامعتبر است.');
        }

        const foundUser = users.find((u) => u.email === sanitizedEmail);
        if (!foundUser) throw new Error('ایمیل یافت نشد.');

        console.log(`Reset password link for ${sanitizedEmail}: /reset-password?token=example-token`);
        showNotification('لینک بازنشانی رمز عبور به ایمیل شما ارسال شد (شبیه‌سازی).', 'success');
      } catch (error: any) {
        showNotification(error.message || 'خطا در ارسال لینک بازنشانی!', 'error');
        throw error;
      }
    },
    [users, showNotification]
  );

  const logout = useCallback(() => {
    setUserState(null);
    setIsAuthenticated(false);
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    showNotification('با موفقیت خارج شدید!', 'success');
  }, [showNotification]);

  const updatePassword = useCallback(
    async (email: string, currentPassword: string, newPassword: string) => {
      try {
        const sanitizedEmail = DOMPurify.sanitize(email);
        const sanitizedCurrentPassword = DOMPurify.sanitize(currentPassword);
        const sanitizedNewPassword = DOMPurify.sanitize(newPassword);

        if (!validatePassword(sanitizedNewPassword)) {
          throw new Error('رمز عبور جدید باید حداقل ۶ کاراکتر، شامل حرف بزرگ، عدد و کاراکتر خاص باشد.');
        }

        const foundUser = users.find(
          (u) => (u.email === sanitizedEmail || u.phone === sanitizedEmail) && u.password === sanitizedCurrentPassword
        );
        if (!foundUser) throw new Error('ایمیل یا رمز عبور اشتباه است.');

        const updatedUser = { ...foundUser, password: sanitizedNewPassword };
        setUsers((prev) => prev.map((u) => (u.email === sanitizedEmail ? updatedUser : u)));
        setUserState(updatedUser);
        document.cookie = `authToken=${updatedUser.token}; path=/; secure; HttpOnly; SameSite=Strict`;
        showNotification('رمز عبور با موفقیت تغییر کرد!', 'success');
      } catch (error: any) {
        showNotification(error.message || 'خطا در تغییر رمز عبور!', 'error');
        throw error;
      }
    },
    [users, showNotification]
  );

  const setUser = useCallback(
    async (updatedUser: User) => {
      try {
        const sanitizedUser: User = {
          ...updatedUser,
          name: DOMPurify.sanitize(updatedUser.name),
          email: DOMPurify.sanitize(updatedUser.email),
          phone: DOMPurify.sanitize(updatedUser.phone),
          university: DOMPurify.sanitize(updatedUser.university),
          password: DOMPurify.sanitize(updatedUser.password),
          course: DOMPurify.sanitize(updatedUser.course),
          role: updatedUser.role,
        };
        setUsers((prev) => prev.map((u) => (u.id === sanitizedUser.id ? sanitizedUser : u)));
        setUserState(sanitizedUser);
        document.cookie = `authToken=${sanitizedUser.token}; path=/; secure; HttpOnly; SameSite=Strict`;
        showNotification('کاربر با موفقیت به‌روزرسانی شد!', 'success');
      } catch (error: any) {
        showNotification(error.message || 'خطا در به‌روزرسانی کاربر!', 'error');
        throw error;
      }
    },
    [showNotification]
  );

  const deleteUser = useCallback(
    async (email: string) => {
      try {
        const sanitizedEmail = DOMPurify.sanitize(email);
        const foundUser = users.find((u) => u.email === sanitizedEmail);
        if (!foundUser) throw new Error('کاربر یافت نشد');

        setUsers((prev) => prev.filter((u) => u.email !== sanitizedEmail));
        if (user && user.email === sanitizedEmail) {
          setUserState(null);
          setIsAuthenticated(false);
          document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        showNotification('کاربر با موفقیت حذف شد.', 'success');
      } catch (error: any) {
        showNotification(error.message || 'خطا در حذف کاربر!', 'error');
        throw error;
      }
    },
    [user, users, showNotification]
  );

  const manageUser = useCallback(
    async (userId: number, updates: Partial<User>) => {
      try {
        const sanitizedUpdates: Partial<User> = {
          ...updates,
          name: updates.name ? DOMPurify.sanitize(updates.name) : undefined,
          email: updates.email ? DOMPurify.sanitize(updates.email) : undefined,
          phone: updates.phone ? DOMPurify.sanitize(updates.phone) : undefined,
          university: updates.university ? DOMPurify.sanitize(updates.university) : undefined,
          course: updates.course ? DOMPurify.sanitize(updates.course) : undefined,
        };

        const foundUser = users.find((u) => u.id === userId);
        if (!foundUser) throw new Error('کاربر یافت نشد.');

        const updatedUser = { ...foundUser, ...sanitizedUpdates };
        setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));

        if (user && user.id === userId) {
          setUserState(updatedUser);
          document.cookie = `authToken=${updatedUser.token}; path=/; secure; HttpOnly; SameSite=Strict`;
        }

        showNotification('کاربر با موفقیت به‌روزرسانی شد!', 'success');
      } catch (error: any) {
        showNotification(error.message || 'خطا در به‌روزرسانی کاربر!', 'error');
        throw error;
      }
    },
    [user, users, showNotification]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isAuthenticated,
        setIsAuthenticated,
        signup,
        login,
        logout,
        updatePassword,
        forgotPassword,
        setUser,
        setUsers,
        checkUserExists,
        universities,
        addUniversity,
        deleteUser,
        categorizedUsers,
        manageUser,
        createDefaultUsers,
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