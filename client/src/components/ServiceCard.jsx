import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ServiceCard({ id, name, image, cuisines, rating, reviewCount, description }) {
  const [imageSrc, setImageSrc] = useState(image || 'https://placehold.co/400x192/fef3c7/92400e?text=Caterer');

  useEffect(() => {
    setImageSrc(image || 'https://placehold.co/400x192/fef3c7/92400e?text=Caterer');
  }, [image]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      whileHover={{ scale: 1.04, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
      whileTap={{ scale: 0.98 }}
      className="group h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all"
    >
      <div className="overflow-hidden">
        <motion.img
          src={imageSrc}
          alt={name}
          className="w-full h-52 object-cover"
          onError={() => setImageSrc('https://placehold.co/400x192/fef3c7/92400e?text=Caterer')}
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-800 text-lg mb-2 truncate">{name}</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {cuisines.map((c) => (
            <span
              key={c}
              className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
            >
              {c}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mb-2">
          <Star
            size={16}
            className={rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-300'}
          />
          <span className="text-sm font-medium text-gray-700">
            {rating || 'No reviews yet'}
          </span>
          {reviewCount > 0 && (
            <span className="text-xs text-gray-400">({reviewCount})</span>
          )}
        </div>
        <p className="text-gray-500 text-sm mb-5 line-clamp-2 min-h-10">{description}</p>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Link
            to={`/service/${id}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition"
          >
            View Menus
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
