import { EvidenceMarker } from "@/components/ui/EvidenceMarker";
import { motion, AnimatePresence } from 'motion/react';
import { MicroscopeViewer } from "@/components/ui/ThreeDElement";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc, arrayUnion, arrayRemove, serverTimestamp, updateDoc, collection, onSnapshot, increment } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "@/lib/firestoreUtils";
import { db } from "@/lib/firebase";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { Loader2, CheckCircle, X, BookOpen, User, Clock, ShieldCheck, ChevronRight, Bell, Lock, Unlock, CreditCard, Share2, Heart, Twitter, MessageCircle, Copy } from "lucide-react";
import { COURSES, Course } from "@/constants";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Courses() {
  const { user, userProfile, signInWithGoogle } = useAuth();
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
    if (courseId) {
      const course = COURSES.find(c => c.id === parseInt(courseId));
      if (course) {
        if (userProfile?.purchasedCourses?.includes(course.id)) {
          navigate(`/player/${course.id}`);
        } else {
          setSelectedCourse(course);
        }
      }
    }
  }, [searchParams]);

  const handlePurchase = async (courseId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const course = COURSES.find(c => c.id === courseId);
    if (!course) return;

    if (!user) {
      await signInWithGoogle();
      return;
    }

    if (course.price === 0) {
      setPurchasing(courseId);
      try {
        await setDoc(doc(db, 'users', user.uid), {
          purchasedCourses: arrayUnion(courseId),
          updatedAt: serverTimestamp()
        }, { merge: true });

        await setDoc(doc(db, 'courseStats', courseId.toString()), {
          students: increment(1),
          updatedAt: serverTimestamp()
        }, { merge: true });

        setSuccess(courseId);
        setTimeout(() => {
          setSuccess(null);
          if (userProfile?.purchasedCourses && !userProfile.purchasedCourses.includes(courseId)) {
             // Update UI state manually until firestore syncs
             userProfile.purchasedCourses.push(courseId);
          }
        }, 3000);
      } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
        alert('An error occurred during enrollment.');
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
        name: "Foren Clue",
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
                await setDoc(doc(db, 'users', user.uid), {
                  purchasedCourses: arrayUnion(courseId),
                  updatedAt: serverTimestamp()
                }, { merge: true });
        
                await setDoc(doc(db, 'courseStats', courseId.toString()), {
                  students: increment(1),
                  updatedAt: serverTimestamp()
                }, { merge: true });
              } catch (dbErr: any) {
                console.error("Failed to unlock course in DB after payment", dbErr);
                // We still show success since payment went through, but log error
              }
              // Successfully verified and unlocked
              setSuccess(courseId);
              setShowPaymentPopup(null);
              setTimeout(() => setSuccess(null), 4000);
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
    return userProfile?.purchasedCourses?.includes(courseId);
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

  const handleSocialShare = (course: Course, platform: 'twitter' | 'whatsapp' | 'copy', e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/courses?id=${course.id}`;
    const text = `Join the investigation: ${course.title} at Forensic Insights Lab!`;
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
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
      <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
        <div className="text-left md:w-1/2">
          <h1 className="text-4xl md:text-6xl font-heading font-black mb-4 uppercase tracking-tight relative z-10">
            Explore <span className="text-warning">Courses</span>
          </h1>
          <p className="text-xl text-text-muted relative z-10 mb-6">Get Started With Our Most Structured Courses</p>
          <div className="relative z-10 max-w-sm">
            <input 
              type="text" 
              placeholder="Search by title, instructor, or topic..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-md py-3 pl-4 pr-10 text-sm md:text-base focus:border-warning/50 focus:outline-none transition-colors"
            />
          </div>
        </div>
        <div className="md:w-1/2 h-[300px] md:h-[400px] w-full relative z-0">
          <div className="absolute inset-0 left-0 right-0 top-0 bottom-0 pointer-events-auto">
             <MicroscopeViewer />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {COURSES.filter(course => 
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) || 
          course.description.toLowerCase().includes(searchTerm.toLowerCase())
        ).map((course, idx) => (
          <motion.div 
            key={course.id} 
            whileHover={{ y: -8, scale: 1.01 }}
            onClick={() => setSelectedCourse(course)}
            className="bg-surface border border-black/10 dark:border-white/5 overflow-hidden group hover:border-warning/30 transition-colors relative flex flex-col shadow-2xl cursor-pointer"
          >
            {/* Status & Actions Badge */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveShareMenu(activeShareMenu === course.id ? null : course.id); }}
                  className="p-2 bg-surface/90 text-text-muted border border-black/10 dark:border-white/5 hover:text-warning hover:border-warning/30 transition-all rounded shadow-lg flex items-center justify-center"
                  title="Share Case"
                >
                  <Share2 size={12} />
                </button>
                
                <AnimatePresence>
                  {activeShareMenu === course.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 bg-base border border-black/10 dark:border-white/10 rounded-lg shadow-2xl p-2 z-50 flex flex-col gap-1 min-w-[120px]"
                    >
                      <button 
                        onClick={(e) => handleSocialShare(course, 'twitter', e)}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-black/5 dark:bg-white/5 rounded text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-main transition-colors"
                      >
                        <Twitter size={12} className="text-blue-400" />
                        Twitter
                      </button>
                      <button 
                        onClick={(e) => handleSocialShare(course, 'whatsapp', e)}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-black/5 dark:bg-white/5 rounded text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-main transition-colors"
                      >
                        <MessageCircle size={12} className="text-green-400" />
                        WhatsApp
                      </button>
                      <button 
                        onClick={(e) => handleSocialShare(course, 'copy', e)}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-black/5 dark:bg-white/5 rounded text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-main transition-colors"
                      >
                        <Copy size={12} className="text-warning" />
                        Copy Link
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={(e) => toggleWishlist(course.id, e)}
                disabled={isBookmarking === course.id}
                className={`p-2 bg-surface/90 border border-black/10 dark:border-white/5 transition-all rounded shadow-lg flex items-center justify-center ${isWishlisted(course.id) ? 'text-warning border-warning/30' : 'text-text-muted hover:text-warning hover:border-warning/30'}`}
                title={isWishlisted(course.id) ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                {isBookmarking === course.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Heart size={12} fill={isWishlisted(course.id) ? "currentColor" : "none"} />
                )}
              </button>

              <div className={`flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg ${isPurchased(course.id) ? 'bg-success text-text-main' : 'bg-surface/90 text-warning border border-warning/30'}`}>
                {isPurchased(course.id) ? (
                  <>
                    <Unlock size={10} />
                    Access Unlocked
                  </>
                ) : (
                  <>
                    <Lock size={10} />
                    Course Locked
                  </>
                )}
              </div>
            </div>

            <EvidenceMarker number={idx + 1 < 10 ? `0${idx + 1}` : idx + 1} className="absolute top-4 left-4 scale-75 z-20 group-hover:rotate-6 transition-transform" />

            <div className="h-48 bg-black relative overflow-hidden">
              <img 
                src={course.thumbnail} 
                alt={course.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-base/40 group-hover:bg-warning/10 transition-colors z-10" />
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <span className="font-heading font-black text-6xl rotate-[-20deg]">FORENSICS</span>
              </div>
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-warning">{course.level}</span>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
                  <span className="flex items-center gap-1 text-warning/80"><User size={12} /> {courseStats[course.id] || 0} Enrolled</span>
                </div>
              </div>
              <h3 className="font-heading font-bold text-xl mb-2 group-hover:text-warning transition-colors">{course.title}</h3>
              <p className="text-sm text-text-muted mb-6 flex-grow">
                {course.description}
              </p>
              
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                      <img src={course.instructorImage} alt={course.instructor} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-medium text-text-muted hover:text-text-main transition-colors cursor-pointer">{course.instructor}</span>
                  </div>
                  <div className="flex flex-col items-end justify-center">
                    {course.price === 0 ? (
                      <span className="text-3xl font-heading font-black text-warning drop-shadow-[0_0_15px_rgba(0,240,255,0.8)] animate-pulse tracking-widest bg-warning/10 px-4 py-1 rounded-sm border border-warning/50">FREE</span>
                    ) : (
                      <>
                        <span className="text-lg font-heading font-black text-warning">{course.price} INR</span>
                        <span className="text-[10px] text-text-muted line-through">{course.originalPrice} INR</span>
                      </>
                    )}
                  </div>
                </div>

                {isPurchased(course.id) ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/player/${course.id}`); }}
                    className="w-full py-3 bg-black/5 dark:bg-white/10 text-text-main font-bold tracking-wide rounded-md hover:bg-black/5 dark:bg-white/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} className="text-success" />
                    Go to Course
                  </button>
                ) : (
                  <button 
                    onClick={(e) => handlePurchase(course.id, e)}
                    disabled={purchasing === course.id || success === course.id}
                    className="w-full py-3 bg-warning text-crust font-bold tracking-wide rounded-md hover:bg-warning/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-75"
                  >
                    {purchasing === course.id ? (
                      <><Loader2 size={18} className="animate-spin" /> Processing...</>
                    ) : success === course.id ? (
                      <><CheckCircle size={18} /> Success!</>
                    ) : course.price === 0 ? (
                      "Enroll for Free"
                    ) : (
                      "Buy Now"
                    )}
                  </button>
                )}
                <div className="text-center mt-3">
                   <span className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-warning transition-colors">Click to View Details</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

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
                        <span className="text-xs font-bold uppercase tracking-widest">{courseStats[selectedCourse.id] || 0} Enrolled</span>
                      </div>
                    </div>
                    <p className="text-text-muted text-sm leading-relaxed mb-8">
                      {selectedCourse.description}
                    </p>
                  </div>

                  <div className="p-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <img src={selectedCourse.instructorImage} alt={selectedCourse.instructor} className="w-12 h-12 rounded-full object-cover border border-warning/30" />
                      <div>
                        <h4 className="text-sm font-bold text-text-main uppercase tracking-wider">{selectedCourse.instructor}</h4>
                        <p className="text-[10px] text-warning font-black uppercase tracking-widest">Lead Instructor</p>
                      </div>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {selectedCourse.instructorBio}
                    </p>
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
                        {selectedCourse.notices.length > 0 ? (
                          selectedCourse.notices.map((notice) => (
                            <div key={notice.id} className="p-4 bg-warning/5 rounded-md border border-warning/20 relative overflow-hidden group">
                              <div className="absolute top-0 left-0 w-1 h-full bg-warning opacity-50" />
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black text-warning uppercase tracking-widest bg-warning/10 px-2 py-0.5 rounded">Update</span>
                                <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest">{notice.date}</span>
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
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">Pricing</p>
                         {selectedCourse.price === 0 ? (
                           <span className="text-3xl font-heading font-black text-warning tracking-[0.1em]">FREE</span>
                         ) : (
                           <div className="flex items-baseline gap-3">
                             <span className="text-3xl font-heading font-black text-warning">{selectedCourse.price} INR</span>
                             <span className="text-sm text-text-muted line-through italic">{selectedCourse.originalPrice} INR</span>
                           </div>
                         )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                        <User size={12} className="text-warning" />
                        <span>1.2k+ Enrolled</span>
                      </div>
                    </div>

                    {isPurchased(selectedCourse.id) ? (
                      <button 
                        onClick={() => navigate(`/player/${selectedCourse.id}`)}
                        className="w-full py-4 bg-success text-text-main font-black uppercase tracking-[0.2em] rounded-md hover:bg-success/90 transition-colors flex items-center justify-center gap-3"
                      >
                        <CheckCircle size={20} />
                        Inside Your Lab
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => handlePurchase(selectedCourse.id, e)}
                        disabled={purchasing === selectedCourse.id || success === selectedCourse.id}
                        className="w-full py-4 bg-warning text-crust font-black uppercase tracking-[0.2em] rounded-md hover:bg-warning/90 shadow-[0_4px_20px_rgba(0,240,255,0.2)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {purchasing === selectedCourse.id ? (
                          <><Loader2 size={20} className="animate-spin" /> Analyzing Payment...</>
                        ) : success === selectedCourse.id ? (
                          <><CheckCircle size={20} /> Access Granted!</>
                        ) : selectedCourse.price === 0 ? (
                          <>Enroll Now <ChevronRight size={18} /></>
                        ) : (
                          <>Secure Course Access <ChevronRight size={18} /></>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

