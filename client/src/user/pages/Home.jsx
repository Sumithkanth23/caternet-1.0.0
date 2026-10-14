import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import HeroSection from '../sections/HeroSection';
import PopularServices from '../sections/PopularServices';
import DistrictServices from '../sections/DistrictServices';
import Testimonials from '../sections/Testimonials';

export default function Home() {
  const [district, setDistrict] = useState('');
  const [date, setDate] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white"
    >
      <Navbar />
      <HeroSection
        district={district}
        setDistrict={setDistrict}
        date={date}
        setDate={setDate}
      />
      <PopularServices />
      <DistrictServices district={district} date={date} />
      <Testimonials />
      <Footer />
    </motion.div>
  );
}
