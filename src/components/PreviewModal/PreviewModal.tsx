import React from 'react';
import ReactPlayer from 'react-player';
import styles from './PreviewModal.module.css';

interface PreviewModalProps {
  isModalOpen: boolean;
  modalContent: {
    text?: string;
    videoUrl?: string;
  };
  closeModal: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isModalOpen,
  modalContent,
  closeModal,
}) => {
  if (!isModalOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button
          className={styles.closeModalButton}
          onClick={closeModal}
          aria-label="بستن پیش‌نمایش"
        >
          ×
        </button>
        <div className={styles.modalContent}>
          {modalContent.videoUrl && (
            <ReactPlayer
              url={modalContent.videoUrl}
              width="100%"
              height="auto"
              controls
              className={styles.videoPlayer}
            />
          )}
          {modalContent.text && <p>{modalContent.text}</p>}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;