export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin`}
        style={{ borderWidth: '3px' }} />
      {text && <p className="text-sm text-gray-500 dark:text-slate-400">{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}
