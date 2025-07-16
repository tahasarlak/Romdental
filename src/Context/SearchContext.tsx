import React, { createContext, useContext, useState } from 'react';
import { useCourseContext } from './CourseContext';
import { useBlogContext } from './BlogContext';
import { useInstructorContext } from './InstructorContext';

interface SearchResult {
  courses: any[];
  blogs: any[];
  instructors: any[];
}

interface SearchContextType {
  search: (query: string) => void;
  searchResults: SearchResult;
}

const SearchContext = createContext<SearchContextType>({
  search: () => {},
  searchResults: { courses: [], blogs: [], instructors: [] },
});

export const useSearchContext = () => useContext(SearchContext);

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchResults, setSearchResults] = useState<SearchResult>({ courses: [], blogs: [], instructors: [] });
  const { courses } = useCourseContext();
  const { blogPosts } = useBlogContext();
  const { instructors } = useInstructorContext();

  const search = (query: string) => {
    if (!query.trim()) {
      setSearchResults({ courses: [], blogs: [], instructors: [] });
      return;
    }

    const lowercaseQuery = query.toLowerCase();

    // Search courses
    const filteredCourses = courses.filter(
      (course) =>
        course.title?.toLowerCase().includes(lowercaseQuery) ||
        course.description?.toLowerCase().includes(lowercaseQuery)
    );

    // Search blog posts
    const filteredBlogs = blogPosts.filter(
      (post) =>
        post.title?.toLowerCase().includes(lowercaseQuery) ||
        post.content?.toLowerCase().includes(lowercaseQuery)
    );

    // Search instructors
    const filteredInstructors = instructors.filter(
      (instructor) =>
        instructor.name?.toLowerCase().includes(lowercaseQuery) ||
        instructor.bio?.toLowerCase().includes(lowercaseQuery)
    );

    setSearchResults({
      courses: filteredCourses,
      blogs: filteredBlogs,
      instructors: filteredInstructors,
    });
  };

  return (
    <SearchContext.Provider value={{ search, searchResults }}>
      {children}
    </SearchContext.Provider>
  );
};