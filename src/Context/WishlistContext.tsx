// src/Context/WishlistContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';

interface WishlistItem {
  id: number;
  type: 'course' | 'instructor';
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (id: number, type: 'course' | 'instructor') => void;
  removeFromWishlist: (id: number, type: 'course' | 'instructor') => void;
  isInWishlist: (id: number, type: 'course' | 'instructor') => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user, setUser, isAuthenticated } = useAuthContext();

  // Initialize wishlist from user data or empty array if not authenticated
  const wishlist: WishlistItem[] = user?.wishlist?.map((id) => ({
    id,
    type: 'course', // Default to 'course' for backward compatibility; adjust as needed
  })) || [];

  const addToWishlist = (id: number, type: 'course' | 'instructor') => {
    if (!isAuthenticated || !user) {
      return; // Prevent adding to wishlist if not authenticated
    }

    const updatedWishlist = [...user.wishlist, id];
    const updatedUser = {
      ...user,
      wishlist: Array.from(new Set(updatedWishlist)), // Ensure no duplicates
    };

    setUser(updatedUser);
  };

  const removeFromWishlist = (id: number, type: 'course' | 'instructor') => {
    if (!isAuthenticated || !user) {
      return; // Prevent removing from wishlist if not authenticated
    }

    const updatedWishlist = user.wishlist.filter((itemId) => itemId !== id);
    const updatedUser = {
      ...user,
      wishlist: updatedWishlist,
    };

    setUser(updatedUser);
  };

  const isInWishlist = (id: number, type: 'course' | 'instructor') => {
    if (!isAuthenticated || !user) {
      return false;
    }
    return user.wishlist.includes(id);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
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