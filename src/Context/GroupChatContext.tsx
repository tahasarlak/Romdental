import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './Auth/UserAuthContext';
import { useEnrollmentContext } from './EnrollmentContext';
import { useNotificationContext } from './NotificationContext';
import { v4 as uuidv4 } from 'uuid';
import DOMPurify from 'dompurify';

interface ChatMessage {
  id: string;
  groupId: number;
  courseId: number;
  userId: number;
  userName: string;
  message: string;
  timestamp: string;
  type: 'chat' | 'forum';
}

interface ForumPost {
  id: string;
  groupId: number;
  courseId: number;
  userId: number;
  userName: string;
  title: string;
  content: string;
  timestamp: string;
  replies: ChatMessage[];
}

interface GroupChatContextType {
  chatMessages: ChatMessage[];
  forumPosts: ForumPost[];
  activeGroup: number | null;
  setActiveGroup: (courseId: number, groupId: number) => void;
  sendChatMessage: (courseId: number, groupId: number, message: string) => Promise<void>;
  createForumPost: (courseId: number, groupId: number, title: string, content: string) => Promise<void>;
  replyToForumPost: (postId: string, message: string) => Promise<void>;
  getGroupMessages: (courseId: number, groupId: number) => ChatMessage[];
  getGroupForumPosts: (courseId: number, groupId: number) => ForumPost[];
}

const GroupChatContext = createContext<GroupChatContextType | undefined>(undefined);

