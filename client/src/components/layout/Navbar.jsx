import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InstallAppButton from '../common/InstallAppButton';

const titles = {
  '/dashboard': 'Dashboard',
  '/customers': 'Customers',
  '/invoices': 'Invoice History',
  '/invoices/create': 'Create Invoice',
  '/profile': 'Profile'
};

export default function Navbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  
  const title = Object.entries(titles).find(([path]) => pathname.startsWith(path))?.[1] || 'Vishwa Construction';

  return (
    <header className="md:ml-64 sticky top-0 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        <div className="flex items-center gap-3">
          <img src="/logo.png?v=2" alt="logo" className="md:hidden w-11 h-11 rounded-lg object-contain bg-white p-0.5 border border-gray-100 dark:border-slate-700" />
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          
          <InstallAppButton className="mr-1 sm:mr-2" />

          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-gray-700 dark:text-slate-300 truncate max-w-32">
              {user?.contractorName}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400">{user?.companyName}</p>
          </div>
          {user?.logo ? (
            <img src={user.logo} alt="logo" className="w-11 h-11 rounded-lg object-contain border border-gray-100 dark:border-slate-600" />
          ) : (
            <img src="/logo.png?v=2" alt="logo" className="w-11 h-11 rounded-lg object-contain border border-gray-100 dark:border-slate-600 bg-white p-0.5" />
          )}
        </div>
      </div>
    </header>
  );
}
