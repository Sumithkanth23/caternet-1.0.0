import { Outlet } from 'react-router-dom';
import CatererSidebar from './components/CatererSidebar';
import CatererHeader from './components/CatererHeader';

export default function CatererLayout() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <CatererSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <CatererHeader />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
