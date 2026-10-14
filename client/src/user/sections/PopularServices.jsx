import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ServiceCard from '../components/ServiceCard';
import { apiFetch, toAbsoluteUrl } from '../../lib/api';
import { revealUp, staggerContainer, staggerItem } from '../../lib/animations';

export default function PopularServices() {
  const [caterers, setCaterers] = useState([]);

  useEffect(() => {
    let mounted = true;
    apiFetch('/api/caterer/public?limit=3&sortBy=popular')
      .then((data) => {
        if (!mounted) return;
        const rated = (Array.isArray(data) ? data : []).filter((c) => c.rating > 0);
        setCaterers(rated);
      })
      .catch(() => { if (!mounted) return; setCaterers([]); });
    return () => { mounted = false; };
  }, []);

  if (caterers.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <motion.div
        {...revealUp}
        className="text-center mb-10"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Popular Catering in Tamil Nadu
        </h2>
        <p className="text-gray-500">
          Highly rated catering services chosen by verified customers
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {caterers.map((c) => (
          <motion.div key={c._id} variants={staggerItem}>
            <ServiceCard
              id={c._id}
              name={c.serviceName}
              image={toAbsoluteUrl(c.logoUrl) || 'https://placehold.co/400x192/fef3c7/92400e?text=Caterer'}
              cuisines={c.cuisineTypes || []}
              rating={c.rating > 0 ? c.rating.toFixed(1) : null}
              reviewCount={c.reviewCount || 0}
              description={c.description || `District: ${c.district}`}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
