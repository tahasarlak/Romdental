import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styles from './CourseFaqs.module.css';
import { FaqItem } from '../../pages/Courses/[title]/[title]';

interface CourseFaqsProps {
  faqs: FaqItem[];
  expandedFaq: number | null;
  toggleFaq: (id: number) => void;
}

const CourseFaqs: React.FC<CourseFaqsProps> = ({ faqs, expandedFaq, toggleFaq }) => {
  return (
    <>
      <h2>سوالات متداول</h2>
      <div className={styles.faq}>
        {(faqs || []).map((faq) => (
          <div
            key={faq.id}
            className={styles.faqItem}
            role="button"
            tabIndex={0}
            onClick={() => toggleFaq(faq.id)}
            onKeyDown={(e) => e.key === 'Enter' && toggleFaq(faq.id)}
            aria-expanded={expandedFaq === faq.id}
          >
            <div className={styles.faqHeader}>
              <h3>{faq.question}</h3>
              <ExpandMoreIcon
                className={`${styles.expandIcon} ${
                  expandedFaq === faq.id ? styles.expanded : ''
                }`}
              />
            </div>
            {expandedFaq === faq.id && (
              <div className={styles.faqContent}>
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
        {(!faqs || faqs.length === 0) && <p>سوالی برای این دوره ثبت نشده است.</p>}
      </div>
    </>
  );
};

export default CourseFaqs;