import InstallAppButton from '../components/common/InstallAppButton';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <InstallAppButton />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white mb-4 shadow-xl p-2">
            <img src="/logo.png?v=2" alt="Vishwa Construction Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white">Vishwa Construction</h1>
          <p className="text-primary-200 mt-1 text-sm">Billing Management System</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 animate-slide-up">
          {children}
        </div>
        <p className="text-center text-primary-300 text-xs mt-6">
          © 2024 Vishwa Construction. All rights reserved.
        </p>
      </div>
    </div>
  );
}
