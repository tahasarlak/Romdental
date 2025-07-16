import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { useCourseContext } from './CourseContext';
import { useEnrollmentContext } from './EnrollmentContext';
import { useNotificationContext } from './NotificationContext';
import { v4 as uuidv4 } from 'uuid';
import DOMPurify from 'dompurify';

interface Quiz {
  id: string;
  courseId: number;
  title: string;
  questions: Question[];
  createdBy: number; // ID استاد یا ادمین
  createdAt: string;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index of correct option
}

interface QuizSubmission {
  id: string;
  quizId: string;
  studentId: number;
  answers: { questionId: string; selectedOption: number }[];
  score: number;
  submittedAt: string;
}

interface QuizContextType {
  quizzes: Quiz[];
  submissions: QuizSubmission[];
  createQuiz: (courseId: number, title: string, questions: Question[]) => Promise<void>;
  submitQuiz: (quizId: string, answers: { questionId: string; selectedOption: number }[]) => Promise<void>;
  getCourseQuizzes: (courseId: number) => Quiz[];
  getStudentSubmissions: (studentId: number, quizId?: string) => QuizSubmission[];
  getQuizScore: (submissionId: string) => number;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthContext();
  const { courses } = useCourseContext();
  const { enrollments } = useEnrollmentContext();
  const { showNotification } = useNotificationContext();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);

  // Load quizzes and submissions from localStorage on mount
  useEffect(() => {
    const storedQuizzes = localStorage.getItem('quizzes');
    const storedSubmissions = localStorage.getItem('submissions');
    if (storedQuizzes) {
      try {
        setQuizzes(JSON.parse(storedQuizzes));
      } catch (error) {
        console.error('Error parsing quizzes from localStorage:', error);
      }
    }
    if (storedSubmissions) {
      try {
        setSubmissions(JSON.parse(storedSubmissions));
      } catch (error) {
        console.error('Error parsing submissions from localStorage:', error);
      }
    }
  }, []);

  // Save quizzes and submissions to localStorage on change
  useEffect(() => {
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
    localStorage.setItem('submissions', JSON.stringify(submissions));
  }, [quizzes, submissions]);

  const createQuiz = async (courseId: number, title: string, questions: Question[]) => {
    if (!isAuthenticated || !user || !['SuperAdmin', 'Admin', 'Instructor'].includes(user.role)) {
      throw new Error('فقط ادمین‌ها و اساتید می‌توانند آزمون ایجاد کنند.');
    }
    if (!title.trim() || questions.length === 0) {
      throw new Error('عنوان آزمون و سوالات نمی‌توانند خالی باشند.');
    }
    const course = courses.find((c) => c.id === courseId);
    if (!course) {
      throw new Error('دوره یافت نشد.');
    }

    try {
      const newQuiz: Quiz = {
        id: uuidv4(),
        courseId,
        title: DOMPurify.sanitize(title),
        questions: questions.map((q) => ({
          ...q,
          id: uuidv4(),
          text: DOMPurify.sanitize(q.text),
          options: q.options.map((opt) => DOMPurify.sanitize(opt)),
        })),
        createdBy: user.id,
        createdAt: new Date().toLocaleString('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setQuizzes((prev) => [...prev, newQuiz]);
      showNotification('آزمون با موفقیت ایجاد شد.', 'success');
    } catch (error: any) {
      showNotification(error.message || 'خطا در ایجاد آزمون.', 'error');
      throw error;
    }
  };

  const submitQuiz = async (quizId: string, answers: { questionId: string; selectedOption: number }[]) => {
    if (!isAuthenticated || !user) {
      throw new Error('برای ارسال پاسخ‌ها باید وارد حساب کاربری شوید.');
    }
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) {
      throw new Error('آزمون یافت نشد.');
    }
    const enrollment = enrollments.find((e) => e.courseId === quiz.courseId && e.studentId === user.id);
    if (!enrollment) {
      throw new Error('شما در این دوره ثبت‌نام نکرده‌اید.');
    }

    try {
      // Calculate score
      let score = 0;
      answers.forEach((answer) => {
        const question = quiz.questions.find((q) => q.id === answer.questionId);
        if (question && question.correctAnswer === answer.selectedOption) {
          score += 100 / quiz.questions.length; // Simple scoring: 100 points divided by number of questions
        }
      });

      const newSubmission: QuizSubmission = {
        id: uuidv4(),
        quizId,
        studentId: user.id,
        answers,
        score: Math.round(score),
        submittedAt: new Date().toLocaleString('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setSubmissions((prev) => [...prev, newSubmission]);
      showNotification(`پاسخ‌های آزمون با موفقیت ارسال شد. نمره: ${newSubmission.score}`, 'success');
    } catch (error: any) {
      showNotification(error.message || 'خطا در ارسال پاسخ‌های آزمون.', 'error');
      throw error;
    }
  };

  const getCourseQuizzes = (courseId: number): Quiz[] => {
    return quizzes.filter((q) => q.courseId === courseId);
  };

  const getStudentSubmissions = (studentId: number, quizId?: string): QuizSubmission[] => {
    return submissions.filter((s) => s.studentId === studentId && (!quizId || s.quizId === quizId));
  };

  const getQuizScore = (submissionId: string): number => {
    const submission = submissions.find((s) => s.id === submissionId);
    return submission ? submission.score : 0;
  };

  return (
    <QuizContext.Provider
      value={{
        quizzes,
        submissions,
        createQuiz,
        submitQuiz,
        getCourseQuizzes,
        getStudentSubmissions,
        getQuizScore,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuizContext = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuizContext must be used within a QuizProvider');
  }
  return context;
};