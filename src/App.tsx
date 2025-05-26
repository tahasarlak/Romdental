// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Courses from './pages/Courses/Courses';
import Instructors from './components/Instructors/Instructors';
import Blog from './pages/Blog/Blog';
import Contact from './pages/Contact/Contact';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Layout from './Layout';
import { AuthProvider } from './Context/AuthContext';
import { BlogProvider } from './Context/BlogContext';
import { ContactProvider } from './Context/ContactContext';
import { CourseProvider } from './Context/CourseContext';
import { InstructorProvider } from './Context/InstructorContext';
import { TestimonialProvider } from './Context/TestimonialContext'; // اضافه کردن فراهم‌کننده جدید
import './styles/global.css';
import CourseDetails from './pages/Courses/[id]/[id]';

const App: React.FC = () => {
  return (
    <div className="app">
      <AuthProvider>
        <CourseProvider>
          <InstructorProvider>
            <BlogProvider>
              <ContactProvider>
                <TestimonialProvider>
                  <Router>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/instructors" element={<Instructors />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/courses/:id" element={<CourseDetails />} />
                      </Routes>
                    </Layout>
                  </Router>
                </TestimonialProvider>
              </ContactProvider>
            </BlogProvider>
          </InstructorProvider>
        </CourseProvider>
      </AuthProvider>
    </div>
  );
};

export default App;