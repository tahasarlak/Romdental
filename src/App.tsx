
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Courses from './pages/Courses/Courses';
import Instructors from './pages/Instructors/Instructors';
import Blog from './pages/Blog/Blog';
import Contact from './pages/Contact/Contact';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import InstructorDetails from './pages/Instructors/InstructorDetails/InstructorDetails';
import CourseDetails from './pages/Courses/[title]/[title]';
import Classroom from './pages/Classroom/Classroom';
import Checkout from './pages/Checkout/[id]';
import Profile from './pages/profile/Profile';
import Wishlist from './pages/Wishlist/Wishlist';
import { AuthProvider, useAuthContext } from './Context/AuthContext';
import { CartProvider } from './Context/CartContext';
import { BlogProvider } from './Context/BlogContext';
import { ContactProvider } from './Context/ContactContext';
import { CourseProvider } from './Context/CourseContext';
import { InstructorProvider } from './Context/InstructorContext';
import { ReviewProvider } from './Context/ReviewContext';
import { WishlistProvider } from './Context/WishlistContext';
import { SubscriptionProvider } from './Context/SubscriptionContext';
import { ScheduleProvider } from './Context/ScheduleContext';
import { NotificationProvider } from './Context/NotificationContext';
import BlogPostDetails from './pages/Blog/BlogPostDetails/BlogPostDetails';
import './styles/global.css';
import Layout from './components/Layout';
import PurchasedCourses from './pages/PurchasedCourses/PurchasedCourses';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <div className="app">
      <Router>
        <NotificationProvider>
          <CartProvider>
            <InstructorProvider>
              <CourseProvider>
                <BlogProvider>
                  <AuthProvider>
                    <ScheduleProvider>
                      <ReviewProvider>
                        <ContactProvider>
                          <WishlistProvider>
                            <SubscriptionProvider>
                              <Layout>
                                <Routes>
                                  <Route path="/" element={<Home />} />
                                  <Route path="/courses" element={<Courses />} />
                                  <Route path="/courses/:id" element={<CourseDetails />} />
                                  <Route path="/instructors" element={<Instructors />} />
                                  <Route path="/instructors/:instructorName" element={<InstructorDetails />} />
                                  <Route path="/blog" element={<Blog />} />
                                  <Route path="/blog/:id" element={<BlogPostDetails />} />
                                  <Route path="/contact" element={<Contact />} />
                                  <Route path="/login" element={<Login />} />
                                  <Route path="/signup" element={<Signup />} />
                                  <Route path="/checkout/:id" element={<Checkout />} />
                                  <Route path="/classroom/:id" element={<Classroom />} />
                                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                  <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                                  <Route path="/purchased-courses" element={<ProtectedRoute><PurchasedCourses /></ProtectedRoute>} />
                                </Routes>
                              </Layout>
                            </SubscriptionProvider>
                          </WishlistProvider>
                        </ContactProvider>
                      </ReviewProvider>
                    </ScheduleProvider>
                  </AuthProvider>
                </BlogProvider>
              </CourseProvider>
            </InstructorProvider>
          </CartProvider>
        </NotificationProvider>
      </Router>
    </div>
  );
};

export default App;
