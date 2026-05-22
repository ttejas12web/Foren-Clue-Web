import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Send, 
  MoreVertical, 
  Trash2, 
  User as UserIcon,
  Search,
  Plus,
  X,
  Loader2,
  Calendar,
  Award,
  Flag,
  Heart,
  CheckCircle,
  Tag
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  setDoc,
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  serverTimestamp,
  getDocs,
  increment,
  updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, OperationType, handleFirestoreError } from '@/lib/firebase';
import { compressImage } from '@/lib/image-utils';
import { Link, useNavigate } from 'react-router-dom';
import { UserBadge, UserBadgeCompact } from '@/components/ui/UserBadge';

interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  createdAt: any;
}

interface Doubt {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  createdAt: any;
  category?: string;
  likes?: string[];
  resolved?: boolean;
}

const FORENSIC_CATEGORIES = [
  "General",
  "DNA Analysis",
  "Fingerprinting",
  "Digital Forensics",
  "Ballistics",
  "Crime Scene Investigation",
  "Toxicology"
];

export default function Community() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [postingStatus, setPostingStatus] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Create doubt form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState(FORENSIC_CATEGORIES[0]);

  const handlePostDoubtClick = () => {
    if (!user) {
      navigate('/profile');
      return;
    }
    setShowCreateModal(true);
  };

  const handleCheckMyDoubtsClick = () => {
    if (!user) {
      navigate('/profile');
      return;
    }
    navigate('/community/my-doubts');
  };

  useEffect(() => {
    const doubtsPath = 'doubts';
    const q = query(collection(db, doubtsPath), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Doubt[];
      setDoubts(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, doubtsPath);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!newTitle && !newContent)) return;

    setIsPosting(true);
    setPostError(null);
    setPostingStatus('Filing case...');

    try {
      console.log("Creating doubtRef...");
      const doubtRef = doc(collection(db, 'doubts'));
      const id = doubtRef.id;
      
      console.log("Setting document data...");
      await setDoc(doubtRef, {
        id,
        title: newTitle,
        content: newContent,
        category: newCategory,
        authorId: user.uid,
        authorName: userProfile?.displayName || user.displayName || 'Anonymous',
        authorPhoto: userProfile?.photoURL || user.photoURL || '',
        createdAt: serverTimestamp(),
        likes: [],
        resolved: false
      });
      console.log("Document created successfully.");

      // Increment user's doubtsCount
      try {
        console.log("Updating doubtsCount...");
        await updateDoc(doc(db, 'users', user.uid), {
          doubtsCount: increment(1)
        });
        console.log("doubtsCount updated.");
      } catch (err) {
        console.warn("Failed to increment doubtsCount:", err);
      }

      setNewTitle('');
      setNewContent('');
      setNewCategory(FORENSIC_CATEGORIES[0]);
      setShowCreateModal(false);
    } catch (error: any) {
      console.error('Error creating post:', error);
      setPostError(error.message || "Failed to post doubt. Please try again.");
    } finally {
      setIsPosting(false);
      setPostingStatus(null);
    }
  };

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteDoubt = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this forensic query permanently? This action cannot be undone.')) {
      setIsDeleting(id);
      console.log(`Attempting to delete doubt: ${id}`);
      const path = `doubts/${id}`;
      try {
        await deleteDoc(doc(db, 'doubts', id));
        
        // Decrement user's doubtsCount
        if (user) {
          try {
            await updateDoc(doc(db, 'users', user.uid), {
              doubtsCount: increment(-1)
            });
          } catch (err) {
            console.warn("Failed to decrement doubtsCount:", err);
          }
        }
        
        console.log(`Doubt ${id} deleted successfully`);
      } catch (error: any) {
        console.error('Delete error:', error);
        if (error.code === 'permission-denied') {
          alert('You do not have permission to delete this case. Only the original reporter can remove it.');
        } else {
          alert(`Failed to delete the case: ${error.message || 'Unknown error'}`);
        }
        handleFirestoreError(error, OperationType.DELETE, path);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleReport = async (targetId: string, targetType: 'doubt' | 'comment') => {
    if (!user) {
      navigate('/login');
      return;
    }

    const reason = window.prompt(`Why are you reporting this ${targetType}? (e.g., Spam, Harassment, Misinformation)`);
    
    if (reason !== null) {
      try {
        const reportRef = doc(collection(db, 'reports'));
        await setDoc(reportRef, {
          id: reportRef.id,
          targetId,
          targetType,
          reporterId: user.uid,
          reason: reason || 'No reason specified',
          createdAt: serverTimestamp()
        });
        alert('Report filed successfully. Our forensic experts will review the content.');
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'reports');
      }
    }
  };

  const handleLike = async (doubtId: string, currentLikes: string[]) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const hasLiked = currentLikes?.includes(user.uid);
    const newLikes = hasLiked 
      ? (currentLikes || []).filter(id => id !== user.uid)
      : [...(currentLikes || []), user.uid];
      
    try {
      await updateDoc(doc(db, 'doubts', doubtId), { likes: newLikes });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `doubts/${doubtId}`);
    }
  };

  const handleResolve = async (doubtId: string, currentResolved: boolean) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'doubts', doubtId), { resolved: !currentResolved });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `doubts/${doubtId}`);
    }
  };

  const myDoubtsCount = user ? doubts.filter(d => d.authorId === user.uid).length : 0;

  const filteredDoubts = doubts.filter(d => {
    if (activeCategory !== 'All' && d.category !== activeCategory) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!d.title.toLowerCase().includes(q) && !d.content.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-base py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-black uppercase tracking-tight text-text-main flex items-center gap-3">
              Forensic <span className="text-warning">Community</span>
            </h1>
            <p className="text-text-muted mt-2 font-medium">Solve doubts, share evidence, and collaborate with experts.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCheckMyDoubtsClick}
              className="bg-black/5 dark:bg-white/5 text-text-main px-6 py-3 font-black uppercase tracking-widest rounded-lg flex items-center gap-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:bg-white/10 transition-colors group"
            >
              <MessageSquare size={18} /> 
              <span>My Doubts</span>
              {user && (
                <span className="ml-1 bg-black/5 dark:bg-white/10 group-hover:bg-warning group-hover:text-crust transition-colors text-[10px] font-black px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10 group-hover:border-warning">
                  {myDoubtsCount}
                </span>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePostDoubtClick}
              className="bg-warning text-crust px-6 py-3 font-black uppercase tracking-widest rounded-lg flex items-center gap-2 shadow-lg shadow-warning/20 border border-warning"
            >
              <Plus size={20} strokeWidth={3} /> Post Doubt
            </motion.button>
          </div>
        </header>

        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Search cases, topics, or evidence..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-text-main placeholder:text-text-muted focus:border-warning/50 focus:outline-none transition-colors"
              />
            </div>
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="bg-surface border border-black/10 dark:border-white/10 rounded-xl px-6 py-4 text-text-main focus:border-warning/50 focus:outline-none transition-colors appearance-none min-w-[200px]"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              <option value="All">All Categories</option>
              {FORENSIC_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setActiveCategory('All')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${activeCategory === 'All' ? 'bg-warning text-crust' : 'bg-surface border border-black/10 dark:border-white/10 text-text-muted hover:text-text-main'}`}
            >
              All Topics
            </button>
            {FORENSIC_CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${activeCategory === cat ? 'bg-warning text-crust' : 'bg-surface border border-black/10 dark:border-white/10 text-text-muted hover:text-text-main'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-warning animate-spin" />
            <p className="text-text-muted font-bold uppercase tracking-widest text-xs">Scanning Feed...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredDoubts.length === 0 ? (
              <div className="bg-surface border border-dashed border-black/10 dark:border-white/10 p-16 rounded-2xl text-center">
                <MessageSquare size={48} className="mx-auto text-text-main/5 mb-4" />
                <h3 className="text-xl font-heading font-bold text-text-muted mb-2 uppercase">No cases found</h3>
                <p className="text-sm text-text-muted max-w-xs mx-auto">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              filteredDoubts.map((doubt) => (
                <PostCard 
                  key={doubt.id} 
                  doubt={doubt} 
                  isOwner={user?.uid === doubt.authorId}
                  currentUserId={user?.uid}
                  onDelete={() => handleDeleteDoubt(doubt.id)}
                  onReport={() => handleReport(doubt.id, 'doubt')}
                  onReportComment={(commentId) => handleReport(commentId, 'comment')}
                  onLike={() => handleLike(doubt.id, doubt.likes || [])}
                  onResolve={() => handleResolve(doubt.id, doubt.resolved || false)}
                  isDeleting={isDeleting === doubt.id}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-base/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface border border-black/10 dark:border-white/10 p-8 rounded-2xl w-full max-w-xl relative shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-warning/5 rotate-45 translate-x-12 -translate-y-12" />
              
              <div className="flex items-center justify-between mb-8 relative">
                <h2 className="text-2xl font-heading font-black uppercase text-text-main tracking-widest">Post New <span className="text-warning">Query</span></h2>
                <button onClick={() => setShowCreateModal(false)} className="text-text-muted hover:text-text-main p-1">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateDoubt} className="space-y-6 relative">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-warning mb-2 ml-1">Case Title / Topic</label>
                  <input 
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-base border border-black/10 dark:border-white/10 rounded-lg py-3 px-4 text-text-main focus:border-warning/50 focus:outline-none transition-colors"
                    placeholder="e.g., Blood Spatter Pattern Analysis Inquiry"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-warning mb-2 ml-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-base border border-black/10 dark:border-white/10 rounded-lg py-3 px-4 text-text-main focus:border-warning/50 focus:outline-none transition-colors appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                  >
                    {FORENSIC_CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-base">{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-warning mb-2 ml-1">Evidence Details / Doubt</label>
                  <textarea 
                    required
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full bg-base border border-black/10 dark:border-white/10 rounded-lg py-3 px-4 text-text-main resize-none focus:border-warning/50 focus:outline-none transition-colors"
                    placeholder="Describe the case details or your specific question here..."
                  />
                </div>

                {postError && (
                  <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-xs font-bold uppercase tracking-widest text-center">
                    {postError}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    disabled={isPosting}
                    className="flex-1 bg-warning text-crust font-black uppercase tracking-widest py-4 rounded-lg hover:bg-warning-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isPosting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{postingStatus || 'Posting...'}</span>
                      </>
                    ) : (
                      <><Send size={18} strokeWidth={2.5} /> File Case</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PostCard({ 
  doubt, 
  isOwner, 
  currentUserId,
  onDelete, 
  onReport, 
  onReportComment, 
  onLike,
  onResolve,
  isDeleting 
}: { 
  doubt: Doubt, 
  isOwner: boolean, 
  currentUserId?: string,
  onDelete: () => void, 
  onReport: () => void, 
  onReportComment: (id: string) => void, 
  onLike?: () => void,
  onResolve?: () => void,
  isDeleting?: boolean 
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [authorStats, setAuthorStats] = useState({ doubts: 0, comments: 0 });

  useEffect(() => {
    const path = `doubts/${doubt.id}/comments`;
    const q = query(collection(db, 'doubts', doubt.id, 'comments'));
    const unsubscribe = onSnapshot(q, (snaps) => {
      setCommentsCount(snaps.size);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    // Fetch author stats for badge
    const unsubscribeAuthor = onSnapshot(doc(db, 'users', doubt.authorId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setAuthorStats({ 
          doubts: data.doubtsCount || 0, 
          comments: data.commentsCount || 0 
        });
      }
    });

    return () => {
      unsubscribe();
      unsubscribeAuthor();
    };
  }, [doubt.id, doubt.authorId]);

  const formatDate = (date: any) => {
    if (!date) return 'Just now';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <motion.article 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-surface border border-black/10 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl hover:border-warning/20 transition-all group relative ${
        doubt.imageUrl ? 'border-l-4 border-l-warning/40 shadow-warning/5' : ''
      }`}
    >
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${doubt.authorId}`} className="relative group/avatar">
              <div className="w-12 h-12 rounded-full border-2 border-warning/20 p-0.5 overflow-hidden">
                <img 
                  src={doubt.authorPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${doubt.authorName}`} 
                  alt={doubt.authorName} 
                  className="w-full h-full rounded-full object-cover grayscale group-hover/avatar:grayscale-0 transition-all"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 z-10">
                <UserBadgeCompact doubtsCount={authorStats.doubts} commentsCount={authorStats.comments} />
              </div>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link to={`/profile/${doubt.authorId}`} className="font-heading font-black text-text-main hover:text-warning transition-colors uppercase tracking-widest text-sm">
                  {doubt.authorName}
                </Link>
                <UserBadge doubtsCount={authorStats.doubts} commentsCount={authorStats.comments} size="xs" showLabel={false} />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Calendar size={12} className="text-text-muted" />
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">{formatDate(doubt.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isOwner && (
              <button 
                onClick={onReport}
                className="p-2 text-text-muted hover:text-warning transition-colors"
                title="Report Content"
              >
                <Flag size={18} />
              </button>
            )}
            {isOwner && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                disabled={isDeleting}
                className="flex items-center gap-2 px-3 py-1.5 border border-error/20 bg-error/5 text-error hover:bg-error/10 rounded-lg transition-all disabled:opacity-50 group/del"
                title="Delete Case Permanently"
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Delete Case</span>
                  </>
                )}
              </button>
            )}
            <button className="p-2 text-text-muted hover:text-text-main transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-2xl md:text-3xl font-heading font-black text-text-main uppercase tracking-tight leading-tight group-hover:text-warning transition-colors">
              {doubt.title}
            </h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {doubt.category && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                <Tag size={12} strokeWidth={2.5} />
                {doubt.category}
              </span>
            )}
            {doubt.imageUrl && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/10 border border-warning/20 text-[10px] font-black uppercase tracking-widest text-warning shadow-sm shadow-warning/10">
                <ImageIcon size={12} strokeWidth={3} />
                Evidence
              </span>
            )}
            {doubt.resolved && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-black uppercase tracking-widest text-green-400">
                <CheckCircle size={12} strokeWidth={3} />
                Resolved
              </span>
            )}
          </div>
          
          <p className="text-text-muted text-sm md:text-base leading-relaxed whitespace-pre-wrap">
            {doubt.content}
          </p>
        </div>

        {doubt.imageUrl && (
          <div className="mb-6 mt-4 rounded-xl overflow-hidden border border-black/10 dark:border-white/5 relative bg-base shadow-inner">
            <img 
              src={doubt.imageUrl} 
              alt="Evidence" 
              className="w-full h-auto max-h-[500px] object-contain mx-auto" 
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-black/10 dark:border-white/5 mt-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onLike}
              className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
                doubt.likes?.includes(currentUserId || '') ? 'text-red-500' : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Heart size={16} strokeWidth={doubt.likes?.includes(currentUserId || '') ? 3 : 2} className={doubt.likes?.includes(currentUserId || '') ? 'fill-current' : ''} />
              {doubt.likes?.length || 0}
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
                showComments ? 'text-warning' : 'text-text-muted hover:text-text-main'
              }`}
            >
              <MessageSquare size={16} strokeWidth={showComments ? 3 : 2} />
              {commentsCount} Responses
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            {isOwner && (
              <button 
                onClick={onResolve}
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                  doubt.resolved ? 'text-green-500 hover:text-text-main' : 'text-text-muted hover:text-green-500'
                }`}
              >
                {doubt.resolved ? 'Reopen Case' : 'Mark Resolved'}
              </button>
            )}
            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-warning transition-colors">
              Share
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-base/30 border-t border-black/10 dark:border-white/10"
          >
            <CommentSection doubtId={doubt.id} onReportComment={onReportComment} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function CommentSection({ doubtId, onReportComment }: { doubtId: string, onReportComment: (id: string) => void }) {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const path = `doubts/${doubtId}/comments`;
    const q = query(collection(db, 'doubts', doubtId, 'comments'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [doubtId]);

  const [isDeletingComment, setIsDeletingComment] = useState<string | null>(null);

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Delete this response?')) {
      setIsDeletingComment(commentId);
      try {
        await deleteDoc(doc(db, 'doubts', doubtId, 'comments', commentId));
        
        // Decrement user's commentsCount
        if (user) {
          try {
            await updateDoc(doc(db, 'users', user.uid), {
              commentsCount: increment(-1)
            });
          } catch (err) {
            console.warn("Failed to decrement commentsCount:", err);
          }
        }
      } catch (error: any) {
        console.error('Comment delete error:', error);
        handleFirestoreError(error, OperationType.DELETE, `doubts/${doubtId}/comments/${commentId}`);
      } finally {
        setIsDeletingComment(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const commentRef = doc(collection(db, 'doubts', doubtId, 'comments'));
      const id = commentRef.id;
      
      await setDoc(commentRef, {
        id,
        content: newComment,
        authorId: user.uid,
        authorName: userProfile?.displayName || user.displayName || 'Anonymous',
        authorPhoto: userProfile?.photoURL || user.photoURL || '',
        createdAt: serverTimestamp()
      });

      // Increment user's commentsCount
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          commentsCount: increment(1)
        });
      } catch (err) {
        console.warn("Failed to increment commentsCount:", err);
      }
      setNewComment('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `doubts/${doubtId}/comments`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            isAuthor={user?.uid === comment.authorId}
            onDelete={() => handleDeleteComment(comment.id)}
            onReport={() => onReportComment(comment.id)}
            isDeleting={isDeletingComment === comment.id}
          />
        ))}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-4 pt-4 border-t border-black/10 dark:border-white/5">
          <div className="flex-1 relative">
            <input 
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-full py-3 px-6 text-sm placeholder:text-text-muted/50 focus:border-warning/50 focus:outline-none transition-colors"
              placeholder="Add your expert opinion..."
            />
          </div>
          <button 
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="flex-shrink-0 w-12 h-12 bg-warning text-crust rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-warning/20 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={20} strokeWidth={2.5} />}
          </button>
        </form>
      ) : (
        <div className="p-4 bg-surface/30 border border-dashed border-black/10 dark:border-white/10 rounded-xl text-center">
          <button 
            onClick={() => navigate('/profile')}
            className="text-xs text-text-muted font-black uppercase tracking-widest hover:text-warning transition-colors"
          >
            Login to contribute to this case
          </button>
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment, isAuthor, onDelete, onReport, isDeleting }: { comment: Comment, isAuthor: boolean, onDelete: () => void, onReport: () => void, isDeleting: boolean }) {
  const [authorStats, setAuthorStats] = useState({ doubts: 0, comments: 0 });

  useEffect(() => {
    const unsubscribeAuthor = onSnapshot(doc(db, 'users', comment.authorId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setAuthorStats({ 
          doubts: data.doubtsCount || 0, 
          comments: data.commentsCount || 0 
        });
      }
    });
    return () => unsubscribeAuthor();
  }, [comment.authorId]);

  const formatDate = (date: any) => {
    if (!date) return 'Just now';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="flex gap-3 items-start">
      <Link to={`/profile/${comment.authorId}`} className="flex-shrink-0 relative group">
        <img 
          src={comment.authorPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.authorName}`} 
          alt={comment.authorName} 
          className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 grayscale hover:grayscale-0 transition-all"
        />
        <div className="absolute -bottom-1 -right-1 z-10 scale-75 origin-bottom-right">
          <UserBadgeCompact doubtsCount={authorStats.doubts} commentsCount={authorStats.comments} />
        </div>
      </Link>
      <div className="flex-1 bg-surface p-4 rounded-xl border border-black/10 dark:border-white/5 relative group/comment">
        <div className="absolute -left-2 top-4 w-4 h-4 bg-surface border-l border-b border-black/10 dark:border-white/5 rotate-45" />
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Link to={`/profile/${comment.authorId}`} className="text-xs font-black uppercase tracking-widest text-warning hover:text-text-main transition-colors">
              {comment.authorName}
            </Link>
            <UserBadge doubtsCount={authorStats.doubts} commentsCount={authorStats.comments} size="xs" showLabel={false} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">{formatDate(comment.createdAt)}</span>
            {isAuthor ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                disabled={isDeleting}
                className="text-text-muted hover:text-error transition-colors p-1 disabled:opacity-50"
                title="Delete response"
              >
                {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              </button>
            ) : (
              <button 
                onClick={onReport}
                className="text-text-muted hover:text-warning transition-colors p-1 opacity-0 group-hover/comment:opacity-100"
                title="Report response"
              >
                <Flag size={12} />
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-text-muted leading-relaxed">{comment.content}</p>
      </div>
    </div>
  );
}
