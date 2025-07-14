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
          userId: Number(item.userId) || 0, // Convert to number, fallback to 0
          likeDate: item.likeDate || new Date().toLocaleDateString('fa-IR'),
        }))
        .filter(
          (item: any): item is WishlistItem =>
            typeof item === 'object' &&
            item !== null &&
            typeof item.id === 'number' &&
            typeof item.userId === 'number' && // Updated to expect number
            ['course', 'instructor', 'blog'].includes(item.type) &&
            typeof item.likeDate === 'string' &&
            (typeof item.name === 'string' || item.name === undefined)
        );
      setWishlistItems(validWishlist);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const isInWishlist = (id: number, type: 'course' | 'instructor' | 'blog'): boolean => {
    return wishlistItems.some((item) => item.id === id && item.type === type);
  };

  const toggleWishlist = async (itemId: number, type: 'course' | 'instructor' | 'blog', name: string) => {
    if (!isAuthenticated || !user) {
      showNotification('برای افزودن به لیست علاقه‌مندی‌ها، لطفاً ابتدا وارد حساب کاربری شوید.', 'warning');
      throw new Error('User not authenticated');
    }

    setIsWishlistLoading(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (!csrfToken) {
        throw new Error('خطای امنیتی: توکن CSRF یافت نشد.');
      }

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
          setIsWishlistLoading(false);
          return;
        }

        const response = await fetch('/api/wishlist/remove', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          body: JSON.stringify({ userId: user.id, itemId, type }), // Use user.id (number)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'خطا در حذف از علاقه‌مندی‌ها');
        }

        const newWishlist = wishlistItems.filter((item) => item.id !== itemId || item.type !== type);
        setWishlistItems(newWishlist);
        const updatedUser: User = {
          ...user,
          wishlist: newWishlist,
        };
        await setUser(updatedUser);
        showNotification(`"${DOMPurify.sanitize(name)}" از علاقه‌مندی‌ها حذف شد.`, 'success');
      } else {
        const newWishlistItem: WishlistItem = {
          id: itemId,
          type,
          name,
          userId: user.id, // Use user.id (number)
          likeDate: new Date().toLocaleDateString('fa-IR'),
        };

        const response = await fetch('/api/wishlist/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          body: JSON.stringify({
            userId: user.id, // Use user.id (number)
            itemId,
            type,
            name,
            likeDate: newWishlistItem.likeDate,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'خطا در افزودن به علاقه‌مندی‌ها');
        }

        const newWishlist = [...wishlistItems, newWishlistItem];
        setWishlistItems(newWishlist);
        const updatedUser: User = {
          ...user,
          wishlist: newWishlist,
        };
        await setUser(updatedUser);
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