import React from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import BackToTop from './components/BackToTop/BackToTop';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
  
      <><Header />
      <main>{children}</main>
      <Footer />
   <BackToTop />  </> 
  
  );
};

export default Layout;