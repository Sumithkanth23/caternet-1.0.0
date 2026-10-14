/**
 * Caterer dashboard – dummy data (menus, bookings, requests)
 */
export const dashboardStats = {
  totalMenus: 5,
  totalBookings: 0,
  pendingRequests: 0,
  confirmedEvents: 0,
  employeesNeeded: 0,
};

export const recentBookings = [
  { id: 1, clientName: 'Hari Kumar', guests: 350, date: 'Apr 25, 2024', status: 'pending' },
  { id: 2, clientName: 'Suresh Raj', guests: 600, date: 'Tomorrow', status: 'confirmed' },
];

export const bookingSummary = {
  totalRevenueThisMonth: 0,
  payoutsPending: 0,
  revenueLastMonth: 0,
  averageGuestsPerEvent: 80,
};
