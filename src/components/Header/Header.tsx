  import React, { useState, useEffect, useCallback } from 'react';
  import { NavLink, useNavigate, useLocation } from 'react-router-dom';
  import styles from './Header.module.css';
  import { useAuthContext } from '../../Context/AuthContext';
  import { useCartContext } from '../../Context/CartContext';
  import { useCourseContext } from '../../Context/CourseContext';
  import { useScheduleContext } from '../../Context/ScheduleContext';
  import { useNotificationContext } from '../../Context/NotificationContext';
  import { useCheckoutContext } from '../../Context/CheckoutContext';
  import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
  import IconButton from '@mui/material/IconButton';
  import Modal from '@mui/material/Modal';
  import CloseIcon from '@mui/icons-material/Close';
  import Tooltip from '@mui/material/Tooltip';
  import Menu from '@mui/material/Menu';
  import MenuItem from '@mui/material/MenuItem';
  import PersonIcon from '@mui/icons-material/Person';
  import FavoriteIcon from '@mui/icons-material/Favorite';
  import Avatar from '@mui/material/Avatar';
  import Button from '@mui/material/Button'; // وارد کردن Button
  import ThemeToggle from '../ThemeToggle/ThemeToggle';
  import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
  import Table from '@mui/material/Table';
  import TableBody from '@mui/material/TableBody';
  import TableCell from '@mui/material/TableCell';
  import TableContainer from '@mui/material/TableContainer';
  import TableHead from '@mui/material/TableHead';
  import TableRow from '@mui/material/TableRow';
  import Paper from '@mui/material/Paper';
  import Badge from '@mui/material/Badge';
  import DOMPurify from 'dompurify';
  import Cart from '../Cart/Cart';

  const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { isAuthenticated, user, logout } = useAuthContext();
    const { cartItems } = useCartContext();
    const { courses } = useCourseContext();
    const { weeklySchedule } = useScheduleContext();
    const { showNotification } = useNotificationContext();
    const { proceedToCheckout } = useCheckoutContext();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
      setIsMenuOpen(false);
      setIsCartOpen(false);
      setIsCalendarOpen(false);
      setAnchorEl(null);
    }, [location.pathname]);

    const handleNavLinkClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
      event.stopPropagation();
      setIsMenuOpen(false);
      setIsCartOpen(false);
      setIsCalendarOpen(false);
      setAnchorEl(null);
    }, []);

    const handleProfileClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    }, []);

    const handleProfileClose = useCallback(() => {
      setAnchorEl(null);
    }, []);

    const handleProfileNavigation = useCallback(
      (path: string) => {
        navigate(path);
        handleProfileClose();
      },
      [navigate, handleProfileClose]
    );

    const getShortName = useCallback((name: string) => {
      return name.split(' ')[0];
    }, []);

    const defaultProfilePicture = user?.gender === 'مرد'
      ? '/assets/male-profile.jpg'
      : user?.gender === 'زن'
      ? '/assets/female-profile.jpg'
      : '/assets/default-profile.jpg';

    const daysOfWeek = ['دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه', 'یکشنبه'];
    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

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
              <h1 className={styles.logoText}> ROM dental</h1>
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
              {isAuthenticated && user && (user.role === 'Admin' || user.role === 'SuperAdmin') && (
                <li>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                    onClick={handleNavLinkClick}
                  >
                    داشبورد ادمین
                  </NavLink>
                </li>
              )}
              <li>
                <Tooltip title="سبد خرید">
                  <IconButton
                    className={styles.cartIcon}
                    onClick={() => {
                      if (!isAuthenticated) {
                        showNotification('برای مشاهده سبد خرید، لطفاً وارد شوید.', 'error');
                        navigate('/login');
                        return;
                      }
                      setIsCartOpen(true);
                      setIsMenuOpen(false);
                      setIsCalendarOpen(false);
                      setAnchorEl(null);
                    }}
                    aria-label="باز کردن سبد خرید"
                  >
                    <Badge badgeContent={cartItems.length} color="primary">
                      <ShoppingCartIcon fontSize="medium" />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </li>
              <li>
                <Tooltip title="تقویم کلاس‌ها">
                  <IconButton
                    className={styles.calendarIcon}
                    onClick={() => {
                      setIsCalendarOpen(true);
                      setIsMenuOpen(false);
                      setIsCartOpen(false);
                      setAnchorEl(null);
                    }}
                    aria-label="باز کردن تقویم"
                  >
                    <CalendarTodayIcon fontSize="medium" />
                  </IconButton>
                </Tooltip>
              </li>
              <li>
                <ThemeToggle />
              </li>
            </ul>

            <div className={styles.authContainer}>
              {isAuthenticated && user ? (
                <div className={styles.userProfile}>
                  <Tooltip title={getShortName(user.name)}>
                    <IconButton
                      onClick={handleProfileClick}
                      aria-label="باز کردن منوی پروفایل"
                      className={styles.profileIcon}
                    >
                      <Avatar
                        src={user.profilePicture || defaultProfilePicture}
                        alt={user.name}
                        className={styles.profilePicture}
                      />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleProfileClose}
                    PaperProps={{
                      style: {
                        width: '200px',
                      },
                    }}
                  >
                    <MenuItem onClick={() => handleProfileNavigation('/profile')}>
                      <PersonIcon style={{ marginRight: '8px' }} /> پروفایل
                    </MenuItem>
                    {user && (user.role === 'SuperAdmin' || user.role === 'Instructor') && (
                      <MenuItem onClick={() => handleProfileNavigation('/instructor')}>
                        <PersonIcon style={{ marginRight: '8px' }} /> پروفایل استاد
                      </MenuItem>
                    )}
                    <MenuItem onClick={() => handleProfileNavigation('/wishlist')}>
                      <FavoriteIcon style={{ marginRight: '8px' }} /> علاقه‌مندی‌ها
                    </MenuItem>
                    <MenuItem>
                      <Button
                        className={styles.logoutButton}
                        onClick={() => {
                          logout();
                          handleProfileClose();
                          navigate('/');
                        }}
                      >
                        <CloseIcon style={{ marginRight: '8px' }} /> خروج
                      </Button>
                    </MenuItem>
                  </Menu>
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
              <Cart />
            </div>
          </div>
        </Modal>

        <Modal
          open={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          aria-labelledby="calendar-modal-title"
          className={styles.calendarModal}
        >
          <div className={styles.calendarModalContent}>
            <div className={styles.calendarModalHeader}>
              <h2 id="calendar-modal-title">تقویم کلاس‌های آنلاین</h2>
              <IconButton
                onClick={() => setIsCalendarOpen(false)}
                aria-label="بستن تقویم"
              >
                <CloseIcon />
              </IconButton>
            </div>
            <div className={styles.calendarModalBody}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>زمان</TableCell>
                      {daysOfWeek.map((day) => (
                        <TableCell key={day} align="center">{day}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {timeSlots.map((time) => (
                      <TableRow key={time}>
                        <TableCell>{time}</TableCell>
                        {daysOfWeek.map((day) => {
                          const schedule = weeklySchedule.find(
                            (item) => item.day === day && item.time === time
                          );
                          return (
                            <TableCell key={`${day}-${time}`} align="center">
                              {schedule ? (
                                <NavLink
                                  to={`/courses/${schedule.id}`}
                                  className={styles.scheduleLink}
                                  onClick={() => setIsCalendarOpen(false)}
                                >
                                  <div className={styles.scheduleItem}>
                                    <img
                                      src={schedule.image}
                                      alt={DOMPurify.sanitize(schedule.course)}
                                      className={styles.scheduleImage}
                                      onError={(e) => {
                                        e.currentTarget.src = '/assets/fallback.jpg';
                                      }}
                                    />
                                    <div>
                                      <div>{DOMPurify.sanitize(schedule.course)}</div>
                                      <div className={styles.scheduleInstructor}>
                                        {DOMPurify.sanitize(schedule.instructor)}
                                      </div>
                                    </div>
                                  </div>
                                </NavLink>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
        </Modal>
      </header>
    );
  };

  export default Header;