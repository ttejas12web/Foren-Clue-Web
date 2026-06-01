import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, Search, ShieldCheck, Activity } from 'lucide-react';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  purchasedCourses: number[];
  bookmarks: number[];
  lessonBookmarks?: Record<string, string[]>;
  achievementTags: string[];
  progress: Record<string, any>;
  quizScores?: Record<string, Record<string, number>>;
  doubtsCount?: number;
  commentsCount?: number;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  accessToken: string | null;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  adminLogin?: (email: string, password: string) => boolean;
}

export const adminEmails = ['ayushgaikwad7050@gmail.com', 'ayushgaikwad705o@gmail.com', 'mrunmayeebodhe118@gmail.com', 'webcreator500@gmail.com', 'forenclue@gmail.com'];

export const checkIsAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return adminEmails.some(e => e.trim().toLowerCase() === normalized) || normalized.includes('ayush') || normalized.includes('forenclue') || normalized.includes('webcreator');
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [manualAdmin, setManualAdmin] = useState<{ email: string; displayName: string } | null>(() => {
    try {
      const saved = sessionStorage.getItem('manualAdmin');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setUserProfile(null);
        setLoading(false);
      }
    }, (error) => {
      console.error("Auth change error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Profile Listener
  useEffect(() => {
    if (!user) return;

    let unsubscribeProfile: (() => void) | null = null;

    const initProfile = async () => {
      const userRef = doc(db, 'users', user.uid);
      
      try {
        let exists = true; // Assume exists by default to avoid overwriting if fetch fails
        try {
          // Try getting from cache/server first to ensure doc exists
          const userSnap = await getDoc(userRef);
          exists = userSnap.exists();
        } catch (e: any) {
          console.warn("Could not fetch initial profile, proceeding to listener:", e);
          exists = false; // Need to create doc if no cache
        }
          
        if (!exists) {
          try {
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Investigator',
              photoURL: user.photoURL || '',
              createdAt: serverTimestamp(),
              purchasedCourses: [],
              bookmarks: [],
              achievementTags: ['Forensic Novice'],
              progress: {},
              doubtsCount: 0,
              commentsCount: 0
            });
          } catch (e) {
            console.warn("Could not create user profile:", e);
          }
        }

        // Setup real-time listener
        unsubscribeProfile = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setUserProfile({
              ...data,
              purchasedCourses: data.purchasedCourses || []
            } as UserProfile);
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile sync error:", error);
          // Fallback to local profile if listener fails
          if (!userProfile) {
            setUserProfile({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              purchasedCourses: [],
              bookmarks: [],
              achievementTags: ['Forensic Novice'],
              progress: {},
              doubtsCount: 0,
              commentsCount: 0
            });
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Profile init error:", error);
        setLoading(false);
      }
    };

    initProfile();

    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [user]);

  // Safety Timeout for loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn("Auth initialization timed out. Forcing app to load.");
        setLoading(false);
      }
    }, 8000); // 8 seconds max for auth/profile init

    return () => clearTimeout(timer);
  }, [loading]);

  const effectiveUser = manualAdmin 
    ? { email: manualAdmin.email, uid: 'manual_admin', displayName: manualAdmin.displayName } as any 
    : user;

  const effectiveUserProfile = manualAdmin
    ? {
        uid: 'manual_admin',
        email: manualAdmin.email,
        displayName: manualAdmin.displayName,
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        purchasedCourses: [],
        bookmarks: [],
        achievementTags: ['Forenclue Administrator'],
        progress: {},
        doubtsCount: 0,
        commentsCount: 0
      } as UserProfile
    : userProfile;

  const isAdmin = checkIsAdmin(effectiveUser?.email);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log("Sign-in popup closed by user.");
        return;
      }
      console.error("Error signing in with Google: ", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert(
          `Firebase Error: Unauthorized Domain.\n\nPlease add this URL to your Authorized Domains in the Firebase Console:\n1. Go to Authentication -> Settings -> Authorized domains\n2. Add: ${window.location.hostname}`
        );
      }
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(result.user, {
        displayName: name
      });
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: name || 'Investigator',
        photoURL: '',
        createdAt: serverTimestamp(),
        purchasedCourses: [],
        bookmarks: [],
        achievementTags: ['Forensic Novice'],
        progress: {},
        doubtsCount: 0,
        commentsCount: 0
      });
    } catch (error) {
      console.error("Error signing up with email and password: ", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Error signing in with email and password: ", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (manualAdmin) {
        setManualAdmin(null);
        sessionStorage.removeItem('manualAdmin');
      } else {
        await signOut(auth);
        setAccessToken(null);
      }
    } catch (error) {
      console.error("Error signing out: ", error);
      throw error;
    }
  };

  const adminLogin = (email: string, password: string): boolean => {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === 'forenclue@gmail.com' && password === 'forenclue@2025') {
      const session = { email: 'forenclue@gmail.com', displayName: 'Forenclue Team Admin' };
      setManualAdmin(session);
      sessionStorage.setItem('manualAdmin', JSON.stringify(session));
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user: effectiveUser, userProfile: effectiveUserProfile, loading, isAdmin, accessToken, signInWithGoogle, signUpWithEmail, signInWithEmail, logout, adminLogin }}>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-crust flex flex-col items-center justify-center relative overflow-hidden"
          >
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #00f0ff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            
            <div className="relative w-40 h-40 md:w-64 md:h-64 flex items-center justify-center">
              {/* Spinning Hexagon Ring */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-[1px] border-warning/20 rounded-full"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border-[1px] border-warning/10 rounded-full"
              />

              {/* Forensic Icons Staggered */}
              <div className="relative">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ 
                    scale: [0.8, 1.1, 0.8],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-warning/10 p-4 md:p-6 rounded-2xl border border-warning/30 backdrop-blur-sm relative z-10"
                >
                  <Fingerprint size={32} className="text-warning md:hidden" />
                  <Fingerprint size={48} className="text-warning hidden md:block" />
                </motion.div>

                {/* Scanning Bar Animation */}
                <motion.div 
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-[-10%] right-[-10%] h-[2px] bg-warning shadow-[0_0_15px_#00f0ff] z-20 opacity-50"
                />
              </div>

              {/* Orbiting Elements */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    rotate: 360,
                  }}
                  transition={{ 
                    duration: 4 + i, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute inset-0 flex items-start justify-center"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1 md:w-1.5 h-1 md:h-1.5 bg-warning rounded-full shadow-[0_0_8px_#00f0ff]"
                  />
                </motion.div>
              ))}
            </div>

            <div className="mt-8 md:mt-12 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <Search size={18} className="text-warning animate-pulse md:size-5" />
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-text-main font-heading font-black text-xl md:text-2xl uppercase tracking-[0.3em]"
                >
                  Investigating<span className="animate-pulse">...</span>
                </motion.p>
              </div>
            </div>


          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
