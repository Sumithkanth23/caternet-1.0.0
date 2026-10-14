import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FoodItemCard({ name, description, image }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-orange-200 transition-colors"
    >
      <motion.div
        className="shrink-0 overflow-hidden rounded-lg w-24 h-24"
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-800">{name}</h4>
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
      </div>

      <motion.button
        type="button"
        whileHover={{ scale: 1.15, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        className="shrink-0 w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-sm"
        aria-label={`Add ${name}`}
      >
        <Plus size={20} />
      </motion.button>
    </motion.div>
  );
}
