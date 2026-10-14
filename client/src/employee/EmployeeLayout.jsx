import { Outlet } from 'react-router-dom';
import EmployeeSidebar from './components/EmployeeSidebar';
import EmployeeHeader from './components/EmployeeHeader';

export default function EmployeeLayout() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <EmployeeSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <EmployeeHeader />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
