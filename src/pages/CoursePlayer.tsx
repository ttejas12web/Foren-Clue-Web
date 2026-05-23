import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Menu, 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  Clock, 
  Info, 
  Bell, 
  Bookmark, 
  MessageSquare, 
  Settings,
  X,
  User,
  Activity,
  Award,
  Loader2,
  BarChart2,
  PieChart as PieIcon,
  TrendingUp,
  Target,
  Share2,
  Heart,
  Twitter,
  MessageCircle,
  Copy,
  Heart as HeartIcon,
  Pencil,
  Edit,
  Plus,
  BookOpen,
  Trash2,
  FileText
} from 'lucide-react';
import { COURSES, Course, Lesson, Module } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from "@/lib/firestoreUtils";
import { LessonQuiz } from '@/components/Quiz';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  AreaChart,
  Area
} from 'recharts';

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, userProfile, isAdmin, loading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab ] = useState<'about' | 'notices' | 'notes' | 'qna' | 'files' | 'quiz'>('about');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLessonBookmarking, setIsLessonBookmarking] = useState<string | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [activeShareMenu, setActiveShareMenu] = useState(false);

  const [courseStats, setCourseStats] = useState<Record<number, number>>({});
  const [courseOverrides, setCourseOverrides] = useState<any>(null);

  useEffect(() => {
    if (courseId) {
      const foundCourse = COURSES.find(c => c.id === parseInt(courseId));
      if (foundCourse) {
        setCourse(foundCourse);
        if (foundCourse.modules.length > 0 && foundCourse.modules[0].lessons.length > 0) {
          setActiveLesson(foundCourse.modules[0].lessons[0]);
        }
      } else {
        navigate('/courses');
      }
      
      const unsub = onSnapshot(doc(db, 'courseOverrides', courseId), (docSnap) => {
        if (docSnap.exists() && foundCourse) {
          const overrides = docSnap.data();
          setCourseOverrides(overrides);
          
          let updatedCourse = { ...foundCourse };
          if (overrides.description) {
            updatedCourse.description = overrides.description;
          }
          if (overrides.notices) {
             updatedCourse.notices = [...foundCourse.notices, ...overrides.notices];
          }
          if (overrides.lessons) {
             updatedCourse.modules = foundCourse.modules.map(m => ({
               ...m,
               lessons: m.lessons.map(l => {
                  const lessonOverride = overrides.lessons?.[l.id];
                  if (lessonOverride) {
                     return { ...l, ...lessonOverride };
                  }
                  return l;
               })
             }));
          }
          setCourse(updatedCourse);
          setActiveLesson(prev => {
             if (!prev) return prev;
             const newLessonOverride = overrides.lessons?.[prev.id];
             return newLessonOverride ? { ...prev, ...newLessonOverride } : prev;
          });
        }
      });
      return () => unsub();
    }
  }, [courseId, navigate]);

  // Security Check: Ensure user has access
  useEffect(() => {
    if (!loading && course && courseId) {
      const searchParams = new URLSearchParams(window.location.search);
      const isJustEnrolled = searchParams.get('enrolled') === 'true';
      const isPurchased = userProfile?.purchasedCourses?.includes(parseInt(courseId)) || isAdmin || isJustEnrolled;
      
      if (!isPurchased) {
        navigate(`/courses?id=${courseId}`);
      }
    }
  }, [userProfile, course, courseId, loading, isAdmin, navigate]);

  // Load progress from userProfile
  useEffect(() => {
    if (userProfile && courseId) {
      const courseProgress = userProfile.progress?.[courseId] || [];
      setCompletedLessons(courseProgress);
    }
  }, [userProfile, courseId]);

  // Handle responsive sidebar behavior on orientation or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && !isSidebarOpen) {
         setIsSidebarOpen(true);
      }
    };
    
    const handleOrientationChange = () => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        } // wait for orientation to settle to close sidebar instead of covering screen
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isSidebarOpen]);

  const isBookmarked = () => {
    return userProfile?.bookmarks?.includes(parseInt(courseId!));
  };

  const toggleBookmark = async () => {
    if (!user || !courseId) return;
    setIsBookmarking(true);
    const path = `users/${user.uid}`;
    try {
      const userRef = doc(db, 'users', user.uid);
      const isCurrentlyBookmarked = isBookmarked();
      
      const newBookmarks = isCurrentlyBookmarked
        ? (userProfile.bookmarks || []).filter((id: number) => id !== parseInt(courseId))
        : [...(userProfile.bookmarks || []), parseInt(courseId)];

      await setDoc(userRef, {
        bookmarks: newBookmarks,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsBookmarking(false);
    }
  };

  const isLessonBookmarked = (lessonId: string) => {
    return userProfile?.lessonBookmarks?.[courseId!]?.includes(lessonId);
  };

  const toggleLessonBookmark = async (lessonId: string) => {
    if (!user || !courseId) return;
    setIsLessonBookmarking(lessonId);
    const path = `users/${user.uid}`;
    try {
      const userRef = doc(db, 'users', user.uid);
      const currentBookmarks = userProfile?.lessonBookmarks?.[courseId] || [];
      const isBookmarked = currentBookmarks.includes(lessonId);
      
      const newLessonBookmarks = isBookmarked
        ? currentBookmarks.filter(id => id !== lessonId)
        : [...currentBookmarks, lessonId];

      await updateDoc(userRef, {
        [`lessonBookmarks.${courseId}`]: newLessonBookmarks,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error toggling lesson bookmark:", error);
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsLessonBookmarking(null);
    }
  };

  const handleSocialShare = (platform: 'twitter' | 'whatsapp' | 'copy') => {
    if (!course) return;
    const url = `${window.location.origin}/courses?id=${course.id}`;
    const text = `I'm investigating ${course.title}! Join me at Forensic Insights Lab.`;
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    } else {
      navigator.clipboard.writeText(url);
      alert("Investigation link copied to clipboard.");
    }
    setActiveShareMenu(false);
  };

  if (!course) return null;

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const progressPercent = Math.round((completedLessons.length / totalLessons) * 100);

  const saveCourseOverride = async (type: 'lesson_video' | 'lesson_notes' | 'notice' | 'delete_notice' | 'description' | 'quiz', data: any) => {
    if (!isAdmin || !courseId) return;
    try {
      const ref = doc(db, 'courseOverrides', courseId);
      
      let updatePayload: any = {};
      const currentLessons = courseOverrides?.lessons || {};
      const currentNotices = courseOverrides?.notices || [];

      if (type === 'lesson_video' || type === 'lesson_notes' || type === 'quiz') {
        const { lessonId, value } = data;
        let lessonUpdate = { ...(currentLessons[lessonId] || {}) };
        if (type === 'lesson_video') lessonUpdate.videoUrl = value;
        if (type === 'lesson_notes') lessonUpdate.notesUrl = value;
        if (type === 'quiz') lessonUpdate.quizQuestions = value;
        
        updatePayload = {
          lessons: {
            ...currentLessons,
            [lessonId]: lessonUpdate
          }
        };
      } else if (type === 'notice') {
        updatePayload = {
          notices: [...currentNotices, data]
        };
      } else if (type === 'delete_notice') {
        updatePayload = {
          notices: currentNotices.filter((n: any) => n.id !== data.id)
        };
      } else if (type === 'description') {
        updatePayload = {
          description: data.content
        };
      }

      await setDoc(ref, updatePayload, { merge: true });
      alert("Course updated successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to update course.");
    }
  };

  const handleLessonToggle = async (lessonId: string) => {
    if (!user || !courseId) return;

    const newProgress = completedLessons.includes(lessonId) 
      ? completedLessons.filter(id => id !== lessonId) 
      : [...completedLessons, lessonId];
    
    // Update local state immediately for snappy UI
    setCompletedLessons(newProgress);
    
    // Save to Firestore
    setIsSaving(true);
    const progressPath = `users/${user.uid}`;
    try {
      const userRef = doc(db, 'users', user.uid);
      // Use updateDoc with dot notation to update only this course's progress within the progress object
      // this ensures other course progress isn't wiped out
      await updateDoc(userRef, {
        [`progress.${courseId}`]: newProgress,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error saving progress:", error);
      handleFirestoreError(error, OperationType.WRITE, progressPath);
      // Revert local state on error
      setCompletedLessons(completedLessons);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-base flex flex-col pt-4">
      {/* Top Navbar */}
      <nav className="h-16 border-b border-black/10 dark:border-white/5 flex items-center justify-between px-6 bg-surface z-50">
        <div className="flex items-center gap-4">
          <Link to="/profile" className="p-2 hover:bg-black/5 dark:bg-white/5 rounded-full transition-colors">
            <ChevronLeft size={20} className="text-text-muted" />
          </Link>
          <div className="h-8 w-[1px] bg-black/5 dark:bg-white/10 hidden md:block" />
          <h1 className="text-lg font-heading font-black uppercase tracking-wider hidden md:block">
            {course.title}
          </h1>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden lg:flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('about')}
              className={`text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'about' ? 'text-warning' : 'text-text-muted hover:text-text-main'}`}
            >
              About the course
            </button>
            <button 
              onClick={() => setActiveTab('notices')}
              className={`text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'notices' ? 'text-warning' : 'text-text-muted hover:text-text-main'}`}
            >
              Announcements
            </button>
            <button 
              onClick={() => setActiveTab('notes')}
              className={`text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'notes' ? 'text-warning' : 'text-text-muted hover:text-text-main'}`}
            >
              Notes
            </button>
            <button 
              onClick={() => setActiveTab('files')}
              className={`text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'files' ? 'text-warning' : 'text-text-muted hover:text-text-main'}`}
            >
              Study Files
            </button>
            <button 
              onClick={() => setActiveTab('qna')}
              className={`text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'qna' ? 'text-warning' : 'text-text-muted hover:text-text-main'}`}
            >
              Q&A
            </button>
            <button 
              onClick={() => setActiveTab('quiz')}
              className={`text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'quiz' ? 'text-warning' : 'text-text-muted hover:text-text-main'}`}
            >
              Lesson Quiz
            </button>
          </div>

          <div className="flex items-center gap-4">
            {progressPercent === 100 && (
               <button 
                onClick={() => alert("Certificate generation initiated. Your certificate will be sent to your registered email.")}
                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-warning to-yellow-500 text-crust px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
               >
                 <Award size={14} /> Certificate
               </button>
            )}
            <Link 
              to="/profile" 
              className="w-10 h-10 rounded-full border border-warning/30 overflow-hidden bg-warning/10 flex items-center justify-center font-black text-crust hover:scale-110 transition-transform shadow-lg shadow-warning/10"
              title="View Your Profile"
            >
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-warning text-sm">
                  {userProfile?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Curriculum */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              key="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-base/80 backdrop-blur-md z-40 md:hidden"
            />
          )}
          {isSidebarOpen && (
            <motion.aside 
              key="sidebar"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-[85vw] max-w-[320px] md:max-w-none md:w-80 border-r border-black/10 dark:border-white/5 bg-surface/95 md:bg-surface/50 backdrop-blur-2xl md:backdrop-blur-sm overflow-y-auto flex flex-col z-50 absolute md:relative inset-y-0 left-0 md:inset-auto shadow-2xl md:shadow-none"
            >
              <div className="p-6 border-b border-black/10 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                   <h2 className="text-sm font-black uppercase tracking-widest text-text-main flex items-center gap-2">
                      Course Progress
                      {isSaving && <Loader2 size={12} className="animate-spin text-warning/50" />}
                   </h2>
                   <button className="md:hidden p-1 hover:bg-black/5 dark:bg-white/10 rounded" onClick={() => setIsSidebarOpen(false)}>
                      <X size={16} />
                   </button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-warning" 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-warning">{progressPercent}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">
                    {completedLessons.length} of {totalLessons} modules completed
                  </p>
                  <button 
                    onClick={() => setShowProgressModal(true)}
                    className="text-[9px] text-warning font-black uppercase tracking-widest hover:underline flex items-center gap-1"
                  >
                    <BarChart2 size={10} />
                    Details
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {course.modules.map((module, mIdx) => (
                  <div key={module.id} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <ChevronLeft size={14} className="text-warning -rotate-90" />
                      <h3 className="text-[11px] font-black uppercase tracking-wider text-text-muted">{module.title}</h3>
                    </div>
                    <div className="space-y-1">
                      {module.lessons.map((lesson) => (
                        <div 
                          key={lesson.id}
                          onClick={() => {
                            setActiveLesson(lesson);
                            if (window.innerWidth < 768) {
                              setIsSidebarOpen(false);
                            }
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-md transition-all group cursor-pointer ${activeLesson?.id === lesson.id ? 'bg-warning/10 border border-warning/20' : 'hover:bg-black/5 dark:bg-white/5 border border-transparent'}`}
                        >
                          <div 
                             onClick={(e) => { e.stopPropagation(); handleLessonToggle(lesson.id); }}
                             className="flex-shrink-0 cursor-pointer"
                          >
                            {completedLessons.includes(lesson.id) ? (
                              <CheckCircle2 size={16} className="text-warning shadow-[0_0_8px_rgba(0,240,255,0.3)]" />
                            ) : (
                              <Circle size={16} className="text-text-muted group-hover:text-warning transition-colors" />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center justify-between">
                              <p className={`text-xs font-bold leading-tight ${activeLesson?.id === lesson.id ? 'text-text-main' : 'text-text-muted group-hover:text-text-main'}`}>
                                {lesson.title}
                              </p>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleLessonBookmark(lesson.id); }}
                                disabled={isLessonBookmarking === lesson.id}
                                className={`p-1 rounded hover:bg-black/5 dark:bg-white/10 transition-colors ${isLessonBookmarked(lesson.id) ? 'text-warning' : 'text-text-muted opacity-0 group-hover:opacity-100'}`}
                              >
                                {isLessonBookmarking === lesson.id ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Bookmark size={12} fill={isLessonBookmarked(lesson.id) ? "currentColor" : "none"} />
                                )}
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <PlayCircle size={10} className="text-warning/50" />
                              <span className="text-[10px] text-text-muted font-black tracking-widest">{lesson.duration}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-black/10 dark:border-white/5 bg-base/30">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                  <User size={12} className="text-warning" />
                  Course Mentor
                </h4>
                <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-black/10 dark:border-white/5">
                   <img src={course.instructorImage} className="w-8 h-8 rounded-full border border-warning/30" />
                   <div>
                      <p className="text-[11px] font-black text-text-main">{course.instructor}</p>
                      <p className="text-[9px] text-text-muted">Lead Investigator</p>
                   </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Sidebar Toggle Button (Mobile) */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-50 p-2 bg-warning text-crust rounded shadow-lg md:hidden"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-crust/50 relative overflow-y-auto">
          {/* Active Lesson Header */}
          <div className="p-6 bg-surface/30 border-b border-black/10 dark:border-white/5">
             <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-warning mb-2">
                <span className="bg-warning/20 px-2 py-0.5 rounded border border-warning/30">Active Case</span>
                <span className="text-text-muted">/</span>
                <span>{activeLesson?.title}</span>
             </div>
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-heading font-black text-text-main uppercase tracking-tight">
                   {activeLesson?.title}
                </h2>
                <div className="flex items-center gap-3 relative">
                   <div className="relative">
                      <button 
                        onClick={() => setActiveShareMenu(!activeShareMenu)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-main transition-colors"
                      >
                         <Share2 size={14} className="text-warning" />
                         Share
                      </button>

                      <AnimatePresence>
                        {activeShareMenu && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 bg-base border border-black/10 dark:border-white/10 rounded-lg shadow-2xl p-2 z-50 flex flex-col gap-1 min-w-[120px]"
                          >
                            <button 
                              onClick={() => handleSocialShare('twitter')}
                              className="flex items-center gap-3 px-3 py-2 hover:bg-black/5 dark:bg-white/5 rounded text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-main transition-colors"
                            >
                              <Twitter size={12} className="text-blue-400" />
                              Twitter
                            </button>
                            <button 
                              onClick={() => handleSocialShare('whatsapp')}
                              className="flex items-center gap-3 px-3 py-2 hover:bg-black/5 dark:bg-white/5 rounded text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-main transition-colors"
                            >
                              <MessageCircle size={12} className="text-green-400" />
                              WhatsApp
                            </button>
                            <button 
                              onClick={() => handleSocialShare('copy')}
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
                    onClick={toggleBookmark}
                    disabled={isBookmarking}
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${isBookmarked() ? 'text-warning' : 'text-text-muted hover:text-text-main'}`}
                   >
                      {isBookmarking ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Bookmark size={14} fill={isBookmarked() ? "currentColor" : "none"} />
                      )}
                      {isBookmarked() ? 'Bookmarked' : 'Bookmark'}
                   </button>
                </div>
             </div>
          </div>

          <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
            {/* Video Player Section */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-black/10 dark:border-white/10 shadow-2xl group mb-8">
              <iframe 
                src={activeLesson?.videoUrl || ""}
                title={activeLesson?.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              
              {/* Overlay elements to match the image style */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-2">
                 <div className="bg-warning/90 text-crust p-2 py-1 flex items-center gap-2 rounded text-[10px] font-black uppercase tracking-widest shadow-lg">
                    <Activity size={12} />
                    Live Transmission
                 </div>
              </div>
              
              {isAdmin && (
                <div className="absolute top-4 right-4 z-20">
                  <button 
                    onClick={() => {
                      const newUrl = prompt("Enter new YouTube Embed URL:", activeLesson?.videoUrl);
                      if (newUrl !== null && activeLesson) {
                         saveCourseOverride('lesson_video', { lessonId: activeLesson.id, value: newUrl });
                      }
                    }}
                    className="bg-black/80 text-warning border border-warning/50 p-2 py-1 flex items-center gap-2 rounded text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-colors backdrop-blur-md"
                  >
                    <Edit size={12} /> Edit Video Link
                  </button>
                </div>
              )}
            </div>

            {/* Tabbed Content Section */}
            <div className="bg-surface/50 border border-black/10 dark:border-white/5 rounded-xl overflow-hidden backdrop-blur-md">
              <div className="flex border-b border-black/10 dark:border-white/5 overflow-x-auto scrollbar-hide snap-x">
                 {['about', 'notices', 'notes', 'qna', 'files', 'quiz'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t as any)}
                      className={`px-6 py-4 text-[10px] whitespace-nowrap snap-start font-black uppercase tracking-widest transition-all relative flex-1 text-center ${activeTab === t ? 'text-text-main' : 'text-text-muted hover:text-text-main'}`}
                    >
                      {t.replace(/([A-Z])/g, ' $1')}
                      {activeTab === t && (
                        <motion.div layoutId="tab-underline" className="absolute bottom-0 left-6 right-6 h-0.5 bg-warning shadow-[0_0_10px_#00f0ff]" />
                      )}
                    </button>
                 ))}
              </div>
              
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'about' && (
                    <motion.div 
                      key="about"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 dark:border-white/5 pb-6">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-black uppercase tracking-widest text-warning flex items-center gap-2">
                               <Info size={16} /> Course Description
                            </h4>
                            {isAdmin && (
                              <button
                                onClick={() => {
                                  const desc = prompt("Edit Course Description:", course.description);
                                  if (desc !== null) {
                                    saveCourseOverride('description', { content: desc });
                                  }
                                }}
                                className="bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 text-text-main"
                              >
                                <Edit size={12} /> Edit Description
                              </button>
                            )}
                          </div>
                          <p className="text-text-muted leading-relaxed">
                            {course.description}
                          </p>
                        </div>
                        <button 
                          onClick={() => alert("Review module opening... Share your forensic insights!")}
                          className="flex-shrink-0 bg-black/5 dark:bg-white/5 hover:bg-warning/20 border border-black/10 dark:border-white/10 hover:border-warning/50 text-text-main hover:text-warning px-4 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all focus:outline-none flex items-center gap-2"
                        >
                          <Target size={14} /> Rate Course
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="bg-black/5 dark:bg-white/2 p-4 rounded-lg border border-black/10 dark:border-white/5">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">Target Level</h5>
                            <div className="flex items-center gap-2 text-text-main font-bold">
                               <Award size={16} className="text-warning" />
                               {course.level}
                            </div>
                         </div>
                         <div className="bg-black/5 dark:bg-white/2 p-4 rounded-lg border border-black/10 dark:border-white/5">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">Estimated Duration</h5>
                            <div className="flex items-center gap-2 text-text-main font-bold">
                               <Clock size={16} className="text-warning" />
                               {course.duration}
                            </div>
                         </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'notices' && (
                    <motion.div 
                      key="notices"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      {isAdmin && (
                        <div className="flex justify-end mb-4">
                          <button 
                            onClick={() => {
                              const note = prompt("Enter new announcement/notice:");
                              if (note) {
                                saveCourseOverride('notice', { id: Date.now(), date: new Date().toISOString().split('T')[0], content: note });
                              }
                            }}
                            className="bg-warning text-crust hover:bg-warning/80 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                          >
                            <Plus size={14} /> Add Notice
                          </button>
                        </div>
                      )}
                      {course.notices.map(notice => (
                        <div key={notice.id} className="p-6 bg-warning/5 border border-warning/10 rounded-lg relative group">
                          <div className="absolute top-0 left-0 w-1 h-full bg-warning opacity-30 group-hover:opacity-100 transition-opacity" />
                          <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                                <Bell size={14} className="text-warning" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-warning">Investigation Update</span>
                             </div>
                             <div className="flex items-center gap-4">
                               <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest">{notice.date}</span>
                               {isAdmin && (
                                 <button 
                                   onClick={() => {
                                     if (confirm("Are you sure you want to delete this notice?")) {
                                        saveCourseOverride('delete_notice', notice);
                                     }
                                   }}
                                    className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                 >
                                   <Trash2 size={12} />
                                 </button>
                               )}
                             </div>
                          </div>
                          <p className="text-sm text-text-muted leading-relaxed group-hover:text-text-main transition-colors">{notice.content}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === 'notes' && (
                    <motion.div 
                      key="notes"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col h-full space-y-8"
                    >
                       <div className="bg-black/5 dark:bg-white/5 p-6 rounded-lg border border-black/10 dark:border-white/5">
                         <div className="flex items-center justify-between mb-4">
                           <h4 className="text-sm font-black uppercase tracking-widest text-warning flex items-center gap-2">
                              <BookOpen size={16} /> Official Lecture Notes
                           </h4>
                           {isAdmin && (
                             <button
                               onClick={() => {
                                 const notesLink = prompt("Enter link to official lecture notes (Google Drive, PDF, etc):", (activeLesson as any)?.notesUrl || "");
                                 if (notesLink !== null && activeLesson) {
                                   saveCourseOverride('lesson_notes', { lessonId: activeLesson.id, value: notesLink });
                                 }
                               }}
                               className="bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 text-text-main"
                             >
                               <Edit size={12} /> Edit Link
                             </button>
                           )}
                         </div>
                         {((activeLesson as any)?.notesUrl) ? (
                            <a href={(activeLesson as any).notesUrl} target="_blank" rel="noreferrer" className="text-sm text-warning hover:underline flex items-center gap-2">
                               Download / View Notes for {activeLesson?.title}
                            </a>
                         ) : (
                            <p className="text-sm text-text-muted">No official notes have been uploaded for this lesson yet.</p>
                         )}
                       </div>

                       <div className="flex flex-col h-full space-y-4">
                         <div className="flex items-center justify-between">
                           <h4 className="text-sm font-black uppercase tracking-widest text-warning flex items-center gap-2">
                              <Pencil size={16} /> My Investigation Notes
                           </h4>
                           <button className="bg-warning text-crust hover:bg-warning-dark px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all">
                              Save Notes
                           </button>
                         </div>
                         <textarea 
                           className="flex-grow min-h-[200px] bg-base/50 border border-black/10 dark:border-white/10 rounded-lg p-4 text-sm text-text-main resize-none focus:outline-none focus:border-warning/50 transition-colors"
                           placeholder="Take notes for this module here..."
                         ></textarea>
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'qna' && (
                     <motion.div 
                      key="qna"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center justify-center p-12 text-center"
                     >
                        <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                           <MessageSquare size={24} className="text-text-muted" />
                        </div>
                        <h4 className="text-lg font-black uppercase tracking-widest text-text-main mb-2">Forensic Community Forum</h4>
                        <p className="text-text-muted text-sm max-w-sm mb-6">Connect with fellow investigators, share insights, and clear your investigative doubts.</p>
                        <button className="bg-black/5 dark:bg-white/5 hover:bg-black/5 dark:bg-white/10 text-text-main px-6 py-2 border border-black/10 dark:border-white/10 rounded-lg text-xs font-black uppercase tracking-widest transition-all">
                           Open Forensic Forum
                        </button>
                     </motion.div>
                  )}

                  {activeTab === 'files' && (
                     <motion.div 
                      key="files"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                     >
                       <div className="bg-black/5 dark:bg-white/5 p-6 rounded-lg border border-black/10 dark:border-white/5">
                         <div className="flex items-center justify-between mb-4">
                           <h4 className="text-sm font-black uppercase tracking-widest text-warning flex items-center gap-2">
                              <BookOpen size={16} /> Attached Study Files
                           </h4>
                           {isAdmin && (
                             <button
                               onClick={() => {
                                 const notesLink = prompt("Enter link to related study files/notes (Google Drive, PDF, etc):", (activeLesson as any)?.notesUrl || "");
                                 if (notesLink !== null && activeLesson) {
                                   saveCourseOverride('lesson_notes', { lessonId: activeLesson.id, value: notesLink });
                                 }
                               }}
                               className="bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 text-text-main"
                             >
                               <Edit size={12} /> Edit Link
                             </button>
                           )}
                         </div>
                         {((activeLesson as any)?.notesUrl) ? (
                            <a href={(activeLesson as any).notesUrl} target="_blank" rel="noreferrer" className="text-sm text-warning hover:underline flex items-center gap-2">
                               <FileText className="inline mr-2" size={16} />
                               Download / View Attached Files
                            </a>
                         ) : (
                            <p className="text-sm text-text-muted">No files or notes have been attached to this lecture yet.</p>
                         )}
                       </div>
                     </motion.div>
                  )}
                  {activeTab === 'quiz' && activeLesson && (
                     <motion.div 
                      key="quiz"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="relative"
                     >
                       {isAdmin && (
                         <div className="absolute top-4 right-4 z-10">
                           <button
                             onClick={() => {
                               const q = prompt("Enter Quiz JSON Format: [{id: string, text: string, options: string[], correctAnswer: number, explanation: string}]");
                               if (q !== null) {
                                 try {
                                   const parsed = JSON.parse(q);
                                   saveCourseOverride('quiz', { lessonId: activeLesson.id, value: parsed });
                                 } catch(e) {
                                   alert("Invalid JSON format");
                                 }
                               }
                             }}
                            className="bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 text-text-main"
                           >
                              <Edit size={12} /> Edit Quiz JSON
                           </button>
                         </div>
                       )}
                       <LessonQuiz courseId={courseId!} lessonId={activeLesson.id} title={activeLesson.title} questionsOverride={(activeLesson as any).quizQuestions} />
                     </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Progress Infographics Modal */}
      <AnimatePresence>
        {showProgressModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProgressModal(false)}
              className="absolute inset-0 bg-base/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface border border-black/10 dark:border-white/10 w-full max-w-5xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl rounded-2xl flex flex-col"
            >
              <div className="p-8 border-b border-black/10 dark:border-white/5 flex items-center justify-between sticky top-0 bg-surface z-20">
                <div>
                   <h2 className="text-2xl font-heading font-black text-warning uppercase tracking-tight flex items-center gap-3">
                      <TrendingUp size={28} />
                      Investigative Progress Report
                   </h2>
                   <p className="text-xs text-text-muted font-bold uppercase tracking-[0.2em] mt-1">Detailed Case Completion Analytics</p>
                </div>
                <button 
                  onClick={() => setShowProgressModal(false)}
                  className="p-3 hover:bg-black/5 dark:bg-white/5 rounded-full transition-colors text-text-muted hover:text-text-main"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {[
                     { label: 'Overall Completion', val: `${progressPercent}%`, icon: PieIcon, color: 'text-warning' },
                     { label: 'Lessons Mastered', val: `${completedLessons.length}/${totalLessons}`, icon: Target, color: 'text-blue-400' },
                     { label: 'Modules Unlocked', val: course.modules.length, icon: Activity, color: 'text-green-400' },
                     { label: 'Investigator Rank', val: progressPercent > 80 ? 'Expert' : 'Apprentice', icon: Award, color: 'text-purple-400' }
                   ].map((stat, i) => (
                     <div key={i} className="bg-black/5 dark:bg-white/2 border border-black/10 dark:border-white/5 p-6 rounded-xl flex flex-col gap-2">
                        <stat.icon size={20} className={stat.color} />
                        <p className="text-xs font-black uppercase tracking-widest text-text-muted">{stat.label}</p>
                        <p className="text-3xl font-heading font-black text-text-main">{stat.val}</p>
                     </div>
                   ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Completion Pie Chart */}
                  <div className="bg-black/5 dark:bg-white/2 border border-black/10 dark:border-white/5 p-8 rounded-2xl h-[400px] flex flex-col">
                    <h3 className="text-sm font-black uppercase tracking-widest text-text-main mb-8 flex items-center gap-2">
                       <PieIcon size={16} className="text-warning" />
                       Content Saturation
                    </h3>
                    <div className="flex-1 flex items-center justify-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Completed', value: completedLessons.length },
                              { name: 'Incomplete', value: totalLessons - completedLessons.length }
                            ]}
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill="#00f0ff" />
                            <Cell fill="rgba(255,255,255,0.05)" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-4xl font-black text-text-main">{progressPercent}%</span>
                         <span className="text-[10px] text-text-muted font-black uppercase tracking-widest">Mastered</span>
                      </div>
                    </div>
                  </div>

                  {/* Module Breakdown Bar Chart */}
                  <div className="bg-black/5 dark:bg-white/2 border border-black/10 dark:border-white/5 p-8 rounded-2xl h-[400px] flex flex-col">
                    <h3 className="text-sm font-black uppercase tracking-widest text-text-main mb-8 flex items-center gap-2">
                       <BarChart2 size={16} className="text-warning" />
                       Module Intelligence
                    </h3>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={course.modules.map(m => {
                            const completed = m.lessons.filter(l => completedLessons.includes(l.id)).length;
                            return {
                              name: m.title.split(' ')[0], // e.g., "Week-1" or "Module"
                              completed: completed,
                              remaining: m.lessons.length - completed,
                              total: m.lessons.length
                            };
                          })}
                        >
                          <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#0A0A0B', 
                              border: '1px solid rgba(255,255,255,0.1)', 
                              borderRadius: '8px',
                              fontSize: '10px',
                              fontFamily: 'inherit'
                            }}
                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                          />
                          <Bar 
                            dataKey="completed" 
                            stackId="a"
                            fill="#00f0ff" 
                            radius={[0, 0, 0, 0]} 
                            name="Mastered"
                          />
                          <Bar 
                            dataKey="remaining" 
                            stackId="a"
                            fill="rgba(255,255,255,0.05)" 
                            radius={[4, 4, 0, 0]} 
                            name="Pending"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Growth/Engagement Area Chart (Mock Data) */}
                <div className="bg-black/5 dark:bg-white/2 border border-black/10 dark:border-white/5 p-8 rounded-2xl h-[300px] flex flex-col">
                    <h3 className="text-sm font-black uppercase tracking-widest text-text-main mb-8 flex items-center gap-2">
                       <Activity size={16} className="text-warning" />
                       Investigation Intensity
                    </h3>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={[
                            { day: 'Mon', activity: 20 },
                            { day: 'Tue', activity: 45 },
                            { day: 'Wed', activity: 30 },
                            { day: 'Thu', activity: 70 },
                            { day: 'Fri', activity: 40 },
                            { day: 'Sat', activity: 100 },
                            { day: 'Sun', activity: 85 }
                          ]}
                        >
                          <defs>
                            <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="day" hide />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0A0A0B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          />
                          <Area type="monotone" dataKey="activity" stroke="#00f0ff" fillOpacity={1} fill="url(#colorActivity)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                </div>
              </div>

              <div className="p-8 border-t border-black/10 dark:border-white/5 bg-base/50 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-warning/30 p-1">
                       <div className="w-full h-full bg-warning rounded-full" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Verification Status</p>
                       <p className="text-xs font-bold text-text-main">Forensic Document Certified</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => setShowProgressModal(false)}
                  className="bg-warning text-crust px-8 py-3 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-warning/90 transition-all"
                >
                  Return to Case
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
         <button 
          onClick={() => setShowSettings(true)}
          className="w-12 h-12 bg-warning text-crust rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-110 active:scale-95 group"
         >
            <Settings size={20} />
            <span className="absolute right-full mr-3 bg-base border border-black/10 dark:border-white/10 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest text-text-main opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Investigation Settings</span>
         </button>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-base/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-black/10 dark:border-white/10 w-full max-w-md rounded-2xl p-8 relative z-10 shadow-2xl"
            >
              <h3 className="text-xl font-heading font-black text-text-main uppercase tracking-tight mb-6 flex items-center gap-3">
                 <Settings size={22} className="text-warning" />
                 Forensic Console Config
              </h3>
              
              <div className="space-y-6">
                 <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/2 rounded-xl border border-black/10 dark:border-white/5">
                    <div>
                       <p className="text-sm font-bold text-text-main uppercase tracking-wider">Auto-Play Next</p>
                       <p className="text-[10px] text-text-muted">Automatically transition to the next case file</p>
                    </div>
                    <div className="w-10 h-5 bg-warning rounded-full relative">
                       <div className="absolute right-1 top-1 bottom-1 aspect-square bg-crust rounded-full" />
                    </div>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/2 rounded-xl border border-black/10 dark:border-white/5">
                    <div>
                       <p className="text-sm font-bold text-text-main uppercase tracking-wider">Video Resolution</p>
                       <p className="text-[10px] text-text-muted">High-definition forensic scan (1080p)</p>
                    </div>
                    <div className="text-[10px] font-black text-warning bg-warning/10 px-2 py-1 rounded">AUTO</div>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/2 rounded-xl border border-black/10 dark:border-white/5">
                    <div>
                       <p className="text-sm font-bold text-text-main uppercase tracking-wider">Subtitle Stream</p>
                       <p className="text-[10px] text-text-muted">English investigation transcripts</p>
                    </div>
                    <div className="w-10 h-5 bg-black/5 dark:bg-white/10 rounded-full relative">
                       <div className="absolute left-1 top-1 bottom-1 aspect-square bg-black/5 dark:bg-white/30 rounded-full" />
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full mt-8 py-3 bg-warning text-crust font-black uppercase tracking-widest rounded-xl hover:bg-warning/90 transition-all text-xs"
              >
                Apply Adjustments
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
