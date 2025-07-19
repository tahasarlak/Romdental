import React, { Component, ReactNode } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import Courses from './pages/Courses/Courses';
import Instructors from './pages/Instructors/Instructors';
import Blog from './pages/Blog/Blog';
import Contact from './pages/Contact/Contact';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import InstructorDetails from './pages/Instructors/InstructorDetails/InstructorDetails';
import CourseDetails from './pages/Courses/[id]/[id]';
import Classroom from './pages/Classroom/Classroom';
import Profile from './pages/profile/Profile';
import Wishlist from './pages/Wishlist/Wishlist';
import PurchasedCourses from './pages/PurchasedCourses/PurchasedCourses';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import InstructorDashboard from './pages/InstructorDashboard/InstructorDashboard';
import BlogPostDetails from './pages/Blog/BlogPostDetails/BlogPostDetails';
import OrderHistory from './pages/OrderHistory/OrderHistory';
import ResetPassword from './pages/ResetPassword/ResetPassword'; // Import the ResetPassword component
import { AuthProvider, useAuthContext } from './Context/Auth/UserAuthContext';
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
import { EnrollmentProvider } from './Context/EnrollmentContext';
import { PaymentProvider } from './Context/PaymentContext';
import { GroupChatProvider } from './Context/GroupChatContext';
import { AnalyticsProvider } from './Context/AnalyticsContext';
import { SupportProvider } from './Context/SupportContext';
import { QuizProvider } from './Context/QuizContext';
import { FileProvider } from './Context/FileContext';
import { ProgressProvider } from './Context/ProgressContext';
import { SearchProvider } from './Context/SearchContext';
import { InstructorAuthProvider } from './Context/Auth/InstructorAuthContext';
import { AdminAuthProvider } from './Context/Auth/AdminAuthContext';
import { BloggerAuthProvider } from './Context/Auth/BloggerAuthContext';
import { ShareProvider } from './Context/ShareContext';
import './styles/global.css';
import Layout from './components/Layout';
import CheckoutMultiple from './pages/Checkout/CheckoutMultiple';
import AboutUs from './pages/AboutUs/AboutUs';

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

const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <InstructorProvider>
            <InstructorAuthProvider>
              <AdminAuthProvider>
                <BlogProvider>
                  <BloggerAuthProvider>
                    <CourseProvider>
                      <EnrollmentProvider>
                        <ReviewProvider>
                          <CartProvider>
                            <ScheduleProvider>
                              <ContactProvider>
                                <WishlistProvider>
                                  <SubscriptionProvider>
                                    <OrderProvider>
                                      <CheckoutProvider>
                                        <PaymentProvider>
                                          <GroupChatProvider>
                                            <AnalyticsProvider>
                                              <SupportProvider>
                                                <QuizProvider>
                                                  <FileProvider>
                                                    <ProgressProvider>
                                                      <SearchProvider>
                                                        <ShareProvider>
                                                          <Layout key={location.pathname}>
                                                            <Routes>
                                                              <Route path="/" element={<Home key={location.pathname} />} />
                                                              <Route path="/courses" element={<Courses key={location.pathname} />} />
                                                              <Route path="/courses/:slug" element={<CourseDetails key={location.pathname} />} />
                                                              <Route path="/instructors" element={<Instructors key={location.pathname} />} />
                                                              <Route path="/instructors/:instructorName" element={<InstructorDetails key={location.pathname} />} />
                                                              <Route path="/blog" element={<Blog key={location.pathname} />} />
                                                              <Route path="/blog/:id" element={<BlogPostDetails key={location.pathname} />} />
                                                              <Route path="/contact" element={<Contact key={location.pathname} />} />
                                                              <Route path="/login" element={<Login key={location.pathname} />} />
                                                              <Route path="/signup" element={<Signup key={location.pathname} />} />
                                                              <Route path="/reset-password" element={<ResetPassword key={location.pathname} />} /> {/* Added ResetPassword route */}
                                                              <Route path="/checkout/multiple" element={<CheckoutMultiple key={location.pathname} />} />
                                                              <Route path="/classroom/:id" element={<Classroom key={location.pathname} />} />
                                                              <Route path="/profile" element={<ProtectedRoute><Profile key={location.pathname} /></ProtectedRoute>} />
                                                              <Route path="/wishlist" element={<ProtectedRoute><Wishlist key={location.pathname} /></ProtectedRoute>} />
                                                              <Route path="/purchased-courses" element={<ProtectedRoute><PurchasedCourses key={location.pathname} /></ProtectedRoute>} />
                                                              <Route path="/orders" element={<ProtectedRoute><OrderHistory key={location.pathname} /></ProtectedRoute>} />
                                                              <Route path="/admin" element={<RestrictedRoute roles={['SuperAdmin', 'Admin']}><AdminDashboard key={location.pathname} /></RestrictedRoute>} />
                                                              <Route path="/about" element={<AboutUs key={location.pathname} />} />
                                                              <Route path="/instructor" element={<RestrictedRoute roles={['SuperAdmin', 'Instructor']}><InstructorDashboard key={location.pathname} /></RestrictedRoute>} />
                                                            </Routes>
                                                          </Layout>
                                                        </ShareProvider>
                                                      </SearchProvider>
                                                    </ProgressProvider>
                                                  </FileProvider>
                                                </QuizProvider>
                                              </SupportProvider>
                                            </AnalyticsProvider>
                                          </GroupChatProvider>
                                        </PaymentProvider>
                                      </CheckoutProvider>
                                    </OrderProvider>
                                  </SubscriptionProvider>
                                </WishlistProvider>
                              </ContactProvider>
                            </ScheduleProvider>
                          </CartProvider>
                        </ReviewProvider>
                      </EnrollmentProvider>
                    </CourseProvider>
                  </BloggerAuthProvider>
                </BlogProvider>
              </AdminAuthProvider>
            </InstructorAuthProvider>
          </InstructorProvider>
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <Router>
        <AppContent />
      </Router>
    </HelmetProvider>
  );
};

export default App;