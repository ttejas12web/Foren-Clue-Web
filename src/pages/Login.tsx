import { motion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ShieldCheck, Fingerprint, Search, Key, ArrowRight } from 'lucide-react';

export default function Login() {
  const { user, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background forensics patterns */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #00f0ff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-warning/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 opacity-30" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-warning/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 opacity-20" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface border border-black/10 dark:border-white/10 rounded-2xl p-8 shadow-2xl relative z-10 backdrop-blur-sm"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-warning/10 rounded-2xl border border-warning/30 flex items-center justify-center mb-6 relative group"
          >
            <ShieldCheck size={40} className="text-warning group-hover:scale-110 transition-transform" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-10px] border border-dashed border-warning/20 rounded-full"
            />
          </motion.div>
          
          <h1 className="text-3xl font-heading font-black text-text-main uppercase tracking-tight mb-2">
            Student <span className="text-warning">Portal</span>
          </h1>
          <p className="text-text-muted text-sm uppercase tracking-[0.2em] font-medium">Authentication Required</p>
        </div>

        <div className="space-y-6">
          <div className="bg-base/50 p-6 rounded-xl border border-black/10 dark:border-white/5 space-y-4">
             <div className="flex items-center gap-3 text-text-main/50">
               <Fingerprint size={18} className="text-warning/50" />
               <span className="text-xs font-bold uppercase tracking-widest">Biometric Identity Link</span>
             </div>
             <p className="text-xs text-text-muted leading-relaxed">
               Access high-fidelity forensic data, curated case studies, and advanced investigation modules.
             </p>
          </div>

          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-14 bg-white text-crust font-black uppercase tracking-[0.15em] rounded-xl hover:bg-warning transition-all flex items-center justify-center gap-4 group shadow-xl shadow-white/5 disabled:opacity-50"
          >
             {loading ? (
               <div className="w-6 h-6 border-2 border-crust border-t-transparent rounded-full animate-spin" />
             ) : (
               <>
                 <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                 Sign In with Google
                 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
               </>
             )}
          </button>

          <div className="pt-4 flex items-center justify-between opacity-50">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
               <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Servers Online</span>
             </div>
             <div className="flex items-center gap-2">
               <Search size={12} />
               <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">v2.4.0 Encrypted</span>
             </div>
          </div>
        </div>

        {/* Forensic Overlays */}
        <div className="absolute top-4 left-4 text-[8px] font-mono text-text-main/10 uppercase tracking-widest select-none">
          SYS_LOG_AUTH_READY
        </div>
        <div className="absolute bottom-4 right-4 text-[8px] font-mono text-text-main/10 uppercase tracking-widest select-none">
          SECURE_ENCLAVE_ACTIVE
        </div>
      </motion.div>

      {/* Decorative Evidence Markers */}
      <div className="hidden lg:block absolute top-[20%] left-[15%] opacity-20">
        <div className="bg-warning text-crust font-black p-2 text-xs mb-1">DATA_POINT</div>
        <div className="text-6xl font-black text-warning">01</div>
      </div>
      <div className="hidden lg:block absolute bottom-[20%] right-[15%] opacity-20">
        <div className="bg-warning text-crust font-black p-2 text-xs mb-1">DATA_POINT</div>
        <div className="text-6xl font-black text-warning">02</div>
      </div>
    </div>
  );
}
