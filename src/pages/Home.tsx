import React from 'react';
import Hero from '../components/Hero/Hero';
import WhyUs from '../components/WhyUs/WhyUs';
import BlogTeaser from '../components/BlogTeaser/BlogTeaser';
import CTA from '../components/CTA/CTA';
import FeaturedCourses from '../components/FeaturedCourses/FeaturedCourses';
import Stats from '../components/Stats/Stats';
import FeaturedInstructors from '../components/Instructors/FeaturedInstructors';

const Home: React.FC = () => {
  return (
    <div>
      <Hero />
      <WhyUs />
      <FeaturedInstructors />
      <FeaturedCourses />
      <BlogTeaser />
      <Stats />
      <CTA />
    </div>
  );
};

export default Home;