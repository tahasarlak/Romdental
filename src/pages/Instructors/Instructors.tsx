import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import WorkIcon from '@mui/icons-material/Work';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import styles from './Instructors.module.css';
import { useInstructorContext } from '../../Context/InstructorContext';

interface Instructor {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  image: string;
  experience: string;
  coursesTaught: string[];
}

const Instructors: React.FC = () => {
  const { instructors } = useInstructorContext();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const instructorsPerPage = 6;

  const filteredInstructors = instructors
    .filter((instructor) =>
      filter === 'all' ? true : instructor.specialty === filter
    )
    .filter((instructor) =>
      instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'experience') return parseInt(b.experience) - parseInt(a.experience);
      return 0;
    });

  const indexOfLastInstructor = currentPage * instructorsPerPage;
  const indexOfFirstInstructor = indexOfLastInstructor - instructorsPerPage;
  const currentInstructors = filteredInstructors.slice(indexOfFirstInstructor, indexOfLastInstructor);
  const totalPages = Math.ceil(filteredInstructors.length / instructorsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const specialties = ['all', ...new Set(instructors.map((instructor) => instructor.specialty))];

  return (
    <section className={styles.instructorsSection}>
      <div className={styles.container}>
        <h1 className={styles.title}>اساتید روم دنتال</h1>
        <p className={styles.subtitle}>
          با برترین اساتید دندانپزشکی، دانش و تجربه را به دست آورید
        </p>

        <div className={styles.searchContainer}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            placeholder="جستجو بر اساس نام یا تخصص..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.controls}>
          <div className={styles.filterContainer}>
            {specialties.map((specialty) => (
              <button
                key={specialty}
                className={`${styles.filterButton} ${filter === specialty ? styles.active : ''}`}
                onClick={() => setFilter(specialty)}
              >
                {specialty === 'all' ? 'همه تخصص‌ها' : specialty}
              </button>
            ))}
          </div>

          <div className={styles.sortContainer}>
            <label htmlFor="sort">مرتب‌سازی: </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="name">نام</option>
              <option value="experience">تجربه</option>
            </select>
          </div>
        </div>

        <div className={styles.instructorsGrid}>
          {currentInstructors.map((instructor) => (
            <div key={instructor.id} className={styles.instructorCard}>
              <img
                src={instructor.image}
                alt={instructor.name}
                className={styles.instructorImage}
              />
              <div className={styles.instructorContent}>
                <h2 className={styles.instructorName}>{instructor.name}</h2>
                <p className={styles.specialty}>تخصص: {instructor.specialty}</p>
                <p className={styles.bio}>{instructor.bio}</p>
                <div className={styles.details}>
                  <span><AccessTimeIcon /> تجربه: {instructor.experience}</span>
                  <span><WorkIcon /> دوره‌ها: {instructor.coursesTaught.join(', ')}</span>
                </div>
                <div className={styles.actions}>
                  <Link
                    to={`/instructors/${instructor.id}`}
                    className={styles.detailsLink}
                  >
                    جزئیات بیشتر
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => paginate(page)}
                className={`${styles.pageButton} ${currentPage === page ? styles.activePage : ''}`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Instructors;