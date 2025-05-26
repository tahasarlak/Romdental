// src/Layout.tsx
import React from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;