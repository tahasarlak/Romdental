export interface WishlistItem {
  likeDate: string;
  userId: number;
  id: number;
  type: 'course' | 'instructor' | 'blog';
  name: string;userName?: string;
}

export interface CartItem {
  id: string; // شناسه منحصربه‌فرد برای هر آیتم سبد خرید
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
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  university: string;
  gender: 'مرد' | 'زن';
  profilePicture?: string;
  wishlist: WishlistItem[];
  enrolledCourses: number[];
  cart: any[];
  password: string;
  token: string;
  course?: string;
  role: 'Student' | 'Instructor' | 'Blogger' | 'Admin' | 'SuperAdmin';
}

export interface CategorizedUsers {
  superAdmins: User[];
  admins: User[];
  instructors: User[];
  students: User[];
  bloggers: User[];
  multiRole: User[];
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
  slug: string;
  id: number;
  title: string;
  instructor: string;
  description: string;
  duration: string;
  courseNumber: string;
  category: string; 
  image: string;
  price: string; 
  currency: string; 
  discountPrice?: string; 
  discountCurrency?: string;
  discountPercentage?: number;
  startDate: string;
  isOpen: boolean;
  isFeatured: boolean;
  enrollmentCount: number;
  syllabus: SyllabusItem[];
  faqs: FaqItem[];
  tags?: string[];
  prerequisites?: string[];
  courseType: 'Online' | 'Offline' | 'In-Person' | 'Hybrid';
  university?: string; 
  level?: 'Beginner' | 'Intermediate' | 'Advanced'; 
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

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  slug?: string;
  image?: string;
  author?: string;
  date?: string;
  tags?: string[];
  category?: string;
  excerpt?: string;
  images?: string[];
  videos?: string[];
}
export const VALID_COURSE_TYPES = ['Online', 'Offline', 'In-Person', 'Hybrid'] as const;
export type CourseType = typeof VALID_COURSE_TYPES[number];