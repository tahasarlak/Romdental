import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { useNotificationContext } from './NotificationContext';
import { useCourseContext } from './CourseContext';
import { useInstructorContext } from './InstructorContext';
import { useBlogContext } from './BlogContext';
import DOMPurify from 'dompurify';
import { WishlistItem, User } from '../types/types';

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isWishlistLoading: boolean;
  isInWishlist: (id: number, type: 'course' | 'instructor' | 'blog') => boolean;
  toggleWishlist: (itemId: number, type: 'course' | 'instructor' | 'blog', name: string) => Promise<void>;
  setWishlistItems: React.Dispatch<React.SetStateAction<WishlistItem[]>>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, setUser } = useAuthContext();
  const { showNotification } = useNotificationContext();
  const { courses } = useCourseContext();
  const { instructors } = useInstructorContext();
  const { blogPosts } = useBlogContext();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isWishlistLoading, setIsWishlistLoading] = useState<boolean>(false);

  // بارگذاری اولیه لیست علاقه‌مندی‌ها از localStorage یا user.wishlist
  useEffect(() => {
    if (isAuthenticated && user) {
      const userWishlist = Array.isArray(user.wishlist) ? user.wishlist : [];
      setWishlistItems(userWishlist);
    } else {
      const storedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const validWishlist: WishlistItem[] = storedWishlist
        .map((item: any) => ({
          ...item,
          id: Number(item.id),
          userId: Number(item.userId) || 0,
          likeDate: item.likeDate || new Date().toLocaleDateString('fa-IR'),
        }))
        .filter(
          (item: any): item is WishlistItem =>
            typeof item === 'object' &&
            item !== null &&
            typeof item.id === 'number' &&
            typeof item.userId === 'number' &&
            ['course', 'instructor', 'blog'].includes(item.type) &&
            typeof item.likeDate === 'string' &&
            (typeof item.name === 'string' || item.name === undefined)
        );
      setWishlistItems(validWishlist);
    }
  }, [isAuthenticated, user]);

  // ذخیره تغییرات wishlist در localStorage
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    if (isAuthenticated && user) {
      const updatedUser: User = {
        ...user,
        wishlist: wishlistItems,
      };
      setUser(updatedUser);
    }
  }, [wishlistItems, isAuthenticated, user, setUser]);

  // بررسی وجود آیتم در لیست علاقه‌مندی‌ها
  const isInWishlist = (id: number, type: 'course' | 'instructor' | 'blog'): boolean => {
    return wishlistItems.some((item) => item.id === id && item.type === type);
  };

  // افزودن یا حذف آیتم از لیست علاقه‌مندی‌ها
  const toggleWishlist = async (itemId: number, type: 'course' | 'instructor' | 'blog', name: string) => {
    setIsWishlistLoading(true);
    try {
      // اعتبارسنجی آیتم
      if (type === 'course' && !courses.some((course) => course.id === itemId)) {
        throw new Error('دوره موردنظر یافت نشد.');
      }
      if (type === 'instructor' && !instructors.some((instructor) => instructor.id === itemId)) {
        throw new Error('استاد موردنظر یافت نشد.');
      }
      if (type === 'blog' && !blogPosts.some((post) => post.id === itemId)) {
        throw new Error('پست وبلاگ موردنظر یافت نشد.');
      }

      const isCurrentlyInWishlist = isInWishlist(itemId, type);
      if (isCurrentlyInWishlist) {
        const confirmRemove = window.confirm(
          `آیا مطمئن هستید که می‌خواهید "${DOMPurify.sanitize(name)}" را از علاقه‌مندی‌ها حذف کنید؟`
        );
        if (!confirmRemove) {
          return;
        }

        // حذف آیتم از wishlist
        const newWishlist = wishlistItems.filter((item) => item.id !== itemId || item.type !== type);
        setWishlistItems(newWishlist);
        showNotification(`"${DOMPurify.sanitize(name)}" از علاقه‌مندی‌ها حذف شد.`, 'success');
      } else {
        // افزودن آیتم به wishlist
        const newWishlistItem: WishlistItem = {
          id: itemId,
          type,
          name,
          userId: isAuthenticated && user ? user.id : 0,
          likeDate: new Date().toLocaleDateString('fa-IR'),
        };

        const newWishlist = [...wishlistItems, newWishlistItem];
        setWishlistItems(newWishlist);
        showNotification(`"${DOMPurify.sanitize(name)}" به علاقه‌مندی‌ها اضافه شد.`, 'success');
      }
    } catch (error: any) {
      showNotification(error.message || 'خطایی در به‌روزرسانی علاقه‌مندی‌ها رخ داد.', 'error');
      throw error;
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, isWishlistLoading, isInWishlist, toggleWishlist, setWishlistItems }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlistContext = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlistContext must be used within a WishlistProvider');
  }
  return context;
};