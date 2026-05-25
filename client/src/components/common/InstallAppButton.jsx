import { useState, useEffect } from 'react';
import Modal from './Modal';

export default function InstallAppButton({ className = "" }) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  useEffect(() => {
    // Check standalone mode on mount
    const checkStandalone = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           window.navigator.standalone || 
                           document.referrer.includes('android-app://');
      setIsInstalled(!!isStandalone);
    };

    checkStandalone();

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Show installation instruction modal for devices like iOS/Safari
      setShowInstallHelp(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (isInstalled) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex-shrink-0 ${className}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download App
      </button>

      {/* PWA Install Instructions Modal */}
      <Modal
        isOpen={showInstallHelp}
        onClose={() => setShowInstallHelp(false)}
        title="Install Vishwa Construction App"
      >
        <div className="space-y-4 text-sm text-gray-600 dark:text-slate-300 text-left">
          <p>Install this app on your device for quick access, desktop shortcuts, and offline usability.</p>
          
          <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl space-y-3">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Apple iOS:</span> For iPhone & iPad (Safari)
            </h4>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Tap the <strong>Share</strong> button (box with an up arrow) in Safari.</li>
              <li>Scroll down the options and select <strong>Add to Home Screen</strong>.</li>
              <li>Tap <strong>Add</strong> at the top right.</li>
            </ol>
          </div>

          <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl space-y-3">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Android OS:</span> Chrome or Firefox
            </h4>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Tap the browser <strong>three-dot menu</strong> next to the address bar.</li>
              <li>Select <strong>Add to Home Screen</strong> or <strong>Install App</strong>.</li>
              <li>Confirm the dialog prompt.</li>
            </ol>
          </div>

          <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl space-y-3">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Desktop computers:</span> Chrome & Edge
            </h4>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Click the <strong>Install</strong> button (monitor icon with a down arrow) at the right end of your URL address bar.</li>
              <li>Or open the browser menu and select <strong>Save and share</strong> → <strong>Install page</strong>.</li>
            </ol>
          </div>

          <button
            onClick={() => setShowInstallHelp(false)}
            className="btn-primary w-full py-2.5 mt-2"
          >
            Got it
          </button>
        </div>
      </Modal>
    </>
  );
}
