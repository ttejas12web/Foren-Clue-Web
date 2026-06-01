import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { X } from 'lucide-react';

export function GoogleOneTap() {
  const { user, signInWithGoogle, loading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(
    () => localStorage.getItem('forenclue_onetap_dismissed') === 'true'
  );

  useEffect(() => {
    // Only show if the user is NOT authenticated, not loading, and has not dismissed the prompt
    if (!user && !loading && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500); // 1.5 second delayed natural entrance
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [user, loading, isDismissed]);

  const handleClose = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('forenclue_onetap_dismissed', 'true');
  };

  const handleContinue = async () => {
    try {
      await signInWithGoogle();
      setIsVisible(false);
    } catch (err) {
      console.error("Google One-Tap sign-in failed:", err);
    }
  };

  // If already authenticated or loading is underway, don't show OneTap
  if (!isVisible || user) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="google-one-tap-prompt"
        initial={{ y: 100, x: 0, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 180 }}
        className="fixed bottom-0 left-0 right-0 z-[1000] p-4 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-[360px] sm:w-[360px] pointer-events-none"
      >
        <div className="bg-[#111214] border border-white/10 text-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.8)] p-4 relative pointer-events-auto overflow-hidden">
          {/* Top visual subtle scanning light effect */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />

          {/* Header Row */}
          <div className="flex items-start justify-between">
            {/* Google Brand Header */}
            <div className="flex items-center gap-3 pr-8">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.81-2.43-.81-4.14 0-6.66z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <h3 className="font-sans font-semibold text-sm tracking-tight text-white">
                  Sign in with Google
                </h3>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 absolute top-3 right-3"
              aria-label="Dismiss sign in prompt"
            >
              <X size={16} />
            </button>
          </div>

          {/* Middle branding title */}
          <div className="mt-4 text-[13px] text-left text-gray-200 antialiased font-normal leading-relaxed">
            Sign in to <span className="font-bold text-warning">ForenClue</span> with Google
          </div>

          {/* Bottom Call to Action */}
          <div className="mt-5">
            <button
              onClick={handleContinue}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-sans font-semibold text-xs rounded-full transition-all flex items-center justify-center shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Continue with Google"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
