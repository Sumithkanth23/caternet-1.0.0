import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { CatererProfileProvider } from './context/CatererProfileContext';
import { EmployeeProfileProvider } from './context/EmployeeProfileContext';
import AuthGuard from './components/AuthGuard';
import CatererGuard from './caterer/CatererGuard';
import EmployeeGuard from './employee/EmployeeGuard';
import PageTransition from './components/PageTransition';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Public / user pages
import Home from './user/pages/Home';
import UserDashboard from './user/pages/Dashboard';
import ServiceDetails from './user/pages/ServiceDetails';
import SearchResults from './user/pages/SearchResults';
import MyBookings from './user/pages/MyBookings';

// Caterer pages
import CatererLayout from './caterer/CatererLayout';
import CreateProfile from './caterer/pages/CreateProfile';
import Dashboard from './caterer/pages/Dashboard';
import AddMenu from './caterer/pages/AddMenu';
import ManageMenus from './caterer/pages/ManageMenus';
import PostJob from './caterer/pages/PostJob';
import EmployeeRequests from './caterer/pages/EmployeeRequests';
import BookingRequests from './caterer/pages/BookingRequests';
import MyProfile from './caterer/pages/MyProfile';

// Employee pages
import EmployeeLayout from './employee/EmployeeLayout';
import EmployeeCreateProfile from './employee/pages/CreateProfile';
import EmployeeDashboard from './employee/pages/Dashboard';
import JobOpenings from './employee/pages/JobOpenings';
import MyRequests from './employee/pages/MyRequests';
import EmployeeMyProfile from './employee/pages/MyProfile';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Auth routes */}
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />

        {/* Public routes */}
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/service/:id" element={<PageTransition><ServiceDetails /></PageTransition>} />
        <Route path="/search" element={<PageTransition><SearchResults /></PageTransition>} />

        {/* User (customer) protected routes */}
        <Route
          path="/user/dashboard"
          element={
            <AuthGuard role="user">
              <PageTransition><UserDashboard /></PageTransition>
            </AuthGuard>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <AuthGuard role="user">
              <PageTransition><MyBookings /></PageTransition>
            </AuthGuard>
          }
        />

        {/* Caterer protected routes */}
        <Route
          path="/caterer/create-profile"
          element={
            <CatererGuard>
              <PageTransition><CreateProfile /></PageTransition>
            </CatererGuard>
          }
        />
        <Route
          path="/caterer"
          element={
            <CatererGuard>
              <CatererLayout />
            </CatererGuard>
          }
        >
          <Route index element={<Navigate to="/caterer/dashboard" replace />} />
          <Route path="dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="menus/add" element={<PageTransition><AddMenu /></PageTransition>} />
          <Route path="menus/edit/:id" element={<PageTransition><AddMenu /></PageTransition>} />
          <Route path="menus/manage" element={<PageTransition><ManageMenus /></PageTransition>} />
          <Route path="workforce/post-job" element={<PageTransition><PostJob /></PageTransition>} />
          <Route path="workforce/employee-requests" element={<PageTransition><EmployeeRequests /></PageTransition>} />
          <Route path="workforce/booking-requests" element={<PageTransition><BookingRequests /></PageTransition>} />
          <Route path="profile" element={<PageTransition><MyProfile /></PageTransition>} />
        </Route>

        {/* Employee protected routes */}
        <Route
          path="/employee/create-profile"
          element={
            <EmployeeGuard>
              <PageTransition><EmployeeCreateProfile /></PageTransition>
            </EmployeeGuard>
          }
        />
        <Route
          path="/employee"
          element={
            <EmployeeGuard>
              <EmployeeLayout />
            </EmployeeGuard>
          }
        >
          <Route index element={<Navigate to="/employee/dashboard" replace />} />
          <Route path="dashboard" element={<PageTransition><EmployeeDashboard /></PageTransition>} />
          <Route path="job-openings" element={<PageTransition><JobOpenings /></PageTransition>} />
          <Route path="my-requests" element={<PageTransition><MyRequests /></PageTransition>} />
          <Route path="profile" element={<PageTransition><EmployeeMyProfile /></PageTransition>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CatererProfileProvider>
          <EmployeeProfileProvider>
            <AnimatedRoutes />
          </EmployeeProfileProvider>
        </CatererProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
