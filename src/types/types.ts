export interface BankAccount {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
}

export interface WishlistItem {
  id: number;
  type: 'course' | 'instructor' | 'blog';
  name: string;
  userName?: string;
  likeDate: string;
  userId: number;
}

export interface CartItem {
  id: string;
  courseId: number;
  quantity: number;
}

export interface Instructor {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  image: string;
  experience: string;
  coursesTaught: string[];
  averageRating: string;
  totalStudents: number;
  reviewCount: number;
  whatsappLink?: string;
  telegramLink?: string;
  instagramLink?: string;
  bankAccounts: BankAccount[];
  email: string; 
  phone: string; 
  university: string; 
  gender: 'مرد' | 'زن'; 
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  university: string;
  gender: 'مرد' | 'زن';
  role: 'Student' | 'Instructor' | 'Blogger' | 'Admin' | 'SuperAdmin';
  profilePicture?: string;
  wishlist: WishlistItem[];
  enrolledCourses: number[];
  cart: CartItem[];
  token?: string;
  course?: string;
  
}

export interface BlogPost {
  id: number;
  title: string;
  author: string;
  category: string;
  tags: string[];
  date: string;
  content: string;
  excerpt?: string;
  images?: string[];
  videos?: string[];
}

export interface CategorizedUsers {
  students: User[];
  instructors: User[];
  bloggers: User[];
  admins: User[];
}

export interface ContentItem {
  type: 'video' | 'image' | 'text' | 'quiz';
  url?: string;
  text?: string;
  title?: string;
}

export interface SyllabusItem {
  id: number;
  title: string;
  isLocked: boolean;
  previewContent?: string;
  contents: ContentItem[];
  completed?: boolean;
  duration: string;
  isNew?: boolean;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export interface Course {
  id: number;
  title: string;
  instructor: string;
  description: string;
  duration: string;
  courseNumber: string;
  category: string;
  image: string;
  price: string;
  discountPrice?: string;
  discountPercentage?: number;
  startDateJalali: string;
  startDateGregorian: string;
  isOpen: boolean;
  isFeatured: boolean;
  enrollmentCount: number;
  syllabus: SyllabusItem[];
  faqs: { id: number; question: string; answer: string }[];
  tags: string[];
  prerequisites: string[];
  courseType: 'Online' | 'Offline' | 'In-Person' | 'Hybrid';
  university: string;
  slug: string;
  currency: 'RUB' | 'CNY' | 'IRR';
  countries: string[];
  level?: string;
}

export interface ReplyItem {
  id: number;
  reviewId: number;
  user: string;
  comment: string;
  date: string;
  role: 'admin' | 'instructor' | 'student' | 'owner';
  userId?: number;
}

export interface ReviewItem {
  id: number;
  courseId: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
  isEnrolled: boolean;
  role: 'admin' | 'instructor' | 'student' | 'owner' | 'user';
  userId?: number;
  replies: ReplyItem[];
}

export interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  instructorId: number;
  status: 'active' | 'inactive';
  group?: string;
  enrollmentDate: string;
}// src/types/types.ts
export interface Blogger {
  id: number;
  name: string;
  bio: string;
  image: string;
  email: string; // اضافه کردن
  phone: string; // اضافه کردن
  university: string; // اضافه کردن
  gender: 'مرد' | 'زن'; // اضافه کردن
  password: string; // اضافه کردن
}

export const VALID_COURSE_TYPES = ['Online', 'Offline', 'In-Person', 'Hybrid'] as const;
export type CourseType = typeof VALID_COURSE_TYPES[number];