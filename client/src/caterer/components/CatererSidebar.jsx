import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Plus,
  List,
  Users,
  Briefcase,
  UserCheck,
  CalendarCheck,
  History,
  User,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCatererProfile } from '../../context/CatererProfileContext';
import { toAbsoluteUrl, apiFetch } from '../../lib/api';
import SidebarAvatarUpload from '../../shared/components/SidebarAvatarUpload';

const SIDEBAR_ITEMS = [
  { path: '/caterer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    label: 'Menus',
    icon: UtensilsCrossed,
    children: [
      { path: '/caterer/menus/add', label: 'Add Menu', icon: Plus },
      { path: '/caterer/menus/manage', label: 'Manage Menu', icon: List },
    ],
  },
  {
    label: 'Workforce',
    icon: Users,
    children: [
      { path: '/caterer/workforce/post-job', label: 'Post Job', icon: Briefcase },
      { path: '/caterer/manage-jobs', label: 'Manage Jobs', icon: List },
      { path: '/caterer/workforce/employee-requests', label: 'Employee Request', icon: UserCheck },
      { path: '/caterer/workforce/booking-requests', label: 'Booking Request', icon: CalendarCheck },
      { path: '/caterer/history', label: 'History', icon: History },
    ],
  },
  { path: '/caterer/profile', label: 'My Profile', icon: User },
];

export default function CatererSidebar({ mobileOpen = false, onMobileClose }) {
  const [menusOpen, setMenusOpen] = useState(true);
  const [workforceOpen, setWorkforceOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuth();
  const { profile, setProfile } = useCatererProfile();
  const displayName = profile?.serviceName || user?.email?.split('@')[0] || 'Caterer';

  const handleAvatarUpload = async (file) => {
    const fd = new FormData();
    fd.append('serviceLogo', file);
    const updated = await apiFetch(`/api/caterer/profile/${profile._id}`, { method: 'PUT', body: fd });
    return updated;
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -64 }}
      animate={{ opacity: 1, x: 0, width: expanded || mobileOpen ? 256 : 76 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => { if (!mobileOpen) setExpanded(false); }}
      onFocusCapture={() => setExpanded(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false);
      }}
      className={`fixed inset-y-0 left-0 z-50 min-h-screen shrink-0 overflow-hidden bg-slate-800 text-white flex flex-col border-r border-slate-700 shadow-lg transition-transform duration-200 md:relative md:z-40 md:translate-x-0 md:shadow-sm ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      aria-label="Caterer navigation"
    >
      <div className={`border-b border-slate-700 transition-[padding] duration-200 ${expanded || mobileOpen ? 'p-4' : 'p-3'}`}>
        <div className={`flex items-center ${expanded || mobileOpen ? 'gap-3' : 'justify-center'}`}>
          <SidebarAvatarUpload
            imageUrl={profile?.logoUrl}
            displayName={displayName}
            onUpload={handleAvatarUpload}
            onSuccess={setProfile}
          />
          <span className={`whitespace-nowrap overflow-hidden font-medium transition-all duration-200 ${expanded || mobileOpen ? 'max-w-40 opacity-100' : 'max-w-0 opacity-0'}`}>
            {displayName}
          </span>
        </div>
      </div>
      <nav className={`flex-1 space-y-1 overflow-y-auto transition-[padding] duration-200 ${expanded || mobileOpen ? 'p-3' : 'p-2'}`}>
        {SIDEBAR_ITEMS.map((item) => {
          if (item.path) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                title={expanded || mobileOpen ? undefined : item.label}
                aria-label={item.label}
                className={({ isActive }) =>
                  `flex items-center py-2.5 rounded-lg transition ${expanded || mobileOpen ? 'gap-3 px-3' : 'justify-center px-2'} ${
                    isActive ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`
                }
              >
                <item.icon size={20} className="shrink-0" />
                <span className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${expanded || mobileOpen ? 'max-w-40 opacity-100' : 'max-w-0 opacity-0'}`}>
                  {item.label}
                </span>
              </NavLink>
            );
          }
          const isMenus = item.label === 'Menus';
          const isWorkforce = item.label === 'Workforce';
          const isOpen = isMenus ? menusOpen : workforceOpen;
          const setIsOpen = isMenus ? setMenusOpen : setWorkforceOpen;
          return (
            <div key={item.label}>
              <button
                type="button"
                onClick={() => setIsOpen((o) => !o)}
                title={expanded || mobileOpen ? undefined : item.label}
                aria-label={item.label}
                className={`flex items-center w-full py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition ${expanded || mobileOpen ? 'justify-between px-3' : 'justify-center px-2'}`}
              >
                <div className={`flex items-center ${expanded || mobileOpen ? 'gap-3' : ''}`}>
                  <item.icon size={20} className="shrink-0" />
                  <span className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${expanded || mobileOpen ? 'max-w-40 opacity-100' : 'max-w-0 opacity-0'}`}>
                    {item.label}
                  </span>
                </div>
                {(expanded || mobileOpen) && (isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />)}
              </button>
              <AnimatePresence initial={false}>
                {(expanded || mobileOpen) && isOpen && (
                  <motion.div
                    key="children"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="ml-4 mt-1 space-y-1 border-l border-slate-600 pl-2 overflow-hidden"
                  >
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onMobileClose}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2 py-2 rounded text-sm transition ${
                            isActive ? 'bg-orange-500 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                          }`
                        }
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                        <span>{child.label}</span>
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
    </motion.aside>
  );
}
