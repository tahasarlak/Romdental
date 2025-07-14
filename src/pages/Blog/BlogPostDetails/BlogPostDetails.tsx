import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import DOMPurify from 'dompurify';
import LazyLoad from 'react-lazyload';
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { Button, Chip, Divider, IconButton, Typography } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TagIcon from '@mui/icons-material/Tag';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import { useBlogContext, BlogPost } from '../../../Context/BlogContext';
import { useAuthContext } from '../../../Context/AuthContext';
import { useWishlistContext } from '../../../Context/WishlistContext';
import { useNotificationContext } from '../../../Context/NotificationContext';
import styles from './BlogPostDetails.module.css';
import ReactPlayer from 'react-player';

/**
 * BlogPostDetails Component
 * Displays detailed view of a single blog post with media, tags, and related posts.
 * Supports wishlist functionality, sharing, and SEO optimization.
 */
const BlogPostDetails: React.FC = React.memo(() => {
  const { id } = useParams<{ id: string }>();
  const { blogPosts } = useBlogContext();
  const { isAuthenticated } = useAuthContext();
  const { isInWishlist, toggleWishlist, isWishlistLoading } = useWishlistContext();
  const { showNotification } = useNotificationContext();
  const navigate = useNavigate();

  const postId = id && !isNaN(parseInt(id)) ? parseInt(id) : null;
  const post = blogPosts.find((post: BlogPost) => post.id === postId);

  // Memoized related posts
  const relatedPosts = useMemo(
    () =>
      blogPosts
        .filter((p: BlogPost) => p.id !== postId && p.tags?.some((tag: string) => post?.tags?.includes(tag)))
        .slice(0, 3),
    [blogPosts, postId, post?.tags]
  );

  /**
   * Toggle wishlist for the current post
   */
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      showNotification('برای اضافه کردن به علاقه‌مندی‌ها، لطفاً وارد شو.', 'warning');
      navigate('/login');
      return;
    }
    if (post) {
      try {
        await toggleWishlist(post.id, 'blog', DOMPurify.sanitize(post.title));
        showNotification(
          isInWishlist(post.id, 'blog') ? 'از علاقه‌مندی‌ها حذف شد.' : 'به علاقه‌مندی‌ها اضافه شد.',
          'success'
        );
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'خطا در به‌روزرسانی علاقه‌مندی‌ها.';
        showNotification(errorMessage, 'error');
      }
    }
  };

  /**
   * Share the post using Web Share API or copy link to clipboard
   */
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href,
        });
      } catch {
        showNotification('خطا در اشتراک‌گذاری.', 'error');
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showNotification('لینک پست کپی شد!', 'success');
      } catch {
        showNotification('خطا در کپی لینک.', 'error');
      }
    } else {
      showNotification('اشتراک‌گذاری یا کپی لینک در این مرورگر پشتیبانی نمی‌شود.', 'warning');
    }
  };

  if (!postId || !post) {
    return (
      <section className={styles.section}>
        <Breadcrumb />
        <Typography variant="h1" className={styles.notFoundTitle}>
          پست پیدا نشد
        </Typography>
        <Typography className={styles.notFoundText}>
          پستی با این شناسه نیست.{' '}
          <Link to="/blog" className={styles.link} aria-label="بازگشت به صفحه وبلاگ">
            برگرد به وبلاگ
          </Link>
        </Typography>
      </section>
    );
  }

  // Format date
  const formattedDate = format(new Date(post.date), 'dd MMMM yyyy', { locale: faIR });

  return (
    <section className={styles.section} aria-labelledby="post-title">
      <Helmet>
        <title>{DOMPurify.sanitize(post.title)}</title>
        <meta name="description" content={DOMPurify.sanitize(post.excerpt || '')} />
        <meta name="keywords" content={post.tags?.join(', ') || ''} />
        <meta name="author" content={post.author || ''} />
        <meta property="og:title" content={DOMPurify.sanitize(post.title)} />
        <meta property="og:description" content={DOMPurify.sanitize(post.excerpt || '')} />
        <meta property="og:image" content={post.images?.[0] || ''} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:site_name" content="روم دنتال" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: DOMPurify.sanitize(post.title),
            author: { '@type': 'Person', name: post.author || '' },
            datePublished: post.date || '',
            image: post.images || [],
            description: DOMPurify.sanitize(post.excerpt || ''),
            keywords: post.tags?.join(', ') || '',
          })}
        </script>
      </Helmet>
      <Breadcrumb />
      <div className={styles.container}>
        <Typography variant="h1" id="post-title" className={styles.title}>
          {post.title}
        </Typography>
        <div className={styles.metaContainer}>
          <div className={styles.meta}>
            <Typography className={styles.metaText}>
              <CalendarTodayIcon className={styles.icon} aria-hidden="true" /> تاریخ: {formattedDate}
            </Typography>
            <Typography className={styles.metaText}>نویسنده: {post.author}</Typography>
            <Typography className={styles.metaText}>دسته‌بندی: {post.category}</Typography>
          </div>
          <div>
            <IconButton
              onClick={handleWishlistToggle}
              className={styles.wishlistButton}
              aria-label={isInWishlist(post.id, 'blog') ? `حذف ${post.title} از علاقه‌مندی‌ها` : `اضافه کردن ${post.title} به علاقه‌مندی‌ها`}
              title={isInWishlist(post.id, 'blog') ? 'حذف از علاقه‌مندی‌ها' : 'اضافه به علاقه‌مندی‌ها'}
              disabled={isWishlistLoading}
            >
              {isInWishlist(post.id, 'blog') ? (
                <BookmarkIcon className={styles.icon} />
              ) : (
                <BookmarkBorderIcon className={styles.icon} />
              )}
            </IconButton>
            <IconButton
              onClick={handleShare}
              aria-label="اشتراک‌گذاری پست"
              title="اشتراک‌گذاری"
            >
              <ShareIcon className={styles.icon} />
            </IconButton>
          </div>
        </div>
        {post.images?.length > 0 ? (
          <div className={styles.imageGallery}>
            {post.images.map((img: string, index: number) => (
              <LazyLoad key={index} height={200} offset={100} once>
                <img
                  src={img}
                  alt={`${DOMPurify.sanitize(post.title)} - عکس ${index + 1}`}
                  className={styles.image}
                  loading="lazy"
                />
              </LazyLoad>
            ))}
          </div>
        ) : (
          <Typography className={styles.noMedia}>تصویری برای این پست موجود نیست.</Typography>
        )}
        {post.videos?.length > 0 ? (
          <div className={styles.videoContainer}>
            {post.videos.map((video: string, index: number) => (
              <LazyLoad key={index} height={200} offset={100} once>
                <ReactPlayer
                  url={video}
                  controls
                  width="100%"
                  height="auto"
                  className={styles.video}
                />
              </LazyLoad>
            ))}
          </div>
        ) : (
          <Typography className={styles.noMedia}>ویدیویی برای این پست موجود نیست.</Typography>
        )}
        <div className={styles.tagsContainer}>
          <TagIcon className={styles.icon} aria-hidden="true" />
          <div className={styles.tags}>
            {(post.tags || []).map((tag: string, index: number) => (
              <Chip
                key={index}
                label={tag}
                className={styles.tag}
                role="button"
                aria-label={`برچسب ${tag}`}
              />
            ))}
          </div>
        </div>
        <Typography variant="body1" className={styles.excerpt}>
          {post.excerpt || ''}
        </Typography>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          role="article"
        />
        <Divider className={styles.divider} />
        {relatedPosts.length > 0 && (
          <div className={styles.relatedPosts}>
            <Typography variant="h2" className={styles.relatedTitle}>
              پست‌های مرتبط
            </Typography>
            <div className={styles.relatedGrid}>
              {relatedPosts.map((related: BlogPost) => (
                <Link
                  key={related.id}
                  to={`/blog/${related.id}`}
                  className={styles.relatedCard}
                  aria-label={`مشاهده پست مرتبط ${related.title}`}
                >
                  <img
                    src={related.images?.[0] || '/assets/placeholder.jpg'}
                    alt={DOMPurify.sanitize(related.title)}
                    className={styles.relatedImage}
                    loading="lazy"
                  />
                  <Typography variant="h3" className={styles.relatedCardTitle}>
                    {related.title}
                  </Typography>
                </Link>
              ))}
            </div>
          </div>
        )}
        {!isAuthenticated && (
          <Typography className={styles.authPrompt}>
            برای اضافه کردن به علاقه‌مندی‌ها، لطفاً{' '}
            <Link to="/login" className={styles.link} aria-label="ورود به حساب کاربری">
              وارد شو
            </Link>{' '}
            یا{' '}
            <Link to="/signup" className={styles.link} aria-label="ثبت‌نام در سایت">
              ثبت‌نام کن
            </Link>.
          </Typography>
        )}
        <div className={styles.backLinkContainer}>
          <Link to="/blog" className={styles.link} aria-label="بازگشت به صفحه وبلاگ">
            برگرد به وبلاگ
          </Link>
        </div>
      </div>
    </section>
  );
});

export default BlogPostDetails;