import React, { createContext, useContext, useState, ReactNode } from 'react';

// Interface for defining the structure of an instructor
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
  whatsappLink?: string; // Added WhatsApp link
  telegramLink?: string; // Added Telegram link
  instagramLink?: string; // Added Instagram link
}

// Interface for defining the context type
interface InstructorContextType {
  instructors: Instructor[];
  setInstructors: React.Dispatch<React.SetStateAction<Instructor[]>>;
}

// Create context
const InstructorContext = createContext<InstructorContextType | undefined>(undefined);

// Context provider for managing the list of instructors
export const InstructorProvider = ({ children }: { children: ReactNode }) => {
  const [instructors, setInstructors] = useState<Instructor[]>([
    {
      id: 1,
      name: 'احمد رضایی',
      specialty: 'آناتومی دندان',
      bio: 'فارغ‌التحصیل دکتری دندانپزشکی از دانشگاه سماشکو، متخصص آموزش آناتومی دندان',
      image: '/assets/instructors/ahmad-rezaei.jpg',
      experience: '۱۵ سال',
      coursesTaught: ['دوره جامع آناتومی دندان'],
      averageRating: '4.5',
      totalStudents: 120,
      whatsappLink: 'https://wa.me/+989123456789',
      telegramLink: 'https://t.me/ahmad_rezaei',
      instagramLink: 'https://instagram.com/ahmad_rezaei_dent',
    },
    {
      id: 2,
      name: 'مریم حسینی',
      specialty: 'پروتزهای دندانی',
      bio: 'فارغ‌التحصیل دکتری دندانپزشکی از دانشگاه پیراگوا، متخصص پروتزهای دندانی',
      image: '/assets/instructors/maryam-hosseini.jpg',
      experience: '۱۲ سال',
      coursesTaught: ['پروتزهای دندانی پیشرفته'],
      averageRating: '4.7',
      totalStudents: 95,
      whatsappLink: 'https://wa.me/+989123456790',
      telegramLink: 'https://t.me/maryam_hosseini',
      instagramLink: 'https://instagram.com/maryam_hosseini_dent',
    },
    {
      id: 3,
      name: 'علی محمدی',
      specialty: 'ترمیم دندان',
      bio: 'فارغ‌التحصیل دکتری دندانپزشکی از دانشگاه رودن، متخصص ترمیم دندان',
      image: '/assets/instructors/ali-mohammadi.jpg',
      experience: '۱۰ سال',
      coursesTaught: ['دوره عملی ترمیمی'],
      averageRating: '4.3',
      totalStudents: 80,
      whatsappLink: 'https://wa.me/+989123456791',
      telegramLink: 'https://t.me/ali_mohammadi',
      instagramLink: 'https://instagram.com/ali_mohammadi_dent',
    },
    {
      id: 4,
      name: 'سارا احمدی',
      specialty: 'دندانپزشکی عمومی',
      bio: 'فارغ‌التحصیل دکتری دندانپزشکی از دانشگاه سچینوا، با تمرکز بر آموزش دندانپزشکی پایه',
      image: '/assets/instructors/sara-ahmadi.jpg',
      experience: '۸ سال',
      coursesTaught: ['دوره مقدماتی دندانپزشکی عمومی'],
      averageRating: '4.6',
      totalStudents: 150,
      whatsappLink: 'https://wa.me/+989123456792',
      telegramLink: 'https://t.me/sara_ahmadi',
      instagramLink: 'https://instagram.com/sara_ahmadi_dent',
    },
    {
      id: 5,
      name: 'رضا کاظمی',
      specialty: 'ایمپلنتولوژی',
      bio: 'فارغ‌التحصیل دکتری دندانپزشکی از دانشگاه سماشکو، متخصص ایمپلنت دندانی',
      image: '/assets/instructors/reza-kazemi.jpg',
      experience: '۱۴ سال',
      coursesTaught: ['دوره پیشرفته ایمپلنت دندانی'],
      averageRating: '4.8',
      totalStudents: 110,
      whatsappLink: 'https://wa.me/+989123456793',
      telegramLink: 'https://t.me/reza_kazemi',
      instagramLink: 'https://instagram.com/reza_kazemi_dent',
    },
    {
      id: 6,
      name: 'نازنین موسوی',
      specialty: 'ترمیم پیشرفته',
      bio: 'فارغ‌التحصیل دکتری دندانپزشکی از دانشگاه پیراگوا، متخصص مواد نوین ترمیمی',
      image: '/assets/instructors/nazanin-mousavi.jpg',
      experience: '۱۱ سال',
      coursesTaught: ['دوره ترمیمی پیشرفته'],
      averageRating: '4.4',
      totalStudents: 90,
      whatsappLink: 'https://wa.me/+989123456794',
      telegramLink: 'https://t.me/nazanin_mousavi',
      instagramLink: 'https://instagram.com/nazanin_mousavi_dent',
    },
    {
      id: 7,
      name: 'مهدی شریفی',
      specialty: 'مدیریت کلینیک',
      bio: 'فارغ‌التحصیل دکتری دندانپزشکی از دانشگاه سچینوا، متخصص مدیریت کلینیک‌های دندانپزشکی',
      image: '/assets/instructors/mehdi-sharifi.jpg',
      experience: '۱۳ سال',
      coursesTaught: ['دوره مدیریت کلینیک دندانپزشکی'],
      averageRating: '4.9',
      totalStudents: 70,
      whatsappLink: 'https://wa.me/+989123456795',
      telegramLink: 'https://t.me/mehdi_sharifi',
      instagramLink: 'https://instagram.com/mehdi_sharifi_dent',
    },
    {
      id: 8,
      name: 'حسین کاظمی',
      specialty: 'ارتودنسی',
      bio: 'فارغ‌التحصیل دکتری دندانپزشکی از دانشگاه رودن، متخصص ارتودنسی مقدماتی',
      image: '/assets/instructors/hossein-kazemi.jpg',
      experience: '۹ سال',
      coursesTaught: ['دوره ارتودنسی مقدماتی'],
      averageRating: '4.2',
      totalStudents: 100,
      whatsappLink: 'https://wa.me/+989123456796',
      telegramLink: 'https://t.me/hossein_kazemi',
      instagramLink: 'https://instagram.com/hossein_kazemi_dent',
    },
    {
      id: 9,
      name: 'بهرام رحیمی',
      specialty: 'جراحی دهammans',
      bio: 'فارغ‌التحصیل دکتری دندانپزشکی از دانشگاه سماشکو، متخصص جراحی دهان و دندان',
      image: '/assets/instructors/bahram-rahimi.jpg',
      experience: '۱۶ سال',
      coursesTaught: ['دوره جراحی دهان و دندان'],
      averageRating: '4.6',
      totalStudents: 130,
      whatsappLink: 'https://wa.me/+989123456797',
      telegramLink: 'https://t.me/bahram_rahimi',
      instagramLink: 'https://instagram.com/bahram_rahimi_dent',
    },
    {
      id: 10,
      name: 'فاطمه رحیمی',
      specialty: 'لیزر در دندانپزشکی',
      bio: 'فارغ‌التحصیل دکتری دندانپزشکی از دانشگاه سچینوا، متخصص لیزر درمانی در دندانپزشکی',
      image: '/assets/instructors/fatemeh-rahimi.jpg',
      experience: '۱۰ سال',
      coursesTaught: ['دوره تکنیک‌های لیزر در دندانپزشکی'],
      averageRating: '4.5',
      totalStudents: 85,
      whatsappLink: 'https://wa.me/+989123456798',
      telegramLink: 'https://t.me/fatemeh_rahimi',
      instagramLink: 'https://instagram.com/fatemeh_rahimi_dent',
    },
  ]);

  return (
    <InstructorContext.Provider value={{ instructors, setInstructors }}>
      {children}
    </InstructorContext.Provider>
  );
};

// Hook for using the context
export const useInstructorContext = () => {
  const context = useContext(InstructorContext);
  if (!context) {
    throw new Error('useInstructorContext must be used within an InstructorProvider');
  }
  return context;
};