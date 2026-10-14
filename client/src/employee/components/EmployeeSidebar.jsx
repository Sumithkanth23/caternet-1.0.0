import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useEmployeeProfile } from '../../context/EmployeeProfileContext';
import { apiFetch } from '../../lib/api';
import SidebarAvatarUpload from '../../shared/components/SidebarAvatarUpload';

const SIDEBAR_ITEMS = [
  { path: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employee/job-openings', label: 'Job Openings', icon: Briefcase },
  { path: '/employee/my-requests', label: 'My Requests', icon: FileText },
  { path: '/employee/profile', label: 'My Profile', icon: User },
];

export default function EmployeeSidebar() {
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
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className="w-64 min-h-screen bg-slate-800 text-white flex flex-col border-r border-slate-700"
    >
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <SidebarAvatarUpload
            imageUrl={profile?.profileImageUrl}
            displayName={displayName}
            onUpload={handleAvatarUpload}
            onSuccess={setProfile}
          />
          <span className="font-medium truncate">{displayName}</span>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                isActive ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`
            }
          >
            <item.icon size={20} className="shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
}
