import React from 'react';
import { Helmet } from 'react-helmet-async';
import styles from './AboutUs.module.css';

const AboutUs: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>درباره ما - روم دنتال</title>
        <meta
          name="description"
          content="درباره موسسه آموزشی روم دنتال، ماموریت ما، و تیم حرفه‌ای ما در زمینه آموزش دندانپزشکی"
        />
        <meta
          name="keywords"
          content="روم دنتال, درباره ما, آموزش دندانپزشکی, موسسه آموزشی"
        />
        <meta property="og:title" content="درباره ما - روم دنتال" />
        <meta
          property="og:description"
          content="درباره موسسه آموزشی روم دنتال، ماموریت ما، و تیم حرفه‌ای ما در زمینه آموزش دندانپزشکی"
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/assets/about-us.jpg" />
        <link rel="alternate" hrefLang="fa" href="/about" />
      </Helmet>
      <section className={styles.aboutUsSection} role="main">
        <div className={styles.container}>
          <h1 className={styles.title}>درباره روم دنتال</h1>
          <p className={styles.description}>
            روم دنتال یک موسسه آموزشی پیشرو در زمینه دندانپزشکی است که با هدف ارتقای مهارت‌های حرفه‌ای دندانپزشکان و ارائه آموزش‌های با کیفیت بالا تاسیس شده است. ما با بهره‌گیری از اساتید مجرب و برنامه‌های آموزشی متنوع، به دنبال توانمندسازی متخصصان این حوزه هستیم.
          </p>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>ماموریت ما</h2>
            <p>
              ماموریت ما ارائه آموزش‌های نوین و کاربردی در زمینه دندانپزشکی است تا دندانپزشکان بتوانند با اعتماد به نفس و دانش به‌روز، بهترین خدمات را به بیماران خود ارائه دهند. ما به دنبال ایجاد یک جامعه حرفه‌ای و پویا هستیم که در آن یادگیری مداوم و پیشرفت در اولویت باشد.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>چشم‌انداز ما</h2>
            <p>
              تبدیل شدن به مرجع اصلی آموزش دندانپزشکی در منطقه و ارائه دوره‌هایی که استانداردهای جهانی را رعایت کرده و نیازهای محلی را برآورده می‌کنند.
            </p>
          </div>

          <div className={styles.section} id="team">
            <h2 className={styles.sectionTitle}>تیم ما</h2>
            <p>
              تیم روم دنتال متشکل از اساتید برجسته، متخصصان فناوری اطلاعات، و کارشناسان آموزش است که همگی با اشتیاق به ارتقای سطح دانش و مهارت در حوزه دندانپزشکی فعالیت می‌کنند. ما به همکاری با دانشگاه‌ها و موسسات معتبر بین‌المللی افتخار می‌کنیم.
            </p>
            <div className={styles.teamMembers}>
              <div className={styles.teamMember}>
                <img src="/assets/team-member1.jpg" alt="عضو تیم ۱" className={styles.teamImage} />
                <h3 className={styles.teamName}>دکتر علی محمدی</h3>
                <p className={styles.teamRole}>مدیر آموزشی</p>
              </div>
              <div className={styles.teamMember}>
                <img src="/assets/team-member2.jpg" alt="عضو تیم ۲" className={styles.teamImage} />
                <h3 className={styles.teamName}>مهندس سارا احمدی</h3>
                <p className={styles.teamRole}>مدیر فناوری</p>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>چرا روم دنتال؟</h2>
            <ul className={styles.features}>
              <li>دوره‌های متنوع آنلاین و حضوری</li>
              <li>اساتید با تجربه و دارای مدارک بین‌المللی</li>
              <li>پشتیبانی ۲۴/۷ برای دانشجویان</li>
              <li>محتوای آموزشی به‌روز و کاربردی</li>
              <li>همکاری با دانشگاه‌های معتبر</li>
            </ul>
          </div>

          <div className={styles.cta}>
            <a href="/courses" className={styles.ctaButton}>
              دوره‌های ما را کاوش کنید
            </a>
            <a href="/contact" className={styles.ctaButton}>
              با ما تماس بگیرید
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUs;