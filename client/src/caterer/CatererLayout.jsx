import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import CatererSidebar from './components/CatererSidebar';
import CatererHeader from './components/CatererHeader';

export default function CatererLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex bg-gray-50">
      {mobileNavOpen && <button type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} className="fixed inset-0 z-40 bg-slate-900/35 md:hidden" />}
      <CatererSidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <CatererHeader />
        <button type="button" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)} className="fixed left-3 top-3 z-30 grid h-9 w-9 place-items-center rounded-lg bg-white text-blue-700 shadow-md md:hidden">
          {mobileNavOpen ? <X size={18} /> : <Menu size={20} />}
        </button>
        <main className="flex-1 p-4 pt-16 sm:p-6 md:pt-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
