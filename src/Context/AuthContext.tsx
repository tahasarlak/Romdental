import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useCourseContext } from './CourseContext';
import { useInstructorContext } from './InstructorContext';
import { useBlogContext } from './BlogContext';

interface WishlistItem {
  id: number;
  type: 'course' | 'instructor' | 'blog';
}

interface User {
  token: string;
  name: string;
  email: string;
  phone: string;
  university: string;
  gender: 'مرد' | 'زن' | '';
  course?: string;
  profilePicture?: string;
  wishlist: WishlistItem[];
  enrolledCourses: number[];
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  users: User[];
  login: (identifier: string, password: string, course?: string, gender?: 'مرد' | 'زن') => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    phone: string,
    university: string,
    gender: 'مرد' | 'زن',
    course?: string
  ) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => Promise<void>;
  setUsers: (users: User[] | ((prev: User[]) => User[])) => void;
  addToWishlist: (userId: string, itemId: number, type: 'course' | 'instructor' | 'blog') => void;
  removeFromWishlist: (userId: string, itemId: number, type: 'course' | 'instructor' | 'blog') => void;
  updatePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<void>;
  enrollInCourse: (userId: string, courseId: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { courses = [] } = useCourseContext() || {};
  const { instructors = [] } = useInstructorContext() || {};
  const { blogPosts = [] } = useBlogContext() || {};
  const courseIds = new Set(courses.map((course) => course.id));
  const instructorIds = new Set(instructors.map((instructor) => instructor.id));
  const blogPostIds = new Set(blogPosts.map((post) => post.id));
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
      wishlist: [{ id: 1, type: 'course' }],
      enrolledCourses: [1],
      password: 'password123',
      token: '',
    },
    {
      name: 'دکتر سارا احمدی',
      email: 'sara.ahmadi@example.com',
      phone: '09123456790',
      university: 'دانشگاه تهران',
      gender: 'زن',
      profilePicture: '/assets/default-profile.jpg',
      wishlist: [{ id: 1, type: 'course' }],
      enrolledCourses: [1],
      password: 'password123',
      token: '',
    },
    {
      name: 'محمد حسینی',
      email: 'mohammad.hosseini@example.com',
      phone: '09123456791',
      university: 'دانشگاه شیراز',
      gender: 'مرد',
      profilePicture: '/assets/default-profile.jpg',
      wishlist: [{ id: 1, type: 'course' }],
      enrolledCourses: [1],
      password: 'password123',
      token: '',
    },
    {
      name: 'زهرا کریمی',
      email: 'zahra.karimi@example.com',
      phone: '09123456792',
      university: 'دانشگاه اصفهان',
      gender: 'زن',
      profilePicture: '/assets/default-profile.jpg',
      wishlist: [{ id: 1, type: 'course' }],
      enrolledCourses: [1],
      password: 'password123',
      token: '',
    },
    {
      name: 'دکتر علی رضوی',
      email: 'ali.razavi@example.com',
      phone: '09123456793',
      university: 'دانشگاه مشهد',
      gender: 'مرد',
      profilePicture: '/assets/default-profile.jpg',
      wishlist: [{ id: 2, type: 'course' }],
      enrolledCourses: [2],
      password: 'password123',
      token: '',
    },
    {
      name: 'نازنین موسوی',
      email: 'nazanin.mousavi@example.com',
      phone: '09123456794',
      university: 'دانشگاه تبریز',
      gender: 'زن',
      profilePicture: '/assets/default-profile.jpg',
      wishlist: [{ id: 2, type: 'course' }],
      enrolledCourses: [2],
      password: 'password123',
      token: '',
    },
    {
      name: 'مهدی شریفی',
      email: 'mahdi.sharifi@example.com',
      phone: '09123456795',
      university: 'دانشگاه تهران',
      gender: 'مرد',
      profilePicture: '/assets/default-profile.jpg',
      wishlist: [{ id: 3, type: 'course' }],
      enrolledCourses: [3],
      password: 'password123',
      token: '',
    },
    {
      name: 'فاطمه رحیمی',
      email: 'fatemeh.rahimi@example.com',
      phone: '09123456796',
      university: 'دانشگاه شیراز',
      gender: 'زن',
      profilePicture: '/assets/default-profile.jpg',
      wishlist: [{ id: 3, type: 'course' }],
      enrolledCourses: [3],
      password: 'password123',
      token: '',
    },
    {
      name: 'حسین کاظمی',
      email: 'hossein.kazemi@example.com',
      phone: '09123456797',
      university: 'دانشگاه اصفهان',
      gender: 'مرد',
      profilePicture: '/assets/default-profile.jpg',
      wishlist: [{ id: 3, type: 'course' }],
      enrolledCourses: [3],
      password: 'password123',
      token: '',
    },
    {
      name: 'علی اکبری',
      email: 'ali.akhbari@example.com',
      phone: '09123456798',
      university: 'دانشگاه مشهد',
      gender: 'مرد',
      profilePicture: '/assets/default-profile.jpg',
      wishlist: [{ id: 4, type: 'course' }],
      enrolledCourses: [4],
      password: 'password123',
      token: '',
    },
    {
      name: 'مریم کاظمی',
      email: 'maryam.kazemi@example.com',
      phone: '09123456799',
      university: 'دانشگاه تبریز',
      gender: 'زن',
      profilePicture: '/assets/default-profile.jpg',
      wishlist: [{ id: 4, type: 'course' }],
      enrolledCourses: [4],
      password: 'password123',
      token: '',
    },
    {
      name: 'دکتر سعید مرادی',
      email: 'saeed.moradi@example.com',
      phone: '09123456800',
      university: 'دانشگاه تهران',
      gender: 'مرد',
      profilePicture: '/assets/default-profile.jpg',
      wishlist: [{ id: 5, type: 'course' }],
      enrolledCourses: [5],
      password: 'password123',
      token: '',
    },
    {
      name: 'دکتر شیما رضایی',
      email: 'shima.rezaei@example.com',
      phone: '09123456801',
      university: 'دانشگاه شیراز',
      gender: 'زن',
      profilePicture: '/assets/default-profile.jpg',
      wishlist: [{ id: 6, type: 'course' }],
      enrolledCourses: [6],
      password: 'password123',
      token: '',
    },
    {
      name: 'حسن محمدی',
      email: 'hassan.mohammadi@example.com',
      phone: '09123456802',
      university: 'دانشگاه اصفهان',
      gender: 'مرد',
      profilePicture: '/assets/default-profile.jpg',
      wishlist: [{ id: 6, type: 'course' }],
      enrolledCourses: [6],
      password: 'password123',
      token: '',
    },
    {
      name: 'دکتر لیلا احمدی',
      email: 'leila.ahmadi@example.com',
      phone: '09123456803',
      university: 'دانشگاه مشهد',
      gender: 'زن',
      profilePicture: '/assets/default-profile.jpg',
      wishlist: [{ id: 7, type: 'course' }],
      enrolledCourses: [7],
      password: 'password123',
      token: '',
    },
    {
      name: 'سارا موسوی',
      email: 'sara.mousavi@example.com',
      phone: '09123456804',
      university: 'دانشگاه تبریز',
      gender: 'زن',
      profilePicture: '/assets/default-profile.jpg',
      wishlist: [{ id: 8, type: 'course' }],
      enrolledCourses: [8],
      password: 'password123',
      token: '',
    },
    {
      name: 'امیر حسینی',
      email: 'amir.hosseini@example.com',
      phone: '09123456805',
      university: 'دانشگاه تهران',
      gender: 'مرد',
      profilePicture: '/assets/default-profile.jpg',
      wishlist: [{ id: 8, type: 'course' }],
      enrolledCourses: [8],
      password: 'password123',
      token: '',
    },
    {
      name: 'دکتر محمد احمدی',
      email: 'mohammad.ahmadi@example.com',
      phone: '09123456806',
      university: 'دانشگاه شیراز',
      gender: 'مرد',
      profilePicture: '/assets/default-profile.jpg',
      wishlist: [{ id: 9, type: 'course' }],
      enrolledCourses: [9],
      password: 'password123',
      token: '',
    },
    {
      name: 'دکتر لیلا مرادی',
      email: 'leila.moradi@example.com',
      phone: '09123456807',
      university: 'دانشگاه اصفهان',
      gender: 'زن',
      profilePicture: '/assets/default-profile.jpg',
      wishlist: [{ id: 10, type: 'course' }],
      enrolledCourses: [10],
      password: 'password123',
      token: '',
    },
    {
      name: 'علیرضا حسینی',
      email: 'alireza.hosseini@example.com',
      phone: '09123456808',
      university: 'دانشگاه مشهد',
      gender: 'مرد',
      profilePicture: '/assets/default-profile.jpg',
      wishlist: [{ id: 10, type: 'course' }],
      enrolledCourses: [10],
      password: 'password123',
      token: '',
    },
  ].map(user => ({
    ...user,
    enrolledCourses: user.enrolledCourses.filter(id => courseIds.has(id)),
    wishlist: user.wishlist.filter(item => 
      (item.type === 'course' && courseIds.has(item.id)) || 
      (item.type === 'instructor' && instructorIds.has(item.id)) ||
      (item.type === 'blog' && blogPostIds.has(item.id))
    ),
  })) as User[]);

  const login = async (identifier: string, password: string, course?: string, gender?: 'مرد' | 'زن') => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (identifier && password) {
          const existingUser = users.find(
            (u) => (u.email === identifier || u.phone === identifier) && u.password === password
          );
          if (existingUser) {
            setUserState({
              ...existingUser,
              course: course || existingUser.course,
              gender: gender || existingUser.gender,
              wishlist: existingUser.wishlist || [],
              enrolledCourses: existingUser.enrolledCourses || [],
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
            enrolledCourses: [],
            password,
            token: '',
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
          const validatedUser = {
            ...updatedUser,
            enrolledCourses: updatedUser.enrolledCourses.filter(id => courseIds.has(id)),
            wishlist: updatedUser.wishlist.filter(item => 
              (item.type === 'course' && courseIds.has(item.id)) || 
              (item.type === 'instructor' && instructorIds.has(item.id)) ||
              (item.type === 'blog' && blogPostIds.has(item.id))
            ),
          };
          setUsers((prev) =>
            prev.map((u) => (u.email === validatedUser.email ? validatedUser : u))
          );
          setUserState(validatedUser);
        } else {
          setUserState(null);
        }
        resolve();
      }, 500);
    });
  };

  const addToWishlist = (userId: string, itemId: number, type: 'course' | 'instructor' | 'blog') => {
    if (type === 'course' && !courseIds.has(itemId)) {
      console.warn(`دوره با شناسه ${itemId} نامعتبر است و به لیست علاقه‌مندی‌ها اضافه نمی‌شود.`);
      return;
    }
    if (type === 'instructor' && !instructorIds.has(itemId)) {
      console.warn(`استاد با شناسه ${itemId} نامعتبر است و به لیست علاقه‌مندی‌ها اضافه نمی‌شود.`);
      return;
    }
    if (type === 'blog' && !blogPostIds.has(itemId)) {
      console.warn(`پست وبلاگ با شناسه ${itemId} نامعتبر است و به لیست علاقه‌مندی‌ها اضافه نمی‌شود.`);
      return;
    }

     setUsers((prev) =>
      prev.map((u) =>
        u.email === userId || u.phone === userId
          ? {
              ...u,
              wishlist: [...u.wishlist.filter((item) => item.id !== itemId || item.type !== type), { id: itemId, type }],
            }
          : u
      )
    );

    if (user && (user.email === userId || user.phone === userId)) {
      setUserState({
        ...user,
        wishlist: [...user.wishlist.filter((item) => item.id !== itemId || item.type !== type), { id: itemId, type }],
      });
    }
  };

  const removeFromWishlist = (userId: string, itemId: number, type: 'course' | 'instructor' | 'blog') => {
    setUsers((prev) =>
      prev.map((u) =>
        u.email === userId || u.phone === userId
          ? { ...u, wishlist: u.wishlist.filter((item) => item.id !== itemId || item.type !== type) }
          : u
      )
    );

    if (user && (user.email === userId || user.phone === userId)) {
      setUserState({
        ...user,
        wishlist: user.wishlist.filter((item) => item.id !== itemId || item.type !== type),
      });
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

  const enrollInCourse = (userId: string, courseId: number) => {
    if (!courseIds.has(courseId)) {
      throw new Error(`دوره با شناسه ${courseId} وجود ندارد.`);
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.email === userId || u.phone === userId
          ? { ...u, enrolledCourses: [...new Set([...u.enrolledCourses, courseId])] }
          : u
      )
    );
    if (user && (user.email === userId || user.phone === userId)) {
      setUserState({
        ...user,
        enrolledCourses: [...new Set([...user.enrolledCourses, courseId])],
      });
    }
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
        addToWishlist,
        removeFromWishlist,
        updatePassword,
        enrollInCourse,
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