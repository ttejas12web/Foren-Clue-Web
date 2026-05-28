import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';

export default function BookPopup() {
  const [isOpen, setIsOpen] = useState(false);

  // Auto-trigger delay on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500); // 1.5 seconds delay after load
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Glassmorphic background overlay */}
          <motion.div
            id="book-popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-base/90 backdrop-blur-md"
          />

          {/* Minimalist Card */}
          <motion.div
            id="book-popup-modal"
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative w-full max-w-[340px] bg-surface/95 border border-warning/20 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.15)] p-6 text-center select-none"
          >
            {/* Top Close Icon Button (44px min touch target range with padding) */}
            <button
              aria-label="Close popup"
              onClick={handleClose}
              className="absolute top-2.5 right-2.5 p-2 rounded-full text-text-muted hover:text-text-main hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Coming Soon Highlight Tag on Upper Area */}
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-warning/10 border border-warning/30 rounded-full text-warning text-[9px] font-black uppercase tracking-[0.2em] mb-5">
              <Sparkles size={9} className="animate-pulse" />
              <span>Coming Soon</span>
            </div>

            {/* Book Cover Design */}
            <div className="relative mx-auto max-w-[150px] aspect-[3/4.2] rounded-xl overflow-hidden shadow-[0_12px_28px_rgba(0,0,0,0.5)] border border-white/10 mb-5 group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10" />
              <img 
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEive7NdnBis_kLLqaN2d8q37014tEMd2ftmqFkeCIiLjxkG2sDfip5VQldxh9izJC-KTsD4ZfXnILFWEOG2jmJkwdKww8-jqW-2jAqpTsv4AOE47MkqpHHibGcBN4GhPqN3OIF1xxIbs0KQLRgxfk2XJRsdlQyY_JqqRnajm2-pB1xoiZN4BnkdtDc9ICU/s1500/1779707899.png" 
                alt="Forensic Careers Blueprint Book" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Title / Description */}
            <h3 className="font-heading font-black text-sm uppercase tracking-tight text-text-main px-1">
              Forensic Careers Blueprint Book
            </h3>
            <p className="text-[11px] text-text-muted mt-1.5 max-w-[240px] mx-auto leading-relaxed">
              Careers, Scope & Paths Protocols. Official pre-orders open shortly.
            </p>

            {/* Single Close Option Button */}
            <button
              onClick={handleClose}
              className="mt-5 w-full py-2.5 bg-warning hover:bg-warning-dark text-crust font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