export const GroupChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthContext();
  const { enrollments } = useEnrollmentContext();
  const { showNotification } = useNotificationContext();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const storedMessages = localStorage.getItem('chatMessages');
    return storedMessages ? JSON.parse(storedMessages) : [];
  });
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(() => {
    const storedPosts = localStorage.getItem('forumPosts');
    return storedPosts ? JSON.parse(storedPosts) : [];
  });
  const [activeGroup, setActiveGroupState] = useState<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
      localStorage.setItem('forumPosts', JSON.stringify(forumPosts));
    } catch (error) {
      showNotification('خطا در ذخیره‌سازی پیام‌ها یا پست‌ها!', 'error');
    }
  }, [chatMessages, forumPosts, showNotification]);

  const setActiveGroup = (courseId: number, groupId: number) => {
    try {
      if (!isAuthenticated || !user) {
        throw new Error('برای دسترسی به گروه، باید وارد حساب کاربری شوید.');
      }
      const enrollment = enrollments.find(
        (e) => e.courseId === courseId && e.studentId === user.id
      );
      if (!enrollment) {
        throw new Error('شما در این دوره ثبت‌نام نکرده‌اید.');
      }
      if (enrollment.group !== `Group ${groupId}`) {
        throw new Error('شما به این گروه دسترسی ندارید.');
      }
      setActiveGroupState(groupId);
      showNotification(`گروه ${groupId} برای دوره فعال شد.`, 'success');
    } catch (error: any) {
      showNotification(error.message || 'خطا در فعال‌سازی گروه!', 'error');
    }
  };

  const sendChatMessage = async (courseId: number, groupId: number, message: string) => {
    try {
      if (!isAuthenticated || !user) {
        throw new Error('برای ارسال پیام باید وارد حساب کاربری شوید.');
      }
      if (!message.trim()) {
        throw new Error('پیام نمی‌تواند خالی باشد.');
      }
      if (activeGroup !== groupId) {
        throw new Error('این گروه برای شما فعال نیست.');
      }
      const enrollment = enrollments.find(
        (e) => e.courseId === courseId && e.studentId === user.id
      );
      if (!enrollment || enrollment.group !== `Group ${groupId}`) {
        throw new Error('شما به این گروه دسترسی ندارید.');
      }

      const newMessage: ChatMessage = {
        id: uuidv4(),
        groupId,
        courseId,
        userId: user.id,
        userName: DOMPurify.sanitize(user.name),
        message: DOMPurify.sanitize(message),
        timestamp: new Date().toLocaleString('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        type: 'chat',
      };

      setChatMessages((prev) => [...prev, newMessage]);
      showNotification('پیام با موفقیت ارسال شد.', 'success');
    } catch (error: any) {
      showNotification(error.message || 'خطا در ارسال پیام!', 'error');
      throw error;
    }
  };

  const createForumPost = async (courseId: number, groupId: number, title: string, content: string) => {
    try {
      if (!isAuthenticated || !user) {
        throw new Error('برای ایجاد پست باید وارد حساب کاربری شوید.');
      }
      if (!title.trim() || !content.trim()) {
        throw new Error('عنوان و محتوا نمی‌توانند خالی باشند.');
      }
      if (activeGroup !== groupId) {
        throw new Error('این گروه برای شما فعال نیست.');
      }
      const enrollment = enrollments.find(
        (e) => e.courseId === courseId && e.studentId === user.id
      );
      if (!enrollment || enrollment.group !== `Group ${groupId}`) {
        throw new Error('شما به این گروه دسترسی ندارید.');
      }

      const newPost: ForumPost = {
        id: uuidv4(),
        groupId,
        courseId,
        userId: user.id,
        userName: DOMPurify.sanitize(user.name),
        title: DOMPurify.sanitize(title),
        content: DOMPurify.sanitize(content),
        timestamp: new Date().toLocaleString('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        replies: [],
      };

      setForumPosts((prev) => [...prev, newPost]);
      showNotification('پست فروم با موفقیت ایجاد شد.', 'success');
    } catch (error: any) {
      showNotification(error.message || 'خطا در ایجاد پست فروم!', 'error');
      throw error;
    }
  };

  const replyToForumPost = async (postId: string, message: string) => {
    try {
      if (!isAuthenticated || !user) {
        throw new Error('برای پاسخ به پست باید وارد حساب کاربری شوید.');
      }
      if (!message.trim()) {
        throw new Error('پاسخ نمی‌تواند خالی باشد.');
      }
      const post = forumPosts.find((p) => p.id === postId);
      if (!post) {
        throw new Error('پست فروم یافت نشد.');
      }
      if (activeGroup !== post.groupId) {
        throw new Error('این گروه برای شما فعال نیست.');
      }
      const enrollment = enrollments.find(
        (e) => e.courseId === post.courseId && e.studentId === user.id
      );
      if (!enrollment || enrollment.group !== `Group ${post.groupId}`) {
        throw new Error('شما به این گروه دسترسی ندارید.');
      }

      const newReply: ChatMessage = {
        id: uuidv4(),
        groupId: post.groupId,
        courseId: post.courseId,
        userId: user.id,
        userName: DOMPurify.sanitize(user.name),
        message: DOMPurify.sanitize(message),
        timestamp: new Date().toLocaleString('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        type: 'forum',
      };

      setForumPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, replies: [...p.replies, newReply] } : p
        )
      );
      showNotification('پاسخ با موفقیت ارسال شد.', 'success');
    } catch (error: any) {
      showNotification(error.message || 'خطا در ارسال پاسخ!', 'error');
      throw error;
    }
  };

  const getGroupMessages = (courseId: number, groupId: number): ChatMessage[] => {
    return chatMessages.filter(
      (msg) => msg.courseId === courseId && msg.groupId === groupId
    );
  };

  const getGroupForumPosts = (courseId: number, groupId: number): ForumPost[] => {
    return forumPosts.filter(
      (post) => post.courseId === courseId && post.groupId === groupId
    );
  };

  return (
    <GroupChatContext.Provider
      value={{
        chatMessages,
        forumPosts,
        activeGroup,
        setActiveGroup,
        sendChatMessage,
        createForumPost,
        replyToForumPost,
        getGroupMessages,
        getGroupForumPosts,
      }}
    >
      {children}
    </GroupChatContext.Provider>
  );
};

export const useGroupChatContext = () => {
  const context = useContext(GroupChatContext);
  if (!context) {
    throw new Error('useGroupChatContext must be used within a GroupChatProvider');
  }
  return context;
};