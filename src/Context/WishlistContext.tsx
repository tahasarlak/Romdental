import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { useCourseContext } from './CourseContext';
import { useInstructorContext } from './InstructorContext';
import { useBlogContext } from './BlogContext';

interface WishlistItem {
  id: number;
  type: 'course' | 'instructor' | 'blog';
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (id: number, type: 'course' | 'instructor' | 'blog') => void;
  removeFromWishlist: (id: number, type: 'course' | 'instructor' | 'blog') => void;
  isInWishlist: (id: number, type: 'course' | 'instructor' | 'blog') => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user, addToWishlist, removeFromWishlist, isAuthenticated } = useAuthContext();
  const { courses } = useCourseContext();
  const { instructors } = useInstructorContext();
  const { blogPosts } = useBlogContext();

  const courseIds = new Set(courses.map((course) => course.id));
  const instructorIds = new Set(instructors.map((instructor) => instructor.id));
  const blogPostIds = new Set(blogPosts.map((post) => post.id));

  const wishlist: WishlistItem[] = user?.wishlist
    ?.filter((item) => 
      (item.type === 'course' && courseIds.has(item.id)) || 
      (item.type === 'instructor' && instructorIds.has(item.id)) ||
      (item.type === 'blog' && blogPostIds.has(item.id))
    )
    .map((item) => ({
      id: item.id,
      type: item.type,
    })) || [];

  const handleAddToWishlist = (id: number, type: 'course' | 'instructor' | 'blog') => {
    if (!isAuthenticated || !user) {
      console.warn('برای افزودن به لیست علاقه‌مندی‌ها باید وارد حساب کاربری شوید.');
      return;
    }

    if (type === 'course' && !courseIds.has(id)) {
      console.warn(`دوره با شناسه ${id} وجود ندارد.`);
      return;
    }
    if (type === 'instructor' && !instructorIds.has(id)) {
      console.warn(`استاد با شناسه ${id} وجود ندارد.`);
      return;
    }
    if (type === 'blog' && !blogPostIds.has(id)) {
      console.warn(`پست وبلاگ با شناسه ${id} وجود ندارد.`);
      return;
    }

    addToWishlist(user.email, id, type);
  };

  const handleRemoveFromWishlist = (id: number, type: 'course' | 'instructor' | 'blog') => {
    if (!isAuthenticated || !user) {
      console.warn('برای حذف از لیست علاقه‌مندی‌ها باید وارد حساب کاربری شوید.');
      return;
    }

    removeFromWishlist(user.email, id, type);
  };

  const isInWishlist = (id: number, type: 'course' | 'instructor' | 'blog') => {
    if (!isAuthenticated || !user) {
      return false;
    }
    return user.wishlist.some((item) => item.id === id && item.type === type);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist: handleAddToWishlist,
        removeFromWishlist: handleRemoveFromWishlist,
        isInWishlist,
      }}
    >
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