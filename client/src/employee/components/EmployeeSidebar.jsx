import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, User, History } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useEmployeeProfile } from '../../context/EmployeeProfileContext';
import { apiFetch } from '../../lib/api';
import SidebarAvatarUpload from '../../shared/components/SidebarAvatarUpload';

const SIDEBAR_ITEMS = [
  { path: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employee/job-openings', label: 'Job Openings', icon: Briefcase },
  { path: '/employee/my-requests', label: 'My Requests', icon: FileText },
  { path: '/employee/history', label: 'History', icon: History },
  { path: '/employee/profile', label: 'My Profile', icon: User },
];

export default function EmployeeSidebar({ mobileOpen = false, onMobileClose }) {
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuth();
  const { profile, setProfile } = useEmployeeProfile();
  const displayName = profile?.fullName || user?.email?.split('@')[0] || 'Employee';

  const handleAvatarUpload = async (file) => {
    const fd = new FormData();
    fd.append('profileImage', file);
    const updated = await apiFetch(`/api/employee/profile/${profile._id}`, { method: 'PUT', body: fd });
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
      aria-label="Employee navigation"
    >
      <div className={`border-b border-slate-700 transition-[padding] duration-200 ${expanded || mobileOpen ? 'p-4' : 'p-3'}`}>
        <div className={`flex items-center ${expanded || mobileOpen ? 'gap-3' : 'justify-center'}`}>
          <SidebarAvatarUpload
            imageUrl={profile?.profileImageUrl}
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
        {SIDEBAR_ITEMS.map((item) => (
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
        ))}
      </nav>
    </motion.aside>
  );
}
