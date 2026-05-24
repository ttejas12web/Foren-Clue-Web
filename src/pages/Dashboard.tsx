import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'motion/react';
import { BookOpen, Clock, Heart, Activity, LayoutDashboard, ChevronRight, Play } from 'lucide-react';
import { COURSES, Course } from '@/constants';
import { EvidenceMarker } from '@/components/ui/EvidenceMarker';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Dashboard() {
  const { user, userProfile } = useAuth();
  const [dbCourses, setDbCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'courses'), (snapshot) => {
      const list: Course[] = [];
      snapshot.forEach(docSnap => {
        list.push({ ...docSnap.data() } as Course);
      });
      setDbCourses(list);
    }, (error) => {
      console.warn("Could not load dynamic courses for dashboard:", error);
    });
    return () => unsub();
  }, [user]);

  const allMergedCourses = useMemo(() => {
    return [...COURSES, ...dbCourses];
  }, [dbCourses]);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <div className="bg-surface p-10 border border-black/10 dark:border-white/10 rounded-lg text-center max-w-lg w-full shadow-2xl">
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard size={32} className="text-warning" />
          </div>
          <h2 className="text-3xl font-heading font-black mb-4 uppercase tracking-tight">Access Restricted</h2>
          <p className="text-text-muted mb-8 text-sm">You must be logged in to access the forensics dashboard.</p>
        </div>
      </div>
    );
  }

  const purchasedCourses = allMergedCourses.filter(course => 
    userProfile?.purchasedCourses?.includes(course.id)
  );

  const wishlistedCourses = allMergedCourses.filter(course => 
    userProfile?.progress?.wishlist?.includes(course.id)
  );

  // Get total progress percentage across all purchased courses
  let totalLessonsOverall = 0;
  let completedLessonsOverall = 0;

  purchasedCourses.forEach(course => {
    const courseTotalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    const courseCompletedLessons = userProfile?.progress?.[course.id] || [];
    totalLessonsOverall += courseTotalLessons;
    completedLessonsOverall += courseCompletedLessons.length;
  });

  const overallProgress = totalLessonsOverall > 0 
    ? Math.round((completedLessonsOverall / totalLessonsOverall) * 100) 
    : 0;

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-4xl md:text-5xl font-heading font-black uppercase tracking-tight">
          Investigator <span className="text-warning">Dashboard</span>
        </h1>
      </div>
      <p className="text-text-muted text-sm uppercase tracking-widest mb-12">
        Welcome back, {userProfile?.displayName || 'Detective'}. Here is your case file summary.
      </p>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-black/10 dark:border-white/5 p-6 rounded-lg relative overflow-hidden group hover:border-warning/30 transition-colors"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <BookOpen size={64} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">Active Cases</p>
          <p className="text-4xl font-heading font-black text-text-main">{purchasedCourses.length}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface border border-black/10 dark:border-white/5 p-6 rounded-lg relative overflow-hidden group hover:border-warning/30 transition-colors"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={64} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">Overall Progress</p>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-heading font-black text-text-main">{overallProgress}%</p>
            <div className="flex-1 pb-2">
              <div className="w-full h-1.5 bg-base rounded-full overflow-hidden">
                <div className="h-full bg-warning" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface border border-black/10 dark:border-white/5 p-6 rounded-lg relative overflow-hidden group hover:border-warning/30 transition-colors"
        >
           <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Heart size={64} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">Course Wishlist</p>
          <p className="text-4xl font-heading font-black text-text-main">{wishlistedCourses.length}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Recent Activity & Continue Learning */}
        <div className="lg:col-span-2 space-y-12">
          {/* Continue Learning */}
          <section>
            <h2 className="text-2xl font-heading font-black mb-6 uppercase tracking-tight flex items-center gap-3 border-b border-black/10 dark:border-white/5 pb-4">
               <Play size={20} className="text-warning" />
               Current Investigations
            </h2>
            <div className="space-y-4">
              {purchasedCourses.length > 0 ? (
                purchasedCourses.map((course) => {
                  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
                  const completedLessons = userProfile?.progress?.[course.id] || [];
                  const progress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
                  
                  return (
                    <div key={course.id} className="bg-surface/50 border border-black/10 dark:border-white/5 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-surface transition-colors">
                      <div className="flex items-center gap-4">
                        <EvidenceMarker number={course.id < 10 ? `0${course.id}` : course.id} className="scale-75" />
                        <div>
                          <h3 className="font-heading font-bold text-base text-text-main group-hover:text-warning transition-colors">{course.title}</h3>
                          <p className="text-xs text-text-muted mt-1 uppercase tracking-widest">Progress: {progress}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-1 bg-base rounded-full hidden md:block overflow-hidden">
                          <div className="h-full bg-warning" style={{ width: `${progress}%` }} />
                        </div>
                        <Link 
                          to={`/player/${course.id}`}
                          className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded text-xs font-bold uppercase tracking-widest hover:bg-warning hover:border-warning hover:text-crust transition-colors whitespace-nowrap"
                        >
                          Continue
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 bg-surface/30 border border-dashed border-black/10 dark:border-white/10 rounded-lg">
                  <p className="text-sm text-text-muted mb-4 uppercase tracking-widest">No active cases</p>
                  <Link to="/courses" className="text-warning text-sm font-bold uppercase tracking-wide hover:underline">
                    Browse Courses
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <h2 className="text-2xl font-heading font-black mb-6 uppercase tracking-tight flex items-center gap-3 border-b border-black/10 dark:border-white/5 pb-4">
               <Clock size={20} className="text-warning" />
               Recent Activity
            </h2>
            <div className="bg-surface border border-black/10 dark:border-white/5 rounded-lg p-6 relative overflow-hidden">
               <div className="absolute left-10 top-10 bottom-10 w-px bg-black/5 dark:bg-white/5 hidden sm:block" />
               <div className="space-y-8 relative">
                 {/* Mocked activity timeline */}
                 <div className="flex gap-4 sm:gap-6 relative">
                   <div className="w-3.5 h-3.5 rounded-full bg-warning mt-1 z-10 shrink-0 shadow-[0_0_10px_rgba(var(--color-warning),0.5)]" />
                   <div>
                     <p className="text-sm text-text-main font-bold mb-0.5">Logged into ForenClue</p>
                     <p className="text-xs text-text-muted uppercase tracking-widest">Just now</p>
                   </div>
                 </div>
                 {purchasedCourses.length > 0 && (
                   <div className="flex gap-4 sm:gap-6 relative">
                     <div className="w-3.5 h-3.5 rounded-full bg-surface border-2 border-warning mt-1 z-10 shrink-0" />
                     <div>
                       <p className="text-sm text-text-main font-bold mb-0.5">Enrolled in {purchasedCourses[0].title}</p>
                       <p className="text-xs text-text-muted uppercase tracking-widest">Recently</p>
                     </div>
                   </div>
                 )}
                 {wishlistedCourses.length > 0 && (
                   <div className="flex gap-4 sm:gap-6 relative">
                     <div className="w-3.5 h-3.5 rounded-full bg-surface border-2 border-black/10 dark:border-white/20 mt-1 z-10 shrink-0" />
                     <div>
                       <p className="text-sm text-text-muted font-bold mb-0.5">Wishlisted {wishlistedCourses.length} items</p>
                       <p className="text-xs text-text-muted uppercase tracking-widest">Recently</p>
                     </div>
                   </div>
                 )}
               </div>
            </div>
          </section>
        </div>

        {/* Right Column: Bookmarks & Quick Links */}
        <div className="space-y-12">
          {/* Bookmarks */}
          <section>
            <h2 className="text-2xl font-heading font-black mb-6 uppercase tracking-tight flex items-center gap-3 border-b border-black/10 dark:border-white/5 pb-4">
               <Heart size={20} className="text-warning" />
               Course Wishlist
            </h2>
            <div className="space-y-3">
              {wishlistedCourses.length > 0 ? (
                wishlistedCourses.map(course => (
                  <Link 
                    key={course.id} 
                    to={`/courses?id=${course.id}`}
                    className="block bg-surface border border-black/10 dark:border-white/5 p-4 rounded-lg group hover:border-warning/30 transition-colors"
                  >
                    <h3 className="font-heading font-bold text-sm text-text-main group-hover:text-warning transition-colors mb-1">{course.title}</h3>
                    <p className="text-[10px] text-text-muted uppercase tracking-widest flex items-center gap-1">
                      {course.modules.length} Modules <ChevronRight size={10} className="text-warning/50 group-hover:text-warning" />
                    </p>
                  </Link>
                ))
              ) : (
                <div className="text-center py-6 bg-surface/30 border border-dashed border-black/10 dark:border-white/10 rounded-lg">
                  <p className="text-xs text-text-muted uppercase tracking-widest">No wishlisted courses</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
