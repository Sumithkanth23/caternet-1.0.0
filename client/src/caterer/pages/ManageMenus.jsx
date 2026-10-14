import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatererProfile } from '../../context/CatererProfileContext';
import { apiFetch, toAbsoluteUrl } from '../../lib/api';
import { staggerContainer, staggerItem, revealUp } from '../../lib/animations';

export default function ManageMenus() {
  const navigate = useNavigate();
  const { profile } = useCatererProfile();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!profile?._id) { setLoading(false); return; }
    let mounted = true;
    setLoading(true);
    apiFetch(`/api/menu/caterer/${profile._id}`)
      .then((data) => { if (!mounted) return; setMenus(Array.isArray(data) ? data : []); })
      .catch(() => { if (!mounted) return; setMenus([]); })
      .finally(() => { if (!mounted) return; setLoading(false); });
    return () => { mounted = false; };
  }, [profile?._id]);

  const handleDelete = async (menuId) => {
    if (!confirm('Are you sure you want to delete this menu? This action cannot be undone.')) return;
    setDeleting(menuId);
    try {
      await apiFetch(`/api/menu/${menuId}`, { method: 'DELETE' });
      setMenus((prev) => prev.filter((m) => m._id !== menuId));
    } catch (err) {
      alert(err?.message || 'Failed to delete menu');
    } finally {
      setDeleting(null);
    }
  };

  const filteredMenus = menus.filter((menu) => {
    const q = search.toLowerCase();
    return (
      menu.packageName?.toLowerCase().includes(q) ||
      menu.description?.toLowerCase().includes(q) ||
      menu.menuType?.toLowerCase().includes(q)
    );
  });

  const menusByType = filteredMenus.reduce((acc, menu) => {
    const type = menu.menuType || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(menu);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Menus</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 h-32 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear', delay: i * 0.15 }}
                style={{ width: '60%' }}
              />
              <div className="p-4 space-y-3">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-56 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!profile?._id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Menus</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          Please create your service profile first.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        {...revealUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <h1 className="text-2xl font-bold text-gray-800">Manage Menus</h1>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Link
            to="/caterer/menus/add"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition"
          >
            <Plus size={20} />
            Add Menu
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menus..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
          />
        </div>
      </motion.div>

      {filteredMenus.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center"
        >
          <p className="text-gray-600 mb-4">
            {search ? 'No menus found matching your search.' : 'No menus yet. Create your first menu!'}
          </p>
          {!search && (
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="inline-block">
              <Link
                to="/caterer/menus/add"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition"
              >
                <Plus size={20} />
                Add Menu
              </Link>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >
          {Object.entries(menusByType).map(([type, typeMenus]) => (
            <motion.section key={type} variants={staggerItem}>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                {type} Menus ({typeMenus.length})
              </h2>
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid gap-4"
              >
                <AnimatePresence>
                  {typeMenus.map((menu) => (
                    <MenuCard
                      key={menu._id}
                      menu={menu}
                      onEdit={() => navigate(`/caterer/menus/edit/${menu._id}`)}
                      onDelete={() => handleDelete(menu._id)}
                      deleting={deleting === menu._id}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.section>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function MenuCard({ menu, onEdit, onDelete, deleting }) {
  const guestRange = menu.items?.length
    ? `${menu.items.length} item${menu.items.length > 1 ? 's' : ''}`
    : 'No items';

  return (
    <motion.div
      variants={staggerItem}
      exit={{ opacity: 0, x: 60, height: 0, marginBottom: 0, transition: { duration: 0.28 } }}
      whileHover={{ y: -3, boxShadow: '0 8px 28px rgba(0,0,0,0.09)' }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row"
    >
      <div className="sm:w-48 h-40 sm:h-auto bg-gray-200 shrink-0 overflow-hidden">
        {menu.menuImageUrl ? (
          <motion.img
            src={toAbsoluteUrl(menu.menuImageUrl)}
            alt={menu.packageName}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No Image
          </div>
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-1">{menu.packageName || 'Unnamed Menu'}</h3>
          <p className="text-sm text-gray-500 mb-1">{guestRange}</p>
          <div className="flex flex-wrap gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium">
              {menu.menuType || 'N/A'}
            </span>
            {(menu.cuisineTypes || []).slice(0, 3).map((c) => (
              <span key={c} className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium">{c}</span>
            ))}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{menu.description || 'No description provided.'}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            menu.menuType === 'Veg' ? 'bg-green-100 text-green-700' :
            menu.menuType === 'Non-Veg' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {menu.menuType || 'N/A'}
          </span>
          <motion.button
            type="button"
            onClick={onEdit}
            whileHover={{ scale: 1.12, backgroundColor: '#f3f4f6' }}
            whileTap={{ scale: 0.92 }}
            className="p-2 text-gray-500 rounded-lg transition"
            aria-label="Edit"
          >
            <Pencil size={18} />
          </motion.button>
          <motion.button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
            aria-label="Delete"
          >
            {deleting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                className="w-[18px] h-[18px] border-2 border-red-400 border-t-transparent rounded-full"
              />
            ) : (
              <Trash2 size={18} />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
