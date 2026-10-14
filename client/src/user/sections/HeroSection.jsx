import { MapPin, Calendar, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { TAMIL_NADU_DISTRICTS } from '../../data/districts';
import { heroImage, heroContent } from '../../data/hero';

const containerVariants = {
  animate: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
};

const headingVariant = {
  initial: { opacity: 0, y: -30 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

const subtitleVariant = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 240, damping: 24 } },
};

const searchBoxVariant = {
  initial: { opacity: 0, y: 32, scale: 0.97 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 24, delay: 0.3 },
  },
};

const filterItemVariant = {
  initial: { opacity: 0, x: -18 },
  animate: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 280, damping: 26 } },
};

const filterStagger = {
  animate: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export default function HeroSection({ district, setDistrict, date, setDate }) {
  const handleSearch = () => {
    const el = document.getElementById('district-services');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="relative min-h-[600px] bg-cover bg-center flex items-center justify-center px-4 py-16"
      style={{
        backgroundImage: heroImage
          ? `url(${heroImage})`
          : 'linear-gradient(135deg, #e0f2fe 0%, #fef3c7 100%)',
      }}
    >
      <div className="absolute inset-0 bg-black/30" aria-hidden />

      <motion.div
        className="relative z-10 text-center max-w-3xl mx-auto"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.h1
          variants={headingVariant}
          className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 pb-1 border-b-2 border-dashed border-gray-400 inline-block"
        >
          {heroContent.title}
        </motion.h1>

        <motion.p
          variants={subtitleVariant}
          className="text-lg text-gray-600 mb-8"
        >
          {heroContent.subtitle}
        </motion.p>

        <motion.div
          variants={searchBoxVariant}
          className="bg-white/95 p-4 rounded-xl shadow-lg"
        >
          <motion.div
            variants={filterStagger}
            initial="initial"
            animate="animate"
            className="flex flex-col md:flex-row items-center justify-center gap-4"
          >
            <motion.div
              variants={filterItemVariant}
              className="flex items-center border border-gray-300 rounded-lg px-4 py-2.5 w-full md:w-auto min-w-[200px] bg-white"
            >
              <MapPin size={20} className="text-gray-500 mr-2 shrink-0" />
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="outline-none w-full text-gray-700 bg-transparent"
              >
                <option value="">Select District</option>
                {TAMIL_NADU_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronDown size={20} className="text-gray-500 ml-2 shrink-0" />
            </motion.div>

            <motion.div
              variants={filterItemVariant}
              className="flex items-center border border-gray-300 rounded-lg px-4 py-2.5 w-full md:w-auto min-w-[200px] bg-white"
            >
              <Calendar size={20} className="text-gray-500 mr-2 shrink-0" />
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="outline-none w-full text-gray-700 bg-transparent"
              />
              <ChevronDown size={20} className="text-gray-500 ml-2 shrink-0 pointer-events-none" />
            </motion.div>

            <motion.button
              variants={filterItemVariant}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={handleSearch}
              className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow"
            >
              Search
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
