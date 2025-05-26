// src/components/Header.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';
import { useAuthContext } from '../../Context/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthContext();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
      <NavLink
                to="/"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
              >   <div className={styles.logoContainer}>
          <img
            src="/assets/logo.jpg"
            alt="روم دنتال - سماشکو"
            className={styles.logoImage}
          />
          <h1 className={styles.logoText}>روم دنتال </h1>
        </div>
        </NavLink>
        <button
          className={styles.menuToggle}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="باز کردن منو"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          <ul className={styles.navList}>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                خانه
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/courses"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                دوره‌ها
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/instructors"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                اساتید
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/blog"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                وبلاگ
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                تماس
              </NavLink>
            </li>
          </ul>

          <div className={styles.authContainer}>
            {isAuthenticated && user ? (
              <div className={styles.userProfile}>
                <img
                  src={user.profilePicture || '/assets/default-profile.jpg'}
                  alt={user.name}
                  className={styles.profilePicture}
                />
                <span className={styles.userName}>{user.name}</span>
                <button onClick={logout} className={styles.logoutButton}>
                  خروج
                </button>
              </div>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) => `${styles.authButton} ${isActive ? styles.active : ''}`}
                >
                  ورود به سامانه
                </NavLink>
                <NavLink
                  to="/signup"
                  className={({ isActive }) => `${styles.signupButton} ${isActive ? styles.active : ''}`}
                >
                  ثبت‌نام
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;