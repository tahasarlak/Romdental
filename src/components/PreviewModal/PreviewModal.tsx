import React, { useEffect, useRef, memo, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import DOMPurify from 'dompurify';
import { Button } from '@mui/material';
import styles from './PreviewModal.module.css';

interface ModalContent {
  text?: string;
  videoUrl?: string;
}

interface PreviewModalProps {
  isModalOpen: boolean;
  modalContent: ModalContent;
  closeModal: () => void;
}

// اعتبارسنجی URL برای اطمینان از دامنه‌های معتبر
const isValidVideoUrl = (url: string): boolean => {
  try {
    const validDomains = ['youtube.com', 'vimeo.com', 'your-trusted-domain.com'];
    const parsedUrl = new URL(url);
    return validDomains.some((domain) => parsedUrl.hostname.includes(domain));
  } catch {
    return false;
  }
};

// پاک‌سازی متن برای جلوگیری از XSS
const sanitizeText = (text: string): string => {
  if (text.length > 1000) {
    console.warn('Text input too long, truncating to 1000 characters');
    text = text.slice(0, 1000);
  }
  return DOMPurify.sanitize(text, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['p', 'strong', 'em'],
    ALLOWED_ATTR: [],
  });
};

// استفاده از React.memo برای بهینه‌سازی رندر
const PreviewModal: React.FC<PreviewModalProps> = memo(
  ({ isModalOpen, modalContent, closeModal }) => {
    const modalRef = useRef<HTMLDialogElement>(null);
    const [videoError, setVideoError] = useState<string | null>(null);

    // بهینه‌سازی closeModal با useCallback
    const handleCloseModal = useCallback(() => {
      closeModal();
      setVideoError(null); // پاک‌سازی خطا هنگام بستن
    }, [closeModal]);

    // مدیریت فوکوس هنگام باز شدن مودال
    useEffect(() => {
      if (isModalOpen && modalRef.current) {
        modalRef.current.focus();
      }
    }, [isModalOpen]);

    // بستن مودال با کلید Escape و پشتیبانی از ناوبری
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          handleCloseModal();
        }
      };
      if (isModalOpen) {
        document.addEventListener('keydown', handleKeyDown);
      }
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, handleCloseModal]);

    if (!isModalOpen) return null;

    // پاک‌سازی متن
    const sanitizedText = modalContent.text ? sanitizeText(modalContent.text) : '';

    return (
      <dialog
        className={styles.modalOverlay}
        role="dialog"
        aria-modal="true"
        aria-label="پیش‌نمایش دوره"
        aria-describedby="modal-description"
        dir="rtl"
        ref={modalRef}
        tabIndex={0}
      >
        <div id="modal-description" className={styles.hidden}>
          پیش‌نمایش محتوای دوره شامل ویدیو یا متن
        </div>
        <div className={styles.modal}>
          <button
            className={styles.closeModalButton}
            onClick={handleCloseModal}
            aria-label="بستن پیش‌نمایش"
          >
            ×
          </button>
          <div className={styles.modalContent}>
            {modalContent.videoUrl && isValidVideoUrl(modalContent.videoUrl) ? (
              <ReactPlayer
                url={modalContent.videoUrl}
                width="100%"
                height="auto"
                controls
                className={styles.videoPlayer}
                onError={() => setVideoError('خطا در بارگذاری ویدیو. لطفاً دوباره تلاش کنید.')}
                config={{
                  youtube: { playerVars: { cc_load_policy: 1 } },
                }}
              />
            ) : (
              <div className={styles.errorContainer}>
                <p className={styles.errorMessage} role="alert">
                  {videoError || 'ویدیوی پیش‌نمایش در دسترس نیست.'}
                </p>
                <Button variant="contained" onClick={handleCloseModal}>
                  بازگشت
                </Button>
              </div>
            )}
            {sanitizedText && <p dangerouslySetInnerHTML={{ __html: sanitizedText }} />}
          </div>
        </div>
      </dialog>
    );
  }
);

export default PreviewModal;