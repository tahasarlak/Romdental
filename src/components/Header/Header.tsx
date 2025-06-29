import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import { useAuthContext } from '../../Context/AuthContext';
import { useCartContext } from '../../Context/CartContext';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthContext();
  const { cartItems, removeFromCart } = useCartContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
    setIsCartOpen(false);
  }, [location.pathname]);

  const handleNavLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
    setIsMenuOpen(false);
    setIsCartOpen(false);
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout/multiple');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <NavLink
          to="/"
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
          onClick={handleNavLinkClick}
        >
          <div className={styles.logoContainer}>
            <img
              src="/assets/logo.jpg"
              alt="روم دنتال - سماشکو"
              className={styles.logoImage}
            />
            <h1 className={styles.logoText}>روم دنتال</h1>
          </div>
        </NavLink>
        <button
          className={`${styles.menuToggle} ${isMenuOpen ? styles.open : ''}`}
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
                onClick={handleNavLinkClick}
              >
                خانه
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/courses"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                onClick={handleNavLinkClick}
              >
                دوره‌ها
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/instructors"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                onClick={handleNavLinkClick}
              >
                اساتید
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/blog"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                onClick={handleNavLinkClick}
              >
                وبلاگ
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                onClick={handleNavLinkClick}
              >
                تماس
              </NavLink>
            </li>
            <li>
              <Tooltip title="سبد خرید">
                <IconButton
                  className={styles.cartIcon}
                  onClick={() => {
                    setIsCartOpen(true);
                    setIsMenuOpen(false);
                  }}
                  aria-label="باز کردن سبد خرید"
                >
                  <ShoppingCartIcon />
                </IconButton>
              </Tooltip>
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
                <button
                  onClick={() => {
                    logout();
                    handleNavLinkClick({ stopPropagation: () => {} } as any);
                  }}
                  className={styles.logoutButton}
                >
                  خروج
                </button>
              </div>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) => `${styles.authButton} ${isActive ? styles.active : ''}`}
                  onClick={handleNavLinkClick}
                >
                  ورود به سامانه
                </NavLink>
                <NavLink
                  to="/signup"
                  className={({ isActive }) => `${styles.signupButton} ${isActive ? styles.active : ''}`}
                  onClick={handleNavLinkClick}
                >
                  ثبت‌نام
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </div>

      <Modal
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        aria-labelledby="cart-modal-title"
        className={styles.cartModal}
      >
        <div className={styles.cartModalContent}>
          <div className={styles.cartModalHeader}>
            <h2 id="cart-modal-title">سبد خرید</h2>
            <IconButton
              onClick={() => setIsCartOpen(false)}
              aria-label="بستن سبد خرید"
            >
              <CloseIcon />
            </IconButton>
          </div>
          <div className={styles.cartModalBody}>
            {cartItems.length === 0 ? (
              <p>سبد خرید خالی است.</p>
            ) : (
              <ul className={styles.cartItemList}>
                {cartItems.map((item) => (
                  <li key={item.id} className={styles.cartItem}>
                    <span>{item.title}</span>
                    <span>{item.price}</span>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => removeFromCart(item.id)}
                    >
                      حذف
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {cartItems.length > 0 && (
            <div className={styles.cartModalFooter}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleProceedToCheckout}
                disabled={cartItems.length === 0}
              >
                ادامه به پرداخت
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </header>
  );
};

export default Header;