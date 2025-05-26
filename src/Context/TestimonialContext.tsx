// src/context/TestimonialContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Testimonial {
  id: number;
  name: string;
  text: string;
  role: string;
  likes: number;
  rating: number; // امتیاز ستاره‌ای (0 تا 5)
}

interface TestimonialContextType {
  testimonials: Testimonial[];
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
}

const TestimonialContext = createContext<TestimonialContextType | undefined>(undefined);

export const TestimonialProvider = ({ children }: { children: ReactNode }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: 1,
      name: 'دکتر علی محمدی',
      text: 'دوره پروتز بسیار کاربردی بود و به من کمک کرد مهارت‌هایم را ارتقا دهم.',
      role: 'دندانپزشک',
      likes: 25,
      rating: 5, // امتیاز نمونه
    },
    {
      id: 2,
      name: 'سارا حسینی',
      text: 'آناتومی رو به بهترین شکل یاد گرفتم، تدریس واقعاً عالی بود.',
      role: 'دانشجو',
      likes: 18,
      rating:5,
    },
    {
      id: 3,
      name: 'محمد رضایی',
      text: 'پشتیبانی دوره‌ها بی‌نظیر بود و مطالب به‌روز بودند.',
      role: 'دندانپزشک عمومی',
      likes: 32,
      rating: 5,
    },
  ]);

  return (
    <TestimonialContext.Provider value={{ testimonials, setTestimonials }}>
      {children}
    </TestimonialContext.Provider>
  );
};

export const useTestimonialContext = () => {
  const context = useContext(TestimonialContext);
  if (!context) {
    throw new Error('useTestimonialContext must be used within a TestimonialProvider');
  }
  return context;
};