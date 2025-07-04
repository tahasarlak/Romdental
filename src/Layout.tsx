import React from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import BackToTop from './components/BackToTop/BackToTop'; // ایمپورت BackToTop

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
      <BackToTop /> {/* اضافه کردن BackToTop */}
    </div>
  );
};

export default Layout;