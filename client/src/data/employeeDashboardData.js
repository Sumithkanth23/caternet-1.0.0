/**
 * Employee dashboard – dummy data (stats, upcoming work, pending requests)
 */
export const employeeDashboardStats = {
  jobsApplied: 3,
  pendingRequests: 2,
  acceptedJob: 1,
  upcomingWork: 1,
};

export const upcomingWork = [
  {
    id: 1,
    eventName: 'Wedding',
    date: 'Apr 19, 2024',
    location: 'Chennai',
  },
];

export const pendingRequests = [
  {
    id: 1,
    menuName: 'Wedding Classic Menu',
    date: 'Apr 20, 2024',
    mealType: 'Breakfast',
    catererName: 'Sri Mahalakshmi Caterers',
    roles: ['Cook', 'Cook'],
    status: 'Pending',
  },
  {
    id: 2,
    menuName: 'Silver Veg Menu',
    date: 'Apr 24, 2024',
    mealType: 'Reception',
    catererName: 'Chettinad Catering Services',
    roles: ['Cook', 'Cook'],
    status: 'Pending',
  },
];

/**
 * Job openings list (for Job Openings page)
 */
export const jobOpenings = [
  {
    id: 1,
    title: 'South Indian Tiffin',
    timePosted: '2 hrs ago',
    catererName: 'Sri Mahalakshmi Caterers',
    date: 'Apr 19, 2024',
    location: 'Chennai',
    capacity: '50-1500',
    price: '₹ 15,000',
    description: 'Preparing Traditional South Indian items like idly, dosa, vada, and chutney.',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=250&fit=crop',
  },
  {
    id: 2,
    title: 'Wedding Classic Menu',
    timePosted: '1 day ago',
    catererName: 'Sri Mahalakshmi Caterers',
    date: 'Apr 20, 2024',
    location: 'Chennai',
    capacity: '50-1500',
    price: '₹ 25,000',
    description: 'Requirements 2+ Years Experience. Familiarity with South Indian & North Indian Cuisine.',
    imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=250&fit=crop',
  },
  {
    id: 3,
    title: 'Silver Veg Menu',
    timePosted: '1 day ago',
    catererName: 'Chettinad Catering Services',
    date: 'Apr 24, 2024',
    location: 'Chennai',
    capacity: '100-2000',
    price: '₹ 30,000',
    description: 'Requirements 2+ Years Experience.',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=250&fit=crop',
  },
  {
    id: 4,
    title: 'Multi-Cuisine Wedding Buffet',
    timePosted: '2 days ago',
    catererName: 'Supreme Caterers',
    date: 'May 4, 2024',
    location: 'Chennai',
    capacity: '200-3000',
    price: '₹ 50,000',
    description: 'Requirements 3+ Years Experience. Multi-cuisine buffet preparation.',
    imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=250&fit=crop',
  },
];

/**
 * My Requests list (for My Requests page)
 */
export const myRequests = [
  {
    id: 1,
    catererName: 'Sri Mahalakshmi Caterers',
    eventType: 'Wedding Breakfast',
    date: 'Apr 20, 2024',
    role: 'Cook',
    description: 'Preparing Traditional South Indian items like idly, dosa, vada, chutney.',
    status: 'Pending',
  },
  {
    id: 2,
    catererName: 'Chettinad Catering Services',
    eventType: 'Reception',
    date: 'Apr 24, 2024',
    role: 'Cook',
    description: 'Requirements 2+ Years Experience. Familiarity with South Indian & North Indian Cuisine.',
    status: 'Accepted',
  },
  {
    id: 3,
    catererName: 'Supreme Caterers',
    eventType: 'Wedding Lunch',
    date: 'May 4, 2024',
    role: 'Cook',
    description: 'Requirements 2+ Years Experience',
    status: 'Declined',
  },
  {
    id: 4,
    catererName: 'Sri Mahalakshmi Caterers',
    eventType: 'Housewarming Dinner',
    date: 'Apr 26, 2024',
    role: 'Cook',
    description: 'Requirements 3+ Years Experience',
    status: 'Pending',
  },
];
