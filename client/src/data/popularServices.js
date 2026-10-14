import { popularImages } from './images';

/**
 * Popular catering services – dummy data
 */
export const popularServices = [
  {
    id: 'sri-mahalakshmi',
    name: 'Sri Mahalakshmi Caterers',
    cuisines: ['South Indian', 'North Indian'],
    rating: '4.8',
    description: 'Specialists in traditional South Indian cuisine with a variety of authentic dishes.',
    image: popularImages[0] || 'https://placehold.co/400x192/fef3c7/92400e?text=Food',
  },
  {
    id: 'chettinad',
    name: 'Chettinad Catering Services',
    cuisines: ['South Indian', 'North Indian'],
    rating: '4.7',
    description: "Best known for Chettinad specialities with a variety of flavourful dishes.",
    image: popularImages[1] || 'https://placehold.co/400x192/fef3c7/92400e?text=Food',
  },
  {
    id: 'supreme',
    name: 'Supreme Caterers',
    cuisines: ['South Indian', 'North Indian', 'Chinese'],
    rating: '4.9',
    description: 'Offering a variety of cuisines and depths, including chicken and diverse platters.',
    image: popularImages[2] || 'https://placehold.co/400x192/fef3c7/92400e?text=Food',
  },
];
