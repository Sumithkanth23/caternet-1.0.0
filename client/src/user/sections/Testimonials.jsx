import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { testimonials } from '../../data/testimonials';
import { revealUp, staggerContainer } from '../../lib/animations';

const cardVariant = (index) => ({
  initial: { opacity: 0, y: 40, x: index % 2 === 0 ? -24 : 24 },
  whileInView: {
    opacity: 1, y: 0, x: 0,
    transition: { type: 'spring', stiffness: 220, damping: 24, delay: index * 0.1 },
  },
  viewport: { once: true, amount: 0.2 },
});

export default function Testimonials() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <motion.h2
        {...revealUp}
        className="text-3xl font-bold text-gray-800 text-center mb-12"
      >
        Our Customer Review
      </motion.h2>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {testimonials.map((t, index) => (
          <motion.div
            key={t.name}
            {...cardVariant(index)}
            whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
            className="bg-white rounded-xl shadow-md p-6 text-center cursor-default"
          >
            <img
              src={t.image}
              alt={t.name}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
            />
            <h3 className="font-bold text-gray-800">{t.name}</h3>
            <p className="text-sm text-gray-500 mb-3">{t.role}</p>
            <p className="text-gray-600 text-sm mb-4">{t.text}</p>
            <div className="flex justify-center gap-0.5">
              {[...Array(5)].map((_, j) => (
                <Star key={j} size={16} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
