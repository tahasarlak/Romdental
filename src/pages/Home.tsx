import React from 'react';
import Hero from '../components/Hero/Hero';
import WhyUs from '../components/WhyUs/WhyUs';
import BlogTeaser from '../components/BlogTeaser/BlogTeaser';
import CTA from '../components/CTA/CTA';
import FeaturedCourses from '../components/FeaturedCourses/FeaturedCourses';
import Testimonials from '../components/Testimonials/Testimonials';
import Stats from '../components/Stats/Stats';
import Instructors from '../components/Instructors/Instructors';

const Home: React.FC = () => {
  return (
    <div>
      <Hero />
      <WhyUs />
      <Instructors />
      <FeaturedCourses />
      <Testimonials />
      <BlogTeaser />
      <Stats />
      <CTA />
    </div>
  );
};

export default Home;