import { districtImages } from './images';

/**
 * District-based catering services – dummy data
 */
export const districtServices = [
  {
    id: 'tambaram-classic',
    name: 'Tambaram Classic Caterers',
    cuisines: ['South Indian', 'North Indian'],
    rating: '4.7',
    description: 'Special catering, trusted and dedicated entirely to your needs.',
    image: districtImages[0] || 'https://placehold.co/400x192/d1fae5/065f46?text=Caterer',
  },
  {
    id: 'adyar-catering',
    name: 'Adyar Catering Services',
    cuisines: ['South Indian', 'North Indian'],
    rating: '4.8',
    description: 'Special catering, trusted and dedicated to celebration entirely.',
    image: districtImages[1] || 'https://placehold.co/400x192/d1fae5/065f46?text=Caterer',
  },
  {
    id: 'anna-nagar-elite',
    name: 'Anna Nagar Elite Caterers',
    cuisines: ['South Indian', 'North Indian', 'Chinese'],
    rating: '4.9',
    description: 'Offering your choice of catering with incomparable dedicated service.',
    image: districtImages[2] || 'https://placehold.co/400x192/d1fae5/065f46?text=Caterer',
  },
];
