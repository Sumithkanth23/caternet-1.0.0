import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';

export default function ServiceCard({ id, name, image, cuisines, rating, reviewCount, description }) {
  return (
    <div className="group h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:border-blue-200 transition-all duration-300">
      <div className="overflow-hidden"><img src={image} alt={name} className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105" /></div>
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
            {rating ? rating : 'No reviews yet'}
          </span>
          {reviewCount > 0 && (
            <span className="text-xs text-gray-400">({reviewCount})</span>
          )}
        </div>
        <p className="text-gray-500 text-sm mb-5 line-clamp-2 min-h-10">{description}</p>
        <Link
          to={`/service/${id}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition"
        >
          View Menus
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
