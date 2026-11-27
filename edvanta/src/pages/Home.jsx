import Footer from '../components/layout/Footer.jsx';
import Navbar from '../components/layout/Navbar.jsx';
import CallToAction from '../components/home/CallToAction.jsx';
import Categories from '../components/home/Categories.jsx';
import FeaturedCourses from '../components/home/FeaturedCourses.jsx';
import Hero from '../components/home/Hero.jsx';
import LearningPaths from '../components/home/LearningPaths.jsx';
import ProgressSection from '../components/home/ProgressSection.jsx';
import WhyEdvanta from '../components/home/WhyEdvanta.jsx';

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <FeaturedCourses />
        <Categories />
        <WhyEdvanta />
        <LearningPaths />
        <ProgressSection />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
