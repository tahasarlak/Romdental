import React, { Component, ReactNode } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
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
import PurchasedCourses from './pages/PurchasedCourses/PurchasedCourses';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import InstructorDashboard from './pages/InstructorDashboard/InstructorDashboard';
import BlogPostDetails from './pages/Blog/BlogPostDetails/BlogPostDetails';
import OrderHistory from './pages/OrderHistory/OrderHistory';
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
import { OrderProvider } from './Context/OrderContext';
import { CheckoutProvider } from './Context/CheckoutContext';
import './styles/global.css';
import Layout from './components/Layout';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }} role="alert" aria-live="assertive">
          <h1>خطایی رخ داده است!</h1>
          <p>{this.state.error}</p>
          <button onClick={() => window.location.reload()} aria-label="بارگذاری مجدد صفحه">
            بارگذاری مجدد صفحه
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const RestrictedRoute: React.FC<{ children: React.ReactNode; roles: string[] }> = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthContext();
  if (!isAuthenticated || !user) return <Navigate to="/login" />;
  if (!roles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <Router>
        <ErrorBoundary>
          <AuthProvider>
            <NotificationProvider>
              <InstructorProvider>
                <CourseProvider>
                  <ReviewProvider>
                    <BlogProvider>
                      <CartProvider>
                        <ScheduleProvider>
                          <ContactProvider>
                            <WishlistProvider>
                              <SubscriptionProvider>
                                <OrderProvider>
                                  <CheckoutProvider>
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
                                        <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                                        <Route path="/admin" element={<RestrictedRoute roles={['SuperAdmin', 'Admin']}><AdminDashboard /></RestrictedRoute>} />
                                        <Route path="/instructor" element={<RestrictedRoute roles={['SuperAdmin', 'Instructor']}><InstructorDashboard /></RestrictedRoute>} />
                                      </Routes>
                                    </Layout>
                                  </CheckoutProvider>
                                </OrderProvider>
                              </SubscriptionProvider>
                            </WishlistProvider>
                          </ContactProvider>
                        </ScheduleProvider>
                      </CartProvider>
                    </BlogProvider>
                  </ReviewProvider>
                </CourseProvider>
              </InstructorProvider>
            </NotificationProvider>
          </AuthProvider>
        </ErrorBoundary>

      </Router>
    </HelmetProvider>
  );
};

export default App;