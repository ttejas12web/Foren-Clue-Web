import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Save, Image as ImageIcon, BookOpen, Clock, CheckCircle, ChevronRight, Pencil, Heart, MessageSquare, Award, Target, Trophy, Phone, GraduationCap, Calendar, School, LogOut } from 'lucide-react';
import { doc, getDoc, setDoc, query, collection, where, getDocs, orderBy, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '@/lib/firebase';
import { COURSES } from '@/constants';
import { EvidenceMarker } from '@/components/ui/EvidenceMarker';
import { UserBadge } from '@/components/ui/UserBadge';
import { getNextBadge } from '@/lib/badge-utils';

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();
  const [targetProfile, setTargetProfile] = useState<any>(null);
  const [userDoubts, setUserDoubts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isOwnProfile = !userId || userId === user?.uid;

  const [form, setForm] = useState({
    displayName: '',
    photoURL: '',
    mobileNumber: '',
    universityName: '',
    studyingYear: '',
    educationLevel: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  useEffect(() => {
    const uid = userId || user?.uid;
    if (!uid) return;

    setLoading(true);
    const userRef = doc(db, 'users', uid);
    
    const unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTargetProfile(data);
        if (isOwnProfile) {
          setForm({
            displayName: data.displayName || user?.displayName || '',
            photoURL: data.photoURL || user?.photoURL || '',
            mobileNumber: data.mobileNumber || '',
            universityName: data.universityName || '',
            studyingYear: data.studyingYear || '',
            educationLevel: data.educationLevel || ''
          });
        }
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      setLoading(false);
    });

    // Fetch user's doubts
    const doubtsPath = 'doubts';
    const q = query(
      collection(db, doubtsPath), 
      where('authorId', '==', uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeDoubts = onSnapshot(q, (querySnapshot) => {
      setUserDoubts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, doubtsPath);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeDoubts();
    };
  }, [userId, user]);

  const requestUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaveConfirm(true);
  };

  const executeUpdateProfile = async () => {
    if (!user) return;

    setShowSaveConfirm(false);
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: form.displayName,
        photoURL: form.photoURL,
        mobileNumber: form.mobileNumber,
        universityName: form.universityName,
        studyingYear: form.studyingYear,
        educationLevel: form.educationLevel,
        updatedAt: serverTimestamp()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  const currentProfile = isOwnProfile ? userProfile : targetProfile;

  if (loading && !isOwnProfile) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-warning border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user && !userId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-surface p-8 border border-black/10 dark:border-white/10 rounded-lg text-center max-w-md w-full">
          <BookOpen size={48} className="mx-auto text-warning mb-4" />
          <h2 className="text-2xl font-heading font-black mb-2 uppercase">Please Login</h2>
          <p className="text-text-muted mb-6">You need to be signed in to view your profile and course progress.</p>
        </div>
      </div>
    );
  }

  const purchasedCourses = COURSES.filter(course => 
    userProfile?.purchasedCourses?.includes(course.id)
  );

  const wishlistedCourses = COURSES.filter(course =>
    userProfile?.progress?.wishlist?.includes(course.id) && !userProfile?.purchasedCourses?.includes(course.id)
  );

  return (
    <div className="py-20 px-4 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Column: Personal Info Editing */}
        <div className="lg:w-1/3">
          <h1 className="text-3xl font-heading font-black mb-8 uppercase tracking-tight">
            {isOwnProfile ? 'My' : 'Investigator'} <span className="text-warning">Profile</span>
          </h1>
          
          <div className="bg-surface border border-black/10 dark:border-white/5 p-6 rounded-lg shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-warning/5 rotate-45 translate-x-12 -translate-y-12 transition-transform group-hover:translate-x-10 group-hover:-translate-y-10" />
            
            <div className="flex flex-col items-center mb-8 relative">
              <div 
                className={`w-24 h-24 rounded-full border-2 border-warning/30 p-1 mb-4 relative group/avatar overflow-hidden ${isOwnProfile ? 'cursor-pointer' : ''}`}
                onClick={() => isOwnProfile && setIsEditingPhoto(!isEditingPhoto)}
              >
                <img 
                  src={currentProfile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${currentProfile?.displayName || user?.displayName}`} 
                  alt={currentProfile?.displayName || user?.displayName || 'User'} 
                  className="w-full h-full rounded-full object-cover transition-transform group-hover/avatar:scale-110" 
                />
                {isOwnProfile && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                     <Pencil size={20} className="text-text-main mb-1" />
                     <span className="text-[8px] text-text-main font-bold uppercase tracking-widest">Change</span>
                  </div>
                )}
              </div>
              <h2 className="text-xl font-heading font-bold text-text-main mb-1 text-center">{currentProfile?.displayName || user?.displayName || 'Anonymous Investigator'}</h2>
              {isOwnProfile && <p className="text-xs text-text-muted uppercase tracking-widest mb-4">{currentProfile?.email || user?.email}</p>}
              
              <UserBadge 
                doubtsCount={currentProfile?.doubtsCount || 0} 
                commentsCount={currentProfile?.commentsCount || 0} 
                size="md"
              />

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {currentProfile?.achievementTags?.filter((tag: string) => tag !== 'Forensic Novice').map((tag: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-warning/10 border border-warning/20 text-warning text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                    <Award size={10} /> {tag}
                  </span>
                ))}
              </div>
            </div>

          {/* Badge Progress Section (for own profile) */}
          {isOwnProfile && (
            <div className="mt-8 bg-surface border border-black/10 dark:border-white/5 p-6 rounded-lg">
              <h3 className="text-xs font-black text-text-main uppercase tracking-widest mb-6 flex items-center gap-2">
                <Target size={16} className="text-warning" />
                Rank Progress
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-base/50 p-4 rounded-lg border border-black/10 dark:border-white/5">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Cases Filed</p>
                  <p className="text-xl font-black text-warning mt-1">{currentProfile?.doubtsCount || 0}</p>
                </div>
                <div className="bg-base/50 p-4 rounded-lg border border-black/10 dark:border-white/5">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Expert Responses</p>
                  <p className="text-xl font-black text-warning mt-1">{currentProfile?.commentsCount || 0}</p>
                </div>
              </div>

              {(() => {
                const doubts = currentProfile?.doubtsCount || 0;
                const comments = currentProfile?.commentsCount || 0;
                const total = doubts + comments;
                const badges = [
                  { name: 'Forensic Novice', threshold: 0, level: 1 },
                  { name: 'Doubt Scout', threshold: 5, level: 2 },
                  { name: 'Community Sentry', threshold: 15, level: 3 },
                  { name: 'Doubt Hero', threshold: 30, level: 4 },
                  { name: 'Doubt Master', threshold: 60, level: 5 },
                  { name: 'Forensic Legend', threshold: 100, level: 6 }
                ];
                
                const currentBadge = [...badges].reverse().find(b => total >= b.threshold) || badges[0];
                const nextBadge = badges.find(b => b.level === currentBadge.level + 1);
                
                if (!nextBadge) {
                  return (
                    <div className="text-center p-4 bg-warning/5 border border-warning/20 rounded-lg">
                      <Trophy size={24} className="mx-auto text-warning mb-2" />
                      <p className="text-xs font-bold text-text-main uppercase tracking-widest">Maximum Rank Achieved!</p>
                      <p className="text-[10px] text-text-muted mt-1 uppercase tracking-tighter">You are a Forensic Legend.</p>
                    </div>
                  );
                }

                const progress = Math.min(100, (total / nextBadge.threshold) * 100);
                const remaining = nextBadge.threshold - total;

                return (
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Next Rank: <span className="text-text-main">{nextBadge.name}</span></p>
                      <p className="text-[10px] font-bold text-warning uppercase tracking-widest">{remaining} more activities</p>
                    </div>
                    <div className="h-2 bg-base rounded-full overflow-hidden border border-black/10 dark:border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-warning shadow-[0_0_10px_rgba(251,191,36,0.3)] shadow-warning"
                      />
                    </div>
                    <p className="text-[9px] text-text-muted uppercase tracking-tighter text-center">Contribute more to unlock higher expert status</p>
                  </div>
                );
              })()}
            </div>
          )}

          {isOwnProfile ? (
            <form onSubmit={requestUpdateProfile} className="space-y-4 relative">
              {isEditingPhoto && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-base/50 p-4 border border-warning/20 rounded-md mb-4"
                >
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-warning mb-2 ml-1">Update Photo URL</label>
                  <div className="relative">
                    <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warning/50" />
                    <input 
                      type="text" 
                      value={form.photoURL}
                      onChange={(e) => setForm({ ...form, photoURL: e.target.value })}
                      className="w-full bg-base border border-black/10 dark:border-white/10 rounded-md py-2 pl-10 pr-4 text-xs focus:border-warning/50 focus:outline-none transition-colors"
                      placeholder="Paste image URL here..."
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsEditingPhoto(false)}
                    className="w-full mt-2 text-[8px] font-bold uppercase tracking-widest text-text-muted hover:text-text-main transition-colors"
                  >
                    Close
                  </button>
                </motion.div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1 ml-1">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warning/50" />
                  <input 
                    type="text" 
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    className="w-full bg-base border border-black/10 dark:border-white/10 rounded-md py-2.5 pl-10 pr-4 text-sm focus:border-warning/50 focus:outline-none transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1 ml-1">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/20" />
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="w-full bg-base/50 border border-black/10 dark:border-white/5 rounded-md py-2.5 pl-10 pr-4 text-sm text-text-muted cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1 ml-1">Mobile Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warning/50" />
                  <input 
                    type="tel" 
                    value={form.mobileNumber}
                    onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                    className="w-full bg-base border border-black/10 dark:border-white/10 rounded-md py-2.5 pl-10 pr-4 text-sm focus:border-warning/50 focus:outline-none transition-colors"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1 ml-1">University Name *</label>
                <div className="relative">
                  <School size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warning/50" />
                  <input 
                    type="text" 
                    required
                    value={form.universityName}
                    onChange={(e) => setForm({ ...form, universityName: e.target.value })}
                    className="w-full bg-base border border-black/10 dark:border-white/10 rounded-md py-2.5 pl-10 pr-4 text-sm focus:border-warning/50 focus:outline-none transition-colors"
                    placeholder="Enter university name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1 ml-1">Studying Year *</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warning/50" />
                  <input 
                    type="text" 
                    required
                    value={form.studyingYear}
                    onChange={(e) => setForm({ ...form, studyingYear: e.target.value })}
                    className="w-full bg-base border border-black/10 dark:border-white/10 rounded-md py-2.5 pl-10 pr-4 text-sm focus:border-warning/50 focus:outline-none transition-colors"
                    placeholder="e.g. 2nd Year"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1 ml-1">Education Level *</label>
                <div className="relative">
                  <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warning/50" />
                  <select
                    required
                    value={form.educationLevel}
                    onChange={(e) => setForm({ ...form, educationLevel: e.target.value })}
                    className="w-full bg-base border border-black/10 dark:border-white/10 rounded-md py-2.5 pl-10 pr-4 text-sm focus:border-warning/50 focus:outline-none transition-colors appearance-none"
                  >
                    <option value="" disabled>Select level</option>
                    <option value="UG">Under Graduation (UG)</option>
                    <option value="PG">Post Graduation (PG)</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSaving}
                className="w-full mt-4 bg-warning text-crust font-black uppercase tracking-widest py-3 rounded-md hover:bg-warning-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-crust border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>

              {saveSuccess && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-success text-xs font-bold uppercase tracking-tighter mt-2"
                >
                  Profile updated successfully!
                </motion.p>
              )}
            </form>
            ) : (
              <div className="space-y-4">
                 <div className="p-5 bg-base/50 rounded-lg border border-black/10 dark:border-white/5 text-left">
                   {currentProfile?.mobileNumber && (
                     <div className="mb-4 pb-4 border-b border-black/10 dark:border-white/5">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-warning flex items-center gap-2 mb-1"><Phone size={14}/> Mobile Number</p>
                       <p className="text-sm font-medium text-text-main pl-6">{currentProfile.mobileNumber}</p>
                     </div>
                   )}
                   {currentProfile?.universityName && (
                     <div className="mb-4 pb-4 border-b border-black/10 dark:border-white/5">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-warning flex items-center gap-2 mb-1"><School size={14}/> University</p>
                       <p className="text-sm font-medium text-text-main pl-6">{currentProfile.universityName}</p>
                     </div>
                   )}
                   {currentProfile?.educationLevel && (
                     <div className="mb-4 pb-4 border-b border-black/10 dark:border-white/5">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-warning flex items-center gap-2 mb-1"><GraduationCap size={14}/> Education</p>
                       <p className="text-sm font-medium text-text-main pl-6">{currentProfile.educationLevel} <span className="text-text-muted text-xs ml-1">{currentProfile.studyingYear ? `• ${currentProfile.studyingYear}` : ''}</span></p>
                     </div>
                   )}
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted text-center mt-2">Member Since</p>
                    <p className="text-sm font-medium text-text-main mt-1 text-center">
                      {currentProfile?.createdAt ? new Date(currentProfile.createdAt.toDate ? currentProfile.createdAt.toDate() : currentProfile.createdAt).toLocaleDateString() : 'Detective Early Days'}
                    </p>
                 </div>
                 <Link to="/community" className="w-full bg-black/5 dark:bg-white/5 text-text-main font-black uppercase tracking-widest py-3 rounded-md hover:bg-warning hover:text-crust transition-all flex items-center justify-center gap-2">
                    <MessageSquare size={16} /> Contact in Commmunity
                 </Link>
              </div>
            )}
            
            {isOwnProfile && (
              <button 
                onClick={async () => {
                  await logout();
                  navigate('/');
                }}
                className="w-full mt-4 bg-transparent border border-red-500/30 text-red-500 font-bold uppercase tracking-widest py-3 rounded-md hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Log Out
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Content */}
        <div className="lg:w-2/3">
          {isOwnProfile && (
            <>
              <h2 className="text-3xl font-heading font-black mb-8 uppercase tracking-tight">
                My <span className="text-warning">Learning</span>
              </h2>
              {/* Existing Learning UI */}

          <div className="space-y-6">
            {purchasedCourses.length > 0 ? (
              purchasedCourses.map((course, idx) => {
                const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
                const completedLessons = userProfile?.progress?.[course.id] || [];
                const progress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
                
                return (
                  <motion.div 
                    key={course.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-surface border border-black/10 dark:border-white/5 p-6 rounded-lg hover:border-warning/30 transition-colors group relative overflow-hidden"
                  >
                    <Link to={`/player/${course.id}`} className="absolute inset-0 z-20" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <EvidenceMarker number={course.id < 10 ? `0${course.id}` : course.id} className="scale-75 group-hover:rotate-12 transition-transform" />
                        <div>
                          <h3 className="font-heading font-bold text-lg text-text-main group-hover:text-warning transition-colors">{course.title}</h3>
                          <p className="text-xs text-text-muted mt-1 uppercase tracking-widest">{course.instructor} • {course.duration}</p>
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end gap-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock size={14} className="text-warning" />
                          <span className="text-xs font-bold text-text-main uppercase tracking-tighter">Progress: {progress}%</span>
                        </div>
                        <div className="w-full md:w-48 h-1.5 bg-base rounded-full overflow-hidden border border-black/10 dark:border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-warning"
                          />
                        </div>
                        <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-warning hover:text-text-main mt-1 transition-colors">
                          Continue Learning <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Decorative watermark */}
                    <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                      <BookOpen size={120} />
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="bg-surface/50 border border-dashed border-black/10 dark:border-white/10 p-12 rounded-lg text-center">
                <BookOpen size={48} className="mx-auto text-text-main/10 mb-4" />
                <h3 className="text-xl font-heading font-bold text-text-muted mb-2">No Courses Yet</h3>
                <p className="text-sm text-text-muted max-w-xs mx-auto mb-6">You haven't enrolled in any courses. Explore our catalog to start your forensic journey.</p>
                <a 
                  href="/courses" 
                  className="inline-flex items-center gap-2 bg-black/5 dark:bg-white/5 px-6 py-3 border border-black/10 dark:border-white/10 rounded-md text-sm font-bold uppercase tracking-widest hover:bg-warning hover:text-crust transition-all duration-300"
                >
                  Browse Courses
                </a>
              </div>
            )}
          </div>
          </>
          )}

          <div className="mt-16">
            <h2 className="text-3xl font-heading font-black mb-8 uppercase tracking-tight">
              {isOwnProfile ? 'My' : 'Community'} <span className="text-warning">Inquiries</span>
            </h2>
            <div className="space-y-6">
              {userDoubts.length > 0 ? (
                userDoubts.map((doubt, idx) => (
                  <motion.div
                    key={doubt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-surface border border-black/10 dark:border-white/5 p-6 rounded-xl hover:border-warning/30 transition-colors"
                  >
                    <Link to="/community" className="group">
                      <h3 className="font-heading font-bold text-lg text-text-main group-hover:text-warning transition-colors mb-2 uppercase">{doubt.title}</h3>
                      <p className="text-sm text-text-muted line-clamp-2 mb-4">{doubt.content}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-warning flex items-center gap-1">
                          <Clock size={12} /> {new Date(doubt.createdAt?.toDate?.() || doubt.createdAt).toLocaleDateString()}
                        </span>
                        {doubt.imageUrl && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-1">
                            <ImageIcon size={12} /> Evidence attached
                          </span>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="bg-surface/30 border border-dashed border-black/10 dark:border-white/10 p-12 rounded-xl text-center">
                  <MessageSquare size={32} className="mx-auto text-text-main/5 mb-4" />
                  <p className="text-sm text-text-muted uppercase tracking-widest">No inquiries filed yet.</p>
                </div>
              )}
            </div>
          </div>
          
          {isOwnProfile && (
            <>
              {/* Wishlist Section */}
          <div className="mt-12 mb-12">
            <h3 className="text-2xl font-heading font-black mb-6 uppercase tracking-tight flex items-center gap-3">
              <Heart size={24} className="text-warning" />
              Wishlist
            </h3>
            <div className="space-y-4">
              {wishlistedCourses.length > 0 ? (
                wishlistedCourses.map((course, idx) => (
                  <motion.div 
                    key={course.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-surface border border-black/10 dark:border-white/5 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden group hover:border-warning/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 bg-black rounded overflow-hidden">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-text-main group-hover:text-warning transition-colors">{course.title}</h4>
                        <p className="text-[10px] text-text-muted mt-0.5 uppercase tracking-widest">{course.instructor} • {course.duration}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Link 
                        to={`/courses?id=${course.id}`}
                        className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded text-xs font-bold uppercase tracking-widest hover:bg-warning hover:border-warning hover:text-crust transition-all whitespace-nowrap"
                      >
                        View Course
                      </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-surface/30 border border-dashed border-black/10 dark:border-white/10 p-6 rounded-lg text-center">
                  <Heart size={24} className="mx-auto text-text-main/10 mb-2" />
                  <p className="text-xs text-text-muted uppercase tracking-widest">Your wishlist is empty.</p>
                </div>
              )}
            </div>
          </div>
          </>
          )}

          {/* Achievement Badges Section (Optional extra value) */}
          <div className="mt-12">
             <h3 className="text-xl font-heading font-black mb-6 uppercase tracking-tight flex items-center gap-3">
              <CheckCircle size={24} className="text-warning" />
              Achievements
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               {[
                 { name: 'Enrolled', desc: 'Started Journey', active: purchasedCourses.length > 0 },
                 { name: 'Fast Learner', desc: 'Completed 1 Course', active: false },
                 { name: 'Case Master', desc: 'Solved 5 Cases', active: false },
                 { name: 'Contributor', desc: 'Community Active', active: true }
               ].map((badge, i) => (
                 <div key={i} className={`p-4 rounded-lg border text-center transition-all ${
                   badge.active 
                    ? 'bg-warning/5 border-warning/20 opacity-100 grayscale-0' 
                    : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/5 opacity-40 grayscale select-none'
                 }`}>
                   <div className={`w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center ${
                     badge.active ? 'bg-warning text-crust' : 'bg-black/5 dark:bg-white/10 text-text-main/50'
                   }`}>
                     <CheckCircle size={20} strokeWidth={3} />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-tighter text-text-main">{badge.name}</p>
                   <p className="text-[8px] uppercase tracking-widest text-text-muted mt-1">{badge.desc}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSaveConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-crust/80 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-black/10 dark:border-white/10 p-6 max-w-md w-full rounded-xl shadow-2xl relative"
            >
              <h3 className="text-xl font-heading font-black uppercase text-text-main mb-2 tracking-tight">Confirm Changes</h3>
              <p className="text-sm text-text-muted mb-6">Are you sure you want to save these profile changes? This action cannot be undone.</p>
              
              <div className="flex items-center gap-3 justify-end mt-4">
                <button 
                  type="button"
                  onClick={() => setShowSaveConfirm(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-text-muted hover:text-text-main transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={executeUpdateProfile}
                  disabled={isSaving}
                  className="bg-warning text-crust px-4 py-2 rounded text-xs font-black uppercase tracking-widest hover:bg-warning-dark disabled:opacity-50 transition-colors"
                >
                  {isSaving ? "Saving..." : "Confirm & Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
