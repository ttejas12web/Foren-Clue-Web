import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Fingerprint, 
  Search, 
  Key, 
  ArrowRight, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Terminal, 
  CheckCircle, 
  BookOpen, 
  Award, 
  Activity,
  AlertCircle
} from 'lucide-react';

export default function Login() {
  const { user, signInWithGoogle, loading, adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  // Tabs for interactive Sign In vs Create Account
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Administrator access panel states
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);

  // Traditional Simulated inputs
  const [simulatedEmail, setSimulatedEmail] = useState('');
  const [simulatedPassword, setSimulatedPassword] = useState('');
  const [traditionalWarning, setTraditionalWarning] = useState('');

  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    if (!adminEmail || !adminPassword) {
      setAdminError('Please fill in all administrator access keys.');
      return;
    }
    const success = adminLogin(adminEmail, adminPassword);
    if (success) {
      navigate('/admin');
    } else {
      setAdminError('Access Denied. Cryptographic master key matches failed.');
    }
  };

  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTraditionalWarning(
      activeTab === 'signin'
        ? "Secure student profile databases are now linked uniquely via Google Single Sign-On (SSO). Please select 'Sign in with Google' below for secure authentication."
        : "Traditional signups are disabled in compliance with ISO security mandates. Please register instantly using your 'Sign in with Google' profile identity."
    );
  };

  return (
    <div className="min-h-screen bg-base py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center">
      {/* Dynamic scan line forensic grid background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #00f0ff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] bg-warning/5 rounded-full blur-[140px] pointer-events-none opacity-30" />
      <div className="absolute bottom-[15%] right-[5%] w-[35vw] h-[35vw] bg-warning/5 rounded-full blur-[110px] pointer-events-none opacity-20" />

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
        
        {/* Left Side: Interactive Branding Pane (Desktop Only / Left 5 Columns) */}
        <motion.div 
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 hidden lg:flex flex-col justify-between bg-surface/50 backdrop-blur border border-black/10 dark:border-white/5 rounded-3xl p-8 shadow-xl overflow-hidden relative"
        >
          {/* Neon side border line */}
          <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-gradient-to-b from-warning via-warning/30 to-transparent" />
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/30 flex items-center justify-center">
                <ShieldCheck className="text-warning" size={20} />
              </div>
              <span className="font-heading font-black text-lg tracking-wider text-text-main">
                FOREN<span className="text-warning">CLUE</span>
              </span>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-3xl font-heading font-black text-text-main leading-tight">
                SECURE ACCESS <span className="text-warning">STUDENT GATEWAY</span>
              </h2>
              <p className="text-text-muted text-xs leading-relaxed uppercase tracking-wider">
                Unlock instant access to criminalistic training vectors, high-fidelity laboratories, and expert feedback tools.
              </p>
            </div>

            <div className="space-y-2 pt-6">
              <span className="text-[10px] uppercase font-black tracking-widest text-warning block">Platform Capabilities</span>
              
              <div className="flex items-center gap-3 text-xs text-text-main">
                <CheckCircle size={14} className="text-success shrink-0" />
                <span>3D Ballistics & Forensic Tool Analyzer</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-main">
                <CheckCircle size={14} className="text-success shrink-0" />
                <span>Interactive Crime Scenes & Evidence Mapping</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-main">
                <CheckCircle size={14} className="text-success shrink-0" />
                <span>Curated E-Books & Dedicated Doubt Resolvers</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-main">
                <CheckCircle size={14} className="text-success shrink-0" />
                <span>ISO & UGC Compliant Mock Tests Portal</span>
              </div>
            </div>
          </div>

          {/* Bottom Diagnostics HUD mockup */}
          <div className="border-t border-black/10 dark:border-white/5 pt-6 mt-8 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
              <span>ESTABLISH ENCLAVE:</span>
              <span className="text-success font-bold">SUCCESSFUL</span>
            </div>
            
            <div className="bg-crust/50 border border-black/10 dark:border-white/5 rounded-lg p-3 font-mono text-[9px] text-text-muted space-y-1">
              <p className="text-warning font-semibold">⚡ DECRYPTOR_LOGS:</p>
              <p>&gt; IP_REVERSIBLE: 127.0.0.1</p>
              <p>&gt; SSL_SHA_KEY: ENCRYPTED_HTTPS_ACTIVE</p>
              <p>&gt; PROTOCOL_VER: V-2.4.0_PROD</p>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Enhanced Authentication Core (Right 7 Columns) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 bg-surface border border-black/15 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            {/* Tab switch mechanism: Sign In vs Sign Up */}
            <div className="flex border-b border-black/10 dark:border-white/5 mb-8">
              <button 
                onClick={() => {
                  setActiveTab('signin');
                  setTraditionalWarning('');
                }}
                className={`flex-1 pb-4 text-xs sm:text-sm font-heading font-black uppercase tracking-widest transition-all relative ${
                  activeTab === 'signin' ? 'text-warning' : 'text-text-muted/60 hover:text-text-main'
                }`}
              >
                Sign In
                {activeTab === 'signin' && (
                  <motion.div layoutId="authTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-warning" />
                )}
              </button>
              <button 
                onClick={() => {
                  setActiveTab('signup');
                  setTraditionalWarning('');
                }}
                className={`flex-1 pb-4 text-xs sm:text-sm font-heading font-black uppercase tracking-widest transition-all relative ${
                  activeTab === 'signup' ? 'text-warning' : 'text-text-muted/60 hover:text-text-main'
                }`}
              >
                Create Account
                {activeTab === 'signup' && (
                  <motion.div layoutId="authTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-warning" />
                )}
              </button>
            </div>

            {/* Standard Warning notice block */}
            <AnimatePresence mode="wait">
              {traditionalWarning && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-warning/10 border border-warning/30 text-warning px-4 py-3 rounded-lg text-xs flex items-start gap-2.5 mb-6 leading-relaxed"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider block mb-0.5">Secure SSO Override</span>
                    {traditionalWarning}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Simulated Traditional Credentials Form (to trigger SSO recommendations) */}
            <form onSubmit={handleSimulatedSubmit} className="space-y-4 mb-8">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted/50">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={simulatedEmail}
                    onChange={(e) => setSimulatedEmail(e.target.value)}
                    placeholder="enter your academic email"
                    className="w-full bg-base/50 text-text-main placeholder-text-muted/40 text-xs rounded-xl border border-black/15 dark:border-white/5 pl-10 pr-4 h-11 focus:outline-none focus:border-warning/50 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">
                  Password Key
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted/50">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    value={simulatedPassword}
                    onChange={(e) => setSimulatedPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-base/50 text-text-main placeholder-text-muted/40 text-xs rounded-xl border border-black/15 dark:border-white/5 pl-10 pr-4 h-11 focus:outline-none focus:border-warning/50 transition-all font-mono"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full h-11 bg-base border border-black/15 dark:border-white/10 text-text-muted/80 font-heading font-black text-xs uppercase tracking-widest rounded-xl hover:bg-black/10 dark:hover:bg-white/5 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                {activeTab === 'signin' ? 'Verify Credentials' : 'Access Registration'}
                <ArrowRight size={14} />
              </button>
            </form>

            {/* Split lines/Or */}
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/10 dark:border-white/5" />
              </div>
              <span className="px-3 bg-surface text-[10px] font-mono text-text-muted uppercase tracking-[0.25em] relative">
                Recommended Secure Gate
              </span>
            </div>

            {/* Primary Google Login Engine (The real active button) */}
            <div className="space-y-4">
              <motion.button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full h-14 bg-white text-base-dark hover:bg-warning/20 border border-black/10 dark:border-white/5 font-heading font-black text-xs sm:text-sm uppercase tracking-[0.18em] rounded-xl hover:text-text-main transition-all flex items-center justify-center gap-4 group shadow-xl shadow-black/10 dark:shadow-warning/5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-warning border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                    <span>
                      {activeTab === 'signin' ? 'Sign In with Google' : 'Register with Google'}
                    </span>
                    <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform text-warning" />
                  </>
                )}
              </motion.button>
              
              <div className="bg-base/40 p-4 rounded-xl border border-black/5 dark:border-white/5 text-center">
                <p className="text-[10px] sm:text-xs text-text-muted leading-relaxed">
                  🔐 One-click verification maps to Google Academic cloud. All forensic records, certifications, and mock histories automatically bind to your gmail account.
                </p>
              </div>
            </div>
          </div>

          {/* Admin Backdoor Access Toggle Area */}
          <div className="border-t border-black/10 dark:border-white/5 pt-6 mt-8">
            <div className="flex items-center justify-between">
              <button 
                type="button"
                onClick={() => setShowAdminLogin(!showAdminLogin)}
                className="inline-flex items-center gap-1.5 text-[10px] font-mono text-warning/70 hover:text-warning uppercase tracking-widest transition-all cursor-pointer"
              >
                <Terminal size={12} />
                <span>{showAdminLogin ? '[- Hide Server Backdoor]' : '[+ Deploy Terminal Login]'}</span>
              </button>
              
              <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider">
                System Status: <span className="text-success font-black animate-pulse">● SECURED</span>
              </span>
            </div>

            <AnimatePresence>
              {showAdminLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-4"
                >
                  <form onSubmit={handleAdminSubmit} className="bg-crust/80 border border-warning/10 rounded-xl p-4 space-y-4">
                    <div className="text-[10px] font-mono uppercase text-warning border-b border-warning/10 pb-2 mb-2 font-black flex items-center gap-1.5">
                      <Terminal size={12} className="animate-pulse" />
                      <span>ADMIN AUTHENTICATION SHELL - MASTER BYPASS</span>
                    </div>

                    {adminError && (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-2.5 rounded text-xs leading-relaxed font-mono">
                        ERR_DENIED: {adminError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8px] font-mono text-text-muted uppercase tracking-wider mb-1">
                          Administrator Email
                        </label>
                        <input
                          type="email"
                          required
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="e.g. forenclue@gmail.com"
                          className="w-full bg-base/60 text-text-main placeholder-text-muted/30 text-[11px] rounded-lg border border-white/5 px-3 py-2 focus:outline-none focus:border-warning/50 transition-all font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] font-mono text-text-muted uppercase tracking-wider mb-1">
                          Master Passkey
                        </label>
                        <div className="relative">
                          <input
                            type={showAdminPass ? "text" : "password"}
                            required
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="master secret key"
                            className="w-full bg-base/60 text-text-main placeholder-text-muted/30 text-[11px] rounded-lg border border-white/5 pl-3 pr-8 py-2 focus:outline-none focus:border-warning/50 transition-all font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAdminPass(!showAdminPass)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-warning"
                          >
                            {showAdminPass ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-warning text-crust font-mono font-black text-[10px] uppercase tracking-widest rounded hover:bg-warning/80 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>INITIALIZE OVERRIDE CONNECTION</span>
                      <ArrowRight size={10} />
                    </button>
                    
                    <p className="text-[8px] font-mono text-text-muted/60 text-center leading-normal uppercase">
                      Warning: Authorized Forenclue Team Personnel Only. Port logs audited 24/7.
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </motion.div>
      </div>

      {/* Embedded Terms alignment links */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-10">
        <p className="text-[10px] text-text-muted/60 uppercase tracking-widest">
          By signing in above, you agree to our{' '}
          <Link to="/terms" className="text-warning/70 hover:text-warning transition-colors underline">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-warning/70 hover:text-warning transition-colors underline">Privacy Policy</Link>.
        </p>
      </div>

    </div>
  );
}
