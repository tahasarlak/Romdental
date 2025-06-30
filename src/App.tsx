import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Courses from './pages/Courses/Courses';
import Instructors from './pages/Instructors/Instructors';
import Blog from './pages/Blog/Blog';
import Contact from './pages/Contact/Contact';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Layout from './Layout';
import { AuthProvider } from './Context/AuthContext';
import { CartProvider } from './Context/CartContext';
import { BlogProvider } from './Context/BlogContext';
import { ContactProvider } from './Context/ContactContext';
import { CourseProvider } from './Context/CourseContext';
import { InstructorProvider } from './Context/InstructorContext';
import { TestimonialProvider } from './Context/TestimonialContext';
import { ReviewProvider } from './Context/ReviewContext';
import { WishlistProvider } from './Context/WishlistContext';
import InstructorDetails from './pages/Instructors/InstructorDetails/InstructorDetails';
import './styles/global.css';
import Checkout from './pages/Checkout/[id]';
import CourseDetails from './pages/Courses/[id]/[id]';

const App: React.FC = () => {
  return (
    <div className="app">
      <AuthProvider>
        <CartProvider>
          <InstructorProvider>
            <CourseProvider>
              <ReviewProvider>
                <BlogProvider>
                  <ContactProvider>
                    <TestimonialProvider>
                      <WishlistProvider>
                        <Router>
                          <Layout>
                            <Routes>
                              <Route path="/" element={<Home />} />
                              <Route path="/courses" element={<Courses />} />
                              <Route path="/instructors" element={<Instructors />} />
                              <Route path="/instructors/:instructorName" element={<InstructorDetails />} />
                              <Route path="/blog" element={<Blog />} />
                              <Route path="/contact" element={<Contact />} />
                              <Route path="/login" element={<Login />} />
                              <Route path="/signup" element={<Signup />} />
                              <Route path="/courses/:id" element={<CourseDetails />} />
                              <Route path="/checkout/:id" element={<Checkout />} />
                            </Routes>
                          </Layout>
                        </Router>
                      </WishlistProvider>
                    </TestimonialProvider>
                  </ContactProvider>
                </BlogProvider>
              </ReviewProvider>
            </CourseProvider>
          </InstructorProvider>
        </CartProvider>
      </AuthProvider>
    </div>
  );
};

export default App;