import { EvidenceMarker } from "@/components/ui/EvidenceMarker";
import { motion, AnimatePresence } from 'motion/react';
import { SEO } from "@/components/layout/SEO";
import { MicroscopeViewer } from "@/components/ui/ThreeDElement";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc, getDoc, arrayUnion, arrayRemove, serverTimestamp, updateDoc, collection, onSnapshot, increment, query, where, getDocs } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "@/lib/firestoreUtils";
import { db, auth } from "@/lib/firebase";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from "react";
import { Loader2, CheckCircle, X, BookOpen, User, Clock, ShieldCheck, ChevronRight, Bell, Lock, Unlock, CreditCard, Share2, Heart, Instagram, MessageCircle, Copy, Play, Map, TrendingUp, Search } from "lucide-react";
import { COURSES, Course } from "@/constants";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Courses() {
  const { user, userProfile, loading, signInWithGoogle } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [success, setSuccess] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState<Course | null>(null);
  const [isBookmarking, setIsBookmarking] = useState<number | null>(null);
  const [activeShareMenu, setActiveShareMenu] = useState<number | null>(null);
  const [courseStats, setCourseStats] = useState<Record<number, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'path'>('grid');
  const [selectedInstructor, setSelectedInstructor] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [localPurchased, setLocalPurchased] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [courseAnnouncements, setCourseAnnouncements] = useState<any[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);

  const [dbCourses, setDbCourses] = useState<Course[]>([]);
  
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'courses'), (snapshot) => {
      const list: Course[] = [];
      snapshot.forEach(docSnap => {
        list.push({ ...docSnap.data() } as Course);
      });
      setDbCourses(list);
    }, (error) => {
      console.warn("Could not load dynamic courses:", error);
    });
    return () => unsub();
  }, []);

  const allMergedCourses = useMemo(() => {
    const dict: Record<number, Course> = {};
    COURSES.forEach(c => {
      dict[c.id] = c;
    });
    dbCourses.forEach(c => {
      const parsedId = typeof c.id === 'string' ? parseInt(c.id, 10) : c.id;
      if (!isNaN(parsedId)) {
        dict[parsedId] = { ...c, id: parsedId };
      }
    });
    return Object.values(dict).sort((a, b) => {
      const timeA = (a as any).createdAt?.seconds || 0;
      const timeB = (b as any).createdAt?.seconds || 0;
      if (timeA === 0 && timeB === 0) {
        return a.id - b.id;
      }
      return timeB - timeA;
    });
  }, [dbCourses]);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(allMergedCourses.map(c => c.category)))];
  }, [allMergedCourses]);

  const featuredCourse = useMemo(() => {
    return allMergedCourses.find(c => c.price === 0) || allMergedCourses[0];
  }, [allMergedCourses]);

  const filteredCourses = useMemo(() => {
    return allMergedCourses.filter(course => {
      const matchesSearch = (course.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (course.instructor || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (course.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allMergedCourses, searchTerm, selectedCategory]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'courseStats'), (snapshot) => {
      const stats: Record<number, number> = {};
      snapshot.forEach(doc => {
        stats[parseInt(doc.id)] = doc.data().students || 0;
      });
      setCourseStats(stats);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'courseStats');
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const courseId = searchParams.get('id');
    if (courseId && userProfile) {
      const course = allMergedCourses.find(c => c.id === parseInt(courseId));
      if (course) {
        if (userProfile.purchasedCourses?.includes(course.id)) {
          navigate(`/player/${course.id}`);
        } else {
          setSelectedCourse(course);
        }
      }
    } else if (courseId && !loading && !user) {
      const course = allMergedCourses.find(c => c.id === parseInt(courseId));
      if (course) setSelectedCourse(course);
    }
  }, [searchParams, userProfile, loading, user, navigate, allMergedCourses]);

  useEffect(() => {
    if (selectedCourse) {
      const fetchStudents = async () => {
        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("purchasedCourses", "array-contains", selectedCourse.id));
          const querySnapshot = await getDocs(q);
          const students: any[] = [];
          querySnapshot.forEach((doc) => {
            students.push(doc.data());
          });
          setEnrolledStudents(students);
        } catch (error) {
          console.error("Error fetching enrolled students:", error);
        }
      };

      const q = query(collection(db, 'announcements'), where('courseId', '==', selectedCourse.id));
      const unsub = onSnapshot(q, (snapshot) => {
        const announcements: any[] = [];
        snapshot.forEach((doc) => {
          announcements.push({ id: doc.id, ...doc.data() });
        });
        setCourseAnnouncements(announcements.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
      });
      
      fetchStudents();
      return () => unsub();
    } else {
      setEnrolledStudents([]);
      setCourseAnnouncements([]);
    }
  }, [selectedCourse]);

  const handlePurchase = async (courseId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (purchasing !== null || success !== null) return;
    
    const course = allMergedCourses.find(c => c.id === courseId);
    if (!course) return;

    let activeUser = user;
    if (!activeUser) {
      try {
        await signInWithGoogle();
        activeUser = auth.currentUser;
        if (!activeUser) return;
      } catch (err: any) {
        console.error("Sign in error:", err);
        alert(`Sign in failed: ${err.message || String(err)}. Please try again.`);
        return;
      }
    }

    if (course.price === 0) {
      setPurchasing(courseId);
      try {
        const userRef = doc(db, 'users', activeUser.uid);
        
        // Safe check for user existence before setting or updating
        let userSnap = null;
        try {
          userSnap = await getDoc(userRef);
        } catch (snapErr) {
          console.warn("User profile fetch failed, attempting backup flow:", snapErr);
        }

        if (!userSnap || !userSnap.exists()) {
          // Document does not exist or fetch failed. Perform full creation.
          await setDoc(userRef, {
            uid: activeUser.uid,
            email: activeUser.email || '',
            displayName: activeUser.displayName || 'Investigator',
            photoURL: activeUser.photoURL || '',
            createdAt: serverTimestamp(),
            purchasedCourses: [courseId],
            bookmarks: [],
            achievementTags: ['Forensic Novice'],
            progress: {},
            doubtsCount: 0,
            commentsCount: 0,
            updatedAt: serverTimestamp()
          });
        } else {
          // Document exists. Safely append to existing document.
          const data = userSnap.data();
          const currentPurchased = data?.purchasedCourses || [];
          if (!currentPurchased.includes(courseId)) {
            await updateDoc(userRef, {
              purchasedCourses: arrayUnion(courseId),
              updatedAt: serverTimestamp()
            });
          }
        }

        try {
          await setDoc(doc(db, 'courseStats', courseId.toString()), {
            students: increment(1),
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (e) {
          console.error("Course stats update failed, ignoring", e);
        }

        setSuccess(courseId);
        setLocalPurchased(prev => [...prev, courseId]);
        setTimeout(() => {
          setSuccess(null);
          navigate(`/player/${courseId}?enrolled=true`);
        }, 1000);
      } catch (err: any) {
        console.error("Enrollment error full:", err, "Code:", err.code);
        handleFirestoreError(err, OperationType.WRITE, `users/${activeUser.uid}`);
        alert('An error occurred during enrollment. Please check your connection.');
      } finally {
        setPurchasing(null);
      }
      return;
    }

    // Trigger payment popup first
    setShowPaymentPopup(course);
  };

  const executePayment = async () => {
    if (!showPaymentPopup || !user) return;
    
    const courseId = showPaymentPopup.id;
    setPurchasing(courseId);
    
    try {
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: showPaymentPopup.price * 100 })
      });
      
      let orderData;
      const orderContentType = orderRes.headers.get("content-type");
      if (orderContentType && orderContentType.includes("application/json")) {
        orderData = await orderRes.json();
      } else {
        const errorText = await orderRes.text();
        throw new Error(errorText || "Could not reach payment server. Please try again later.");
      }
      
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create payment order");
      }
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.id,
        name: "ForenClue",
        description: `Enrollment: ${showPaymentPopup.title}`,
        handler: async (response: any) => {
          setPurchasing(courseId); // Keep loading state active during verification
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.uid,
                courseId: courseId
              })
            });
            
            let verifyData;
            const verifyContentType = verifyRes.headers.get("content-type");
            if (verifyContentType && verifyContentType.includes("application/json")) {
              verifyData = await verifyRes.json();
            } else {
              const verifyErrorText = await verifyRes.text();
              throw new Error(verifyErrorText || "Verification server returned an invalid response.");
            }
            
            if (verifyData.success) {
              try {
                const userRef = doc(db, 'users', user.uid);
                
                // Safe check for user existence before update/set
                let userSnap = null;
                try {
                  userSnap = await getDoc(userRef);
                } catch (snapErr) {
                  console.warn("User profile fetch failed after payment:", snapErr);
                }

                if (!userSnap || !userSnap.exists()) {
                  await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email || '',
                    displayName: user.displayName || 'Investigator',
                    photoURL: user.photoURL || '',
                    createdAt: serverTimestamp(),
                    purchasedCourses: [courseId],
                    bookmarks: [],
                    achievementTags: ['Forensic Novice'],
                    progress: {},
                    doubtsCount: 0,
                    commentsCount: 0,
                    updatedAt: serverTimestamp()
                  });
                } else {
                  const data = userSnap.data();
                  const currentPurchased = data?.purchasedCourses || [];
                  if (!currentPurchased.includes(courseId)) {
                    await updateDoc(userRef, {
                      purchasedCourses: arrayUnion(courseId),
                      updatedAt: serverTimestamp()
                    });
                  }
                }
        
                try {
                  await setDoc(doc(db, 'courseStats', courseId.toString()), {
                    students: increment(1),
                    updatedAt: serverTimestamp()
                  }, { merge: true });
                } catch (e) {
                  console.error("Course stats update failed, ignoring", e);
                }
              } catch (dbErr: any) {
                console.error("Failed to unlock course in DB after payment", dbErr);
                // We still show success since payment went through, but log error
              }
              // Successfully verified and unlocked
              setSuccess(courseId);
              setLocalPurchased(prev => [...prev, courseId]);
              setShowPaymentPopup(null);
              setTimeout(() => {
                setSuccess(null);
                navigate(`/player/${courseId}?enrolled=true`);
              }, 2000);
            } else {
              alert(`Payment verification failed: ${verifyData.error || 'Unknown error'}`);
            }
          } catch (err: any) {
            console.error("Verification error:", err);
            alert("An error occurred while verifying your payment. Please contact support if the amount was deducted.");
          } finally {
            setPurchasing(null);
          }
        },
        prefill: {
          name: user.displayName,
          email: user.email,
        },
        theme: { color: "#F0E68C" },
        modal: {
          ondismiss: function() {
            setPurchasing(null);
          }
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        alert(`Payment failed: ${response.error.description}`);
        setPurchasing(null);
      });
      rzp.open();
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      setPurchasing(null);
      alert(error.message || "Failed to start payment process. Please try again.");
    }
  };

  const isPurchased = (courseId: number) => {
    return userProfile?.purchasedCourses?.includes(courseId) || localPurchased.includes(courseId);
  };

  const getCourseProgress = (courseId: number) => {
    if (!userProfile?.progress?.courses?.[courseId]) return 0;
    const completed = userProfile.progress.courses[courseId].completedLessons?.length || 0;
    // For simplicity, assume average of 10 lessons per course if not detailed
    const course = allMergedCourses.find(c => c.id === courseId);
    if (!course) return 0;
    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    return Math.min(Math.round((completed / totalLessons) * 100), 100);
  };

  const toggleWishlist = async (courseId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      await signInWithGoogle();
      return;
    }

    setIsBookmarking(courseId);
    const path = `users/${user.uid}`;
    try {
      const userRef = doc(db, 'users', user.uid);
      const isCurrentlyWishlisted = userProfile?.progress?.wishlist?.includes(courseId);
      
      await updateDoc(userRef, {
        ["progress.wishlist"]: isCurrentlyWishlisted 
          ? arrayRemove(courseId) 
          : arrayUnion(courseId),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsBookmarking(null);
    }
  };

  const isWishlisted = (courseId: number) => {
    return userProfile?.progress?.wishlist?.includes(courseId);
  };

  const handleSocialShare = (course: Course, platform: 'instagram' | 'whatsapp' | 'copy', e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/courses?id=${course.id}`;
    const text = `Join the investigation: ${course.title} at Forensic Insights Lab!`;
    
    if (platform === 'instagram') {
      navigator.clipboard.writeText(url);
      alert("Investigation link copied! Open Instagram to paste and share.");
      window.open(`https://www.instagram.com/`, '_blank');
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    } else {
      navigator.clipboard.writeText(url);
      alert("Investigation link copied to clipboard.");
    }
    setActiveShareMenu(null);
  };

  return (
    <div className="py-20 px-4 max-w-7xl mx-auto">
      <SEO 
        title="Professional Forensic Science & Investigation Courses"
        description="Browse professional forensic science training courses. Master questioning protocols, DNA fingerprinting, cybercrime analysis, and trace evidence logging."
        keywords="forensic courses online, forensic certificates, learn forensics, crime scene investigation training, fingerprint lifting course"
        canonicalPath="/courses"
      />
      {/* Title Header with View Mode Segmented Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8 border-b border-black/10 dark:border-white/5 pb-8">
        <div className="text-left w-full md:w-auto">
          <h1 className="text-4xl md:text-6xl font-heading font-black mb-3 uppercase tracking-tight relative z-10">
            Explore <span className="text-warning">Courses</span>
          </h1>
          <p className="text-base md:text-lg text-text-muted relative z-10">Explore Our MOst Structured Forensic And Skills Courses</p>
        </div>

        {/* View Mode Segmented Control */}
        <div className="flex bg-base p-1 rounded-xl border border-black/10 dark:border-white/5 relative z-10 shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-warning text-crust font-black' : 'text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            Grid Shell
          </button>
          <button
            onClick={() => setViewMode('path')}
            className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${viewMode === 'path' ? 'bg-warning text-crust font-black' : 'text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            Investigation Roadmap
          </button>
        </div>
      </div>





      {searchTerm && (
        <div className="mb-6 relative z-10">
          <p className="text-xs text-text-muted">
            Found <span className="text-warning font-bold">{filteredCourses.length}</span> active record{filteredCourses.length !== 1 ? 's' : ''} matching "<span className="text-text-main">{searchTerm}</span>"
          </p>
        </div>
      )}

      {viewMode === 'grid' ? (
        <>
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
              {filteredCourses.map((course, idx) => {
                const isComingSoon = course.price > 0;
                return (
                  <motion.div 
                    key={`course-grid-${course.id}-${idx}`} 
                    whileHover={{ y: -4, scale: 1.01 }}
                    onClick={() => setSelectedCourse(course)}
                    className={`bg-surface border border-black/10 dark:border-white/5 overflow-hidden group hover:border-black/20 dark:hover:border-white/10 transition-colors flex flex-col shadow-sm rounded-xl cursor-pointer ${isComingSoon ? 'opacity-90 hover:opacity-100' : ''}`}
                  >
                    <div className="h-48 relative overflow-hidden bg-black/5 dark:bg-white/5">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isComingSoon ? 'filter saturate-75 contrast-95 group-hover:saturate-100 group-hover:contrast-100' : ''}`} 
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Left Status Badge Overlay */}
                      <div className="absolute top-3 left-3 z-10 flex gap-2">
                        {isComingSoon ? (
                          <span className="bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg border border-amber-400">
                            Coming Soon
                          </span>
                        ) : (
                          <span className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg border border-emerald-400 flex items-center gap-1.5 animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-white inline-block"></span>
                            Running
                          </span>
                        )}
                      </div>

                      <div className="absolute top-3 right-3 flex gap-2 z-10">
                        <button 
                          onClick={(e) => toggleWishlist(course.id, e)}
                          className="p-2 bg-base/80 backdrop-blur-md rounded-full shadow-sm text-text-muted hover:text-warning transition-colors"
                        >
                          <Heart size={16} fill={isWishlisted(course.id) ? "currentColor" : "none"} className={isWishlisted(course.id) ? "text-warning" : ""} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-grow flex flex-col bg-surface">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-warning">{course.category} • {course.level}</span>
                        <span className="text-xs text-text-muted flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
                      </div>
                      
                      <h3 className="font-heading font-bold text-lg mb-2 leading-tight text-text-main line-clamp-1 group-hover:text-warning transition-colors">{course.title}</h3>
                      <p className="text-sm text-text-muted mb-4 line-clamp-2">{course.description}</p>
                      
                      <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={course.instructorImage} alt={course.instructor} className="w-6 h-6 rounded-full object-cover" />
                          <span className="text-xs text-text-muted font-medium">{course.instructor}</span>
                        </div>
                        <div className="font-bold">
                          {isComingSoon ? (
                            <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">Coming Soon</span>
                          ) : (
                            <span className="text-success text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">Running • Free</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center relative z-10 bg-surface/50 border border-black/10 dark:border-white/10 rounded-2xl border-dashed w-full max-w-4xl mx-auto animate-fade-in">
              <BookOpen size={48} className="text-text-muted mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-heading font-black mb-2 uppercase tracking-widest">No Investigations Found</h3>
              <p className="text-text-muted mb-6 px-12">Your search parameters did not match any active cases in the lab. Please try adjusting your search terms or expanding your category selection.</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                className="px-8 py-3 bg-warning text-crust font-black uppercase tracking-widest rounded-md hover:bg-warning/90 transition-all flex items-center gap-2 mx-auto cursor-pointer"
              >
                <CheckCircle size={18} /> Reset All Parameters
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="relative z-10 py-12 flex flex-col items-center">
          <div className="w-full max-w-4xl relative pb-20">
            {/* Connecting Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-black/10 dark:bg-white/10 md:-translate-x-1/2 rounded-full hidden md:block"></div>
            
            {['Beginner', 'Intermediate', 'Advanced'].map((level, levelIdx) => (
              <div key={level} className="mb-20 relative w-full">
                <div className="flex items-center gap-4 mb-8 md:justify-center relative z-20 bg-base py-4">
                  <div className="h-px flex-1 bg-black/10 dark:bg-white/10 md:hidden"></div>
                  <h2 className="text-2xl font-heading font-black uppercase tracking-widest text-warning px-4 py-2 border border-warning/30 rounded-full bg-warning/5 drop-shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                    {level} Phase
                  </h2>
                  <div className="h-px flex-1 bg-black/10 dark:bg-white/10 md:hidden"></div>
                </div>
                
                <div className="space-y-6 md:space-y-0 relative">
                  {allMergedCourses.filter(c => c.level === level).map((course, idx) => {
                    const isComingSoon = course.price > 0;
                    return (
                      <div key={`course-list-${course.id}-${idx}`} className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''} mb-8`}>
                        <div className="w-full md:w-1/2 flex justify-center">
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setSelectedCourse(course)}
                            className={`w-full max-w-sm bg-surface border border-black/10 dark:border-white/5 rounded-xl overflow-hidden cursor-pointer shadow-xl hover:border-warning/30 transition-colors group relative ${isComingSoon ? 'opacity-95' : ''}`}
                          >
                            <div className="h-40 relative">
                              <img src={course.thumbnail} alt={course.title} className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${isComingSoon ? 'filter grayscale saturate-50' : ''}`} />
                              <div className="absolute inset-0 bg-base/40 group-hover:bg-warning/10 transition-colors"></div>
                              
                              {/* Overlay badges */}
                              <div className="absolute top-4 left-4 z-10 flex gap-2">
                                {isComingSoon ? (
                                  <span className="bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded shadow-lg border border-amber-400">
                                    Coming Soon
                                  </span>
                                ) : (
                                  <span className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded shadow-lg border border-emerald-400 animate-pulse">
                                    Running
                                  </span>
                                )}
                              </div>

                              <div className="absolute top-4 right-4 bg-warning text-crust text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg">
                                Step {course.id}
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setPreviewVideo(course.modules[0]?.lessons[0]?.videoUrl); }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-warning/80 backdrop-blur-sm flex items-center justify-center text-crust opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-[0_0_20px_rgba(0,240,255,0.5)]"
                              >
                                <Play size={20} fill="currentColor" />
                              </button>
                            </div>
                            <div className="p-4">
                              <h3 className="font-heading font-bold text-lg group-hover:text-warning transition-colors mb-2 line-clamp-1">{course.title}</h3>
                              <div className="flex items-center justify-between text-xs text-text-muted">
                                <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
                                <span className="font-bold">
                                  {isComingSoon ? (
                                    <span className="text-amber-500 uppercase tracking-widest text-[9px] font-black bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Coming Soon</span>
                                  ) : (
                                    <span className="text-success uppercase tracking-widest text-[9px] font-black bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Running</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                        
                        {/* Node connection point (desktop only) */}
                        <div className="hidden md:flex w-12 h-12 rounded-full bg-surface border-4 border-base items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.2)] z-10 mx-auto relative shrink-0">
                           {isPurchased(course.id) ? (
                             <CheckCircle size={20} className="text-success" />
                           ) : isComingSoon ? (
                             <Lock size={18} className="text-amber-500/50" />
                           ) : (
                             <Lock size={20} className="text-text-muted" />
                           )}
                           {idx < allMergedCourses.filter(c => c.level === level).length - 1 && (
                             <div className="absolute top-full w-1 h-12 bg-black/10 dark:bg-white/10"></div>
                           )}
                        </div>
                        
                        <div className="hidden md:block w-full md:w-1/2"></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showPaymentPopup && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => !purchasing && setShowPaymentPopup(null)}
               className="absolute inset-0 bg-base/95 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface border border-black/10 dark:border-white/10 w-full max-w-md relative z-10 shadow-2xl rounded-2xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-warning/20">
                 <CreditCard size={32} className="text-warning" />
              </div>
              
              <h2 className="text-2xl font-heading font-black text-text-main uppercase tracking-tight mb-2">
                 Payment Required
              </h2>
              <p className="text-text-muted text-sm leading-relaxed mb-8">
                To access <span className="text-text-main font-bold">{showPaymentPopup.title}</span> and unlock all investigative modules, please complete the payment process.
              </p>

              <div className="bg-base rounded-xl p-6 mb-8 border border-black/10 dark:border-white/5">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Item Cost</span>
                    <span className="text-sm font-bold text-text-main">{showPaymentPopup.price} INR</span>
                 </div>
                 <div className="flex justify-between items-center text-warning pt-4 border-t border-black/10 dark:border-white/5">
                    <span className="text-xs font-black uppercase tracking-widest">Total Payable</span>
                    <span className="text-xl font-heading font-black">{showPaymentPopup.price} INR</span>
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                 <button 
                  onClick={executePayment}
                  disabled={purchasing === showPaymentPopup.id}
                  className="w-full py-4 bg-warning text-crust font-black uppercase tracking-[0.2em] rounded-xl hover:bg-warning/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {purchasing === showPaymentPopup.id ? (
                    <><Loader2 size={20} className="animate-spin" /> Verifying Transaction...</>
                  ) : (
                    <>Make Payment Now</>
                  )}
                </button>
                
                <button 
                  onClick={() => setShowPaymentPopup(null)}
                  disabled={!!purchasing}
                  className="w-full py-4 text-text-muted font-black uppercase tracking-[0.2em] rounded-xl hover:text-text-main transition-colors text-[10px]"
                >
                  Cancel and Return
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-[9px] font-black text-text-muted uppercase tracking-widest">
                 <ShieldCheck size={12} className="text-success" />
                 Secure payment gateway encryption active
              </div>
            </motion.div>
          </div>
        )}

        {selectedCourse && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedCourse(null)}
               className="absolute inset-0 bg-crust/90 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface border border-black/10 dark:border-white/10 w-full max-w-5xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl rounded-lg"
            >
              <button 
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 p-2 bg-base hover:bg-black/5 dark:bg-white/10 rounded-full text-text-muted hover:text-text-main transition-colors z-20"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col lg:flex-row">
                {/* Course Header/Hero in Modal */}
                <div className="lg:w-1/3 bg-base p-8 border-r border-black/10 dark:border-white/5 relative overflow-hidden flex flex-col">
                  {/* Subtle Background Thumbnail */}
                  <img 
                    src={selectedCourse.thumbnail} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none grayscale"
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="relative z-10 flex-grow">
                    <EvidenceMarker number={selectedCourse.id < 10 ? `0${selectedCourse.id}` : selectedCourse.id} className="mb-6" />
                    <h2 className="text-3xl font-heading font-black text-text-main mb-4 uppercase leading-tight tracking-tight">
                      {selectedCourse.title}
                    </h2>
                    <div className="flex flex-wrap gap-4 mb-6">
                      <div className="flex items-center gap-2 text-warning">
                        <Clock size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">{selectedCourse.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-warning">
                        <ShieldCheck size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">{selectedCourse.level}</span>
                      </div>
                      <div className="flex items-center gap-2 text-warning/80">
                        <User size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">{enrolledStudents.length} Enrolled</span>
                      </div>
                    </div>
                    <p className="text-text-muted text-sm leading-relaxed mb-8">
                      {selectedCourse.description}
                    </p>
                  </div>

                  <div 
                    onClick={() => setSelectedInstructor(selectedCourse.instructor)}
                    className="p-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg relative z-10 cursor-pointer group hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <img src={selectedCourse.instructorImage} alt={selectedCourse.instructor} className="w-12 h-12 rounded-full object-cover border border-warning/30 group-hover:scale-105 transition-transform" />
                      <div>
                        <h4 className="text-sm font-bold text-text-main uppercase tracking-wider group-hover:text-warning transition-colors">{selectedCourse.instructor}</h4>
                        <p className="text-[10px] text-warning font-black uppercase tracking-widest">Lead Instructor</p>
                      </div>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {selectedCourse.instructorBio}
                    </p>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-black/5 dark:bg-white/5 rounded border border-black/10 dark:border-white/5 text-center">
                       <ShieldCheck size={20} className="text-warning mx-auto mb-2" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-text-main">Verified Content</p>
                    </div>
                    <div className="p-3 bg-black/5 dark:bg-white/5 rounded border border-black/10 dark:border-white/5 text-center">
                       <TrendingUp size={20} className="text-warning mx-auto mb-2" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-text-main">Career Support</p>
                    </div>
                  </div>
                </div>

                {/* Course Curriculum, Notices & Action */}
                <div className="lg:w-2/3 p-8 flex flex-col">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {/* Curriculum Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-6">
                        <BookOpen size={20} className="text-warning" />
                        <h3 className="text-xl font-heading font-black uppercase tracking-wide">Curriculum</h3>
                      </div>

                      <div className="space-y-4">
                        {selectedCourse.curriculum.map((topic, index) => (
                          <div key={index} className="flex items-start gap-4 p-4 bg-black/5 dark:bg-white/2 rounded-md border border-black/10 dark:border-white/5 group hover:border-warning/20 transition-colors">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center text-[10px] font-black text-warning">
                              {index + 1}
                            </span>
                            <p className="text-sm text-text-muted group-hover:text-text-main transition-colors">{topic}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notice Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-6">
                        <Bell size={20} className="text-warning" />
                        <h3 className="text-xl font-heading font-black uppercase tracking-wide">Announcements</h3>
                      </div>

                      <div className="space-y-4">
                        {courseAnnouncements.length > 0 ? (
                          courseAnnouncements.map((notice) => (
                            <div key={notice.id} className="p-4 bg-warning/5 rounded-md border border-warning/20 relative overflow-hidden group">
                              <div className="absolute top-0 left-0 w-1 h-full bg-warning opacity-50" />
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black text-warning uppercase tracking-widest bg-warning/10 px-2 py-0.5 rounded">Update</span>
                                {notice.createdAt && (
                                  <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest">
                                    {new Date(notice.createdAt.seconds * 1000).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-text-muted group-hover:text-text-main transition-colors leading-relaxed">
                                {notice.content}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 border border-black/10 dark:border-white/5 border-dashed rounded-md flex flex-col items-center justify-center text-center">
                            <ShieldCheck size={32} className="text-text-main/10 mb-2" />
                            <p className="text-xs text-text-muted italic">No new investigation updates at this time.</p>
                          </div>
                        )}
                        
                        <div className="p-4 bg-base/50 border border-black/10 dark:border-white/5 rounded-md border-dashed">
                          <p className="text-[10px] text-text-muted italic leading-relaxed">
                            <span className="text-warning font-bold uppercase tracking-widest mr-1">Note:</span> Real-time forensic updates are pushed directly to this console for all enrolled investigators.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface/80 backdrop-blur-sm pt-6 border-t border-black/10 dark:border-white/5 mt-auto">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">Pricing Status</p>
                         {selectedCourse.price === 0 ? (
                           <div className="flex flex-col">
                             <span className="text-3xl font-heading font-black text-emerald-500 tracking-[0.1em]">FREE</span>
                             <span className="text-[9px] uppercase tracking-widest font-black text-emerald-400 mt-1">Operational & Live</span>
                           </div>
                         ) : (
                           <div className="flex flex-col">
                             <span className="text-2xl font-heading font-black text-amber-500 uppercase tracking-wider">COMING SOON</span>
                             <span className="text-[9px] uppercase tracking-widest font-black text-amber-400 mt-1">Under Development</span>
                           </div>
                         )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                        <User size={12} className="text-warning" />
                        <span>{enrolledStudents.length} Enrolled</span>
                      </div>
                    </div>

                    {selectedCourse.price > 0 ? (
                      <button 
                        disabled
                        className="w-full py-4 bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black uppercase tracking-[0.15em] text-xs rounded-lg flex items-center justify-center gap-3 cursor-not-allowed"
                      >
                        <Lock size={16} />
                        Under Development • Coming Soon
                      </button>
                    ) : isPurchased(selectedCourse.id) ? (
                      <button 
                        onClick={() => navigate(`/player/${selectedCourse.id}`)}
                        className="w-full py-4 bg-success text-text-main font-black uppercase tracking-[0.2em] rounded-md hover:bg-success/90 transition-colors flex items-center justify-center gap-3"
                      >
                        <CheckCircle size={20} />
                        Go to Course
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => handlePurchase(selectedCourse.id, e)}
                        disabled={purchasing === selectedCourse.id || success === selectedCourse.id}
                        className="w-full py-4 bg-warning text-crust font-black uppercase tracking-[0.2em] rounded-md hover:bg-warning/90 shadow-[0_4px_20px_rgba(0,240,255,0.2)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {purchasing === selectedCourse.id ? (
                          <><Loader2 size={20} className="animate-spin" /> {selectedCourse.price === 0 ? "Enrolling Investigator..." : "Analyzing Payment..."}</>
                        ) : success === selectedCourse.id ? (
                          <><CheckCircle size={20} /> Access Granted!</>
                        ) : (
                          <>Enroll Now <ChevronRight size={18} /></>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {selectedInstructor && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedInstructor(null)}
               className="absolute inset-0 bg-base/90 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-surface border border-black/10 dark:border-white/10 w-full max-w-2xl relative z-10 shadow-2xl rounded-2xl overflow-hidden"
            >
              <button 
                onClick={() => setSelectedInstructor(null)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-20"
              >
                <X size={20} />
              </button>

              {(() => {
                const instructorCourses = allMergedCourses.filter(c => c.instructor === selectedInstructor);
                const firstCourse = instructorCourses[0];
                return (
                  <>
                    <div className="h-32 bg-black relative">
                      <img src={firstCourse.thumbnail} alt="Cover" className="w-full h-full object-cover opacity-30" />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
                    </div>
                    <div className="px-8 pb-8 relative">
                      <div className="w-24 h-24 rounded-full border-4 border-surface overflow-hidden -mt-12 mb-4 relative z-10 bg-base">
                        <img src={firstCourse.instructorImage} alt={selectedInstructor} className="w-full h-full object-cover" />
                      </div>
                      <h2 className="text-3xl font-heading font-black text-text-main mb-1 uppercase tracking-tight">{selectedInstructor}</h2>
                      <p className="text-warning text-xs font-black uppercase tracking-widest mb-6">Lead Forensic Instructor</p>
                      
                      <div className="bg-black/5 dark:bg-white/5 p-4 items-center rounded-lg border border-black/10 dark:border-white/10 mb-8">
                         <p className="text-sm text-text-muted leading-relaxed">
                           {firstCourse.instructorBio}
                         </p>
                      </div>

                      <h3 className="text-lg font-heading font-black uppercase mb-4 tracking-wide flex items-center gap-2">
                         <BookOpen size={16} className="text-warning" />
                         Courses by {selectedInstructor}
                      </h3>
                      
                      <div className="space-y-3">
                        {instructorCourses.map(c => (
                           <div 
                             key={c.id} 
                             onClick={() => { setSelectedInstructor(null); setSelectedCourse(c); }}
                             className="flex items-center gap-4 p-3 rounded-lg border border-black/10 dark:border-white/10 hover:border-warning/30 bg-base/50 cursor-pointer group transition-colors"
                           >
                             <div className="w-16 h-12 bg-black rounded overflow-hidden flex-shrink-0">
                               <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                             </div>
                             <div className="flex-grow">
                                <h4 className="text-sm font-bold text-text-main group-hover:text-warning transition-colors line-clamp-1">{c.title}</h4>
                                <p className="text-[10px] text-text-muted uppercase tracking-widest">{c.level} • {c.duration}</p>
                             </div>
                             <ChevronRight size={16} className="text-text-muted group-hover:text-warning" />
                           </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}

        {previewVideo && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setPreviewVideo(null)}
               className="absolute inset-0 bg-crust/95 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl bg-black rounded-2xl overflow-hidden relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
            >
              <div className="flex justify-between items-center p-4 bg-surface absolute top-0 left-0 right-0 z-20 transform -translate-y-full hover:translate-y-0 transition-transform">
                <span className="text-xs font-black uppercase tracking-widest text-warning flex items-center gap-2">
                  <Play size={14} /> Course Preview
                </span>
                <button 
                  onClick={() => setPreviewVideo(null)}
                  className="p-1 hover:bg-white/10 rounded-full text-text-muted hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="aspect-video w-full bg-base">
                <iframe 
                  src={`${previewVideo}?autoplay=1`} 
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <button 
                onClick={() => setPreviewVideo(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-colors z-20 backdrop-blur-sm"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

