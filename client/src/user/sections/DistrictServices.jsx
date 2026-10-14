import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ServiceCard from '../components/ServiceCard';
import { apiFetch, toAbsoluteUrl } from '../../lib/api';
import { revealUp, staggerContainer, staggerItem } from '../../lib/animations';

export default function DistrictServices({ district, date }) {
  const [caterers, setCaterers] = useState([]);
  const [loading, setLoading] = useState(false);

  const query = useMemo(() => {
    const q = new URLSearchParams();
    q.set('limit', '6');
    if (district) q.set('district', district);
    if (date) q.set('date', date);
    return `/api/caterer/public?${q.toString()}`;
  }, [district, date]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiFetch(query)
      .then((data) => { if (!mounted) return; setCaterers(Array.isArray(data) ? data : []); })
      .catch(() => { if (!mounted) return; setCaterers([]); })
      .finally(() => { if (!mounted) return; setLoading(false); });
    return () => { mounted = false; };
  }, [query]);

  const subtitle = useMemo(() => {
    if (!district && !date) return 'Choose your district and event date above to see available caterers';
    const parts = [];
    if (district) parts.push(`in ${district}`);
    if (date) {
      const label = new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
      parts.push(`available on ${label}`);
    }
    return `Showing caterers ${parts.join(', ')}`;
  }, [district, date]);

  return (
    <section id="district-services" className="max-w-6xl mx-auto px-6 py-16">
      <motion.div {...revealUp} className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Based On Your District</h2>
        <p className="text-gray-500">{subtitle}</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-12"
          >
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        ) : caterers.length === 0 && (district || date) ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <p className="text-gray-500 text-lg">
              {date
                ? 'No caterers are available on this date in the selected district.'
                : 'No caterers found in this district.'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {caterers.map((c) => (
              <motion.div key={c._id} variants={staggerItem}>
                <ServiceCard
                  id={c._id}
                  name={c.serviceName}
                  image={toAbsoluteUrl(c.logoUrl) || 'https://placehold.co/400x192/d1fae5/065f46?text=Caterer'}
                  cuisines={c.cuisineTypes || []}
                  rating={c.rating > 0 ? c.rating.toFixed(1) : null}
                  reviewCount={c.reviewCount || 0}
                  description={c.description || `District: ${c.district}`}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
