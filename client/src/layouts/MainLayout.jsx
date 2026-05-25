import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import BottomNav from '../components/layout/BottomNav';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Sidebar />
      <div className="md:ml-64">
        <Navbar />
        <main className="p-4 sm:p-6 pb-24 md:pb-6 min-h-[calc(100vh-4rem)] animate-fade-in">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
