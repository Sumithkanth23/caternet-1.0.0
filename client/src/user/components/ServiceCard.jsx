import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';

export default function ServiceCard({ id, name, image, cuisines, rating, reviewCount, description }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      <img
        src={image}
        alt={name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg mb-2">{name}</h3>
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
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{description}</p>
        <Link
          to={`/service/${id}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition"
        >
          View Menus
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
