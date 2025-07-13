import React, { useMemo } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DOMPurify from 'dompurify';
import styles from './CourseFaqs.module.css';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

interface CourseFaqsProps {
  faqs: FaqItem[];
  expandedFaq: number | null;
  toggleFaq: (id: number) => void;
}

/**
 * Sanitizes input text to prevent XSS attacks.
 * @param text - The input text to sanitize.
 * @returns Sanitized text.
 */
const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i'],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'iframe', 'object'],
  }).trim();
};

/**
 * Validates FAQ items to ensure they have required fields.
 * @param faqs - Array of FAQ items to validate.
 * @returns Array of valid FAQ items.
 */
const validateFaqs = (faqs: FaqItem[]): FaqItem[] => {
  return Array.isArray(faqs)
    ? faqs.filter(
        (faq): faq is FaqItem =>
          typeof faq.id === 'number' &&
          typeof faq.question === 'string' &&
          faq.question.trim() !== '' &&
          typeof faq.answer === 'string' &&
          faq.answer.trim() !== ''
      )
    : [];
};

/**
 * CourseFaqs component displays a list of FAQs with expandable answers.
 * @param props - Component props including faqs, expandedFaq, and toggleFaq.
 */
const CourseFaqs: React.FC<CourseFaqsProps> = ({ faqs, expandedFaq, toggleFaq }) => {
  // Validate FAQs and memoize to optimize performance
  const validatedFaqs = useMemo(() => validateFaqs(faqs), [faqs]);

  // Memoize structured data for SEO
  const structuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: validatedFaqs.map((faq) => ({
        '@type': 'Question',
        name: sanitizeText(faq.question),
        acceptedAnswer: {
          '@type': 'Answer',
          text: sanitizeText(faq.answer),
        },
      })),
    }),
    [validatedFaqs]
  );

  return (
    <section className={styles.faqSection} aria-label="سوالات متداول دوره">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <h2 className={styles.title}>سوالات متداول</h2>
      <div className={styles.faq}>
        {validatedFaqs.length > 0 ? (
          validatedFaqs.map((faq) => (
            <div
              key={faq.id}
              className={styles.faqItem}
              role="button"
              tabIndex={0}
              onClick={() => toggleFaq(faq.id)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === 'Space') && toggleFaq(faq.id)}
              aria-expanded={expandedFaq === faq.id}
              aria-controls={`faq-content-${faq.id}`}
            >
              <div className={styles.faqHeader}>
                <h3 id={`faq-question-${faq.id}`}>{sanitizeText(faq.question)}</h3>
                <ExpandMoreIcon
                  className={`${styles.expandIcon} ${expandedFaq === faq.id ? styles.expanded : ''}`}
                  aria-hidden="true"
                />
              </div>
              {expandedFaq === faq.id && (
                <div
                  id={`faq-content-${faq.id}`}
                  className={styles.faqContent}
                  role="region"
                  aria-labelledby={`faq-question-${faq.id}`}
                >
                  <p>{sanitizeText(faq.answer)}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className={styles.noFaqs}>سوالی برای این دوره ثبت نشده است.</p>
        )}
      </div>
    </section>
  );
};

export default CourseFaqs;