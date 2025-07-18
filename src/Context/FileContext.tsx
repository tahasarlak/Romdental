import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './Auth/UserAuthContext';
import { useCourseContext } from './CourseContext';
import { useEnrollmentContext } from './EnrollmentContext';
import { useNotificationContext } from './NotificationContext';
import { v4 as uuidv4 } from 'uuid';
import DOMPurify from 'dompurify';

interface CourseFile {
  id: string;
  courseId: number;
  title: string;
  fileUrl: string;
  fileType: 'pdf' | 'video' | 'image' | 'other';
  uploadedBy: number;
  uploadedAt: string;
}

interface FileContextType {
  files: CourseFile[];
  uploadFile: (courseId: number, title: string, fileUrl: string, fileType: 'pdf' | 'video' | 'image' | 'other') => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  getCourseFiles: (courseId: number) => CourseFile[];
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthContext();
  const { courses } = useCourseContext();
  const { enrollments } = useEnrollmentContext();
  const { showNotification } = useNotificationContext();
  const [files, setFiles] = useState<CourseFile[]>(() => {
    const storedFiles = localStorage.getItem('courseFiles');
    return storedFiles ? JSON.parse(storedFiles) : [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('courseFiles', JSON.stringify(files));
    } catch (error) {
      showNotification('خطا در ذخیره‌سازی فایل‌ها!', 'error');
    }
  }, [files, showNotification]);

  const uploadFile = async (courseId: number, title: string, fileUrl: string, fileType: 'pdf' | 'video' | 'image' | 'other') => {
    try {
      if (!isAuthenticated || !user || !['SuperAdmin', 'Admin', 'Instructor'].includes(user.role)) {
        throw new Error('فقط ادمین‌ها و اساتید می‌توانند فایل آپلود کنند.');
      }
      if (!title.trim() || !fileUrl.trim()) {
        throw new Error('عنوان و آدرس فایل نمی‌توانند خالی باشند.');
      }
      const course = courses.find((c) => c.id === courseId);
      if (!course) {
        throw new Error('دوره یافت نشد.');
      }
      if (!/^\/assets\/.*\.(pdf|mp4|jpg|jpeg|png|mov)$/.test(fileUrl) && !/^https?:\/\/.*/.test(fileUrl)) {
        throw new Error('آدرس فایل معتبر نیست یا فرمت پشتیبانی نمی‌شود.');
      }

      const newFile: CourseFile = {
        id: uuidv4(),
        courseId,
        title: DOMPurify.sanitize(title),
        fileUrl: DOMPurify.sanitize(fileUrl),
        fileType,
        uploadedBy: user.id,
        uploadedAt: new Date().toLocaleString('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setFiles((prev) => [...prev, newFile]);
      showNotification('فایل با موفقیت آپلود شد.', 'success');
    } catch (error: any) {
      showNotification(error.message || 'خطا در آپلود فایل.', 'error');
      throw error;
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      if (!isAuthenticated || !user || !['SuperAdmin', 'Admin', 'Instructor'].includes(user.role)) {
        throw new Error('فقط ادمین‌ها و اساتید می‌توانند فایل را حذف کنند.');
      }
      const file = files.find((f) => f.id === fileId);
      if (!file) {
        throw new Error('فایل یافت نشد.');
      }
      if (file.uploadedBy !== user.id && !['SuperAdmin', 'Admin'].includes(user.role)) {
        throw new Error('شما فقط می‌توانید فایل‌های خودتان را حذف کنید.');
      }

      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      showNotification('فایل با موفقیت حذف شد.', 'success');
    } catch (error: any) {
      showNotification(error.message || 'خطا در حذف فایل.', 'error');
      throw error;
    }
  };

  const getCourseFiles = (courseId: number): CourseFile[] => {
    if (!isAuthenticated || !user) {
      return [];
    }
    const enrollment = enrollments.find((e) => e.courseId === courseId && e.studentId === user.id);
    if (!enrollment && !['SuperAdmin', 'Admin', 'Instructor'].includes(user.role)) {
      return [];
    }
    return files.filter((f) => f.courseId === courseId);
  };

  return (
    <FileContext.Provider
      value={{
        files,
        uploadFile,
        deleteFile,
        getCourseFiles,
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

export const useFileContext = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
};