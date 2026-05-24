import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { 
  MessageSquare, 
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  deleteDoc,
  updateDoc,
  increment,
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { PostCard } from './Community';

interface Doubt {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  createdAt: any;
}

export default function MyDoubts() {
  const { user, loading: authLoading } = useAuth();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/profile');
      return;
    }

    if (user) {
      const doubtsPath = 'doubts';
      const q = query(
        collection(db, doubtsPath), 
        where('authorId', '==', user.uid)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Doubt[];
        
        // Client-side sort to avoid requiring a composite index
        docs.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        });
        
        setDoubts(docs);
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, doubtsPath);
      });

      return () => unsubscribe();
    }
  }, [user, authLoading, navigate]);

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-base flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-warning animate-spin" />
        <p className="text-text-muted font-bold uppercase tracking-widest text-xs">Retrieving Your Cases...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <Link 
            to="/community" 
            className="inline-flex items-center gap-2 text-text-muted hover:text-warning transition-colors mb-6 font-bold uppercase tracking-widest text-xs"
          >
            <ChevronLeft size={16} strokeWidth={3} /> Back to Community
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-black uppercase tracking-tight text-text-main">
                My <span className="text-warning">Queries</span>
              </h1>
              <p className="text-text-muted mt-2 font-medium">Track and manage all forensic doubts you've shared with the community.</p>
            </div>
          </div>
        </header>

        <div className="space-y-8">
          {doubts.length === 0 ? (
            <div className="bg-surface border border-dashed border-black/10 dark:border-white/10 p-16 rounded-2xl text-center">
              <MessageSquare size={48} className="mx-auto text-text-main/5 mb-4" />
              <h3 className="text-xl font-heading font-bold text-text-muted mb-2 uppercase">No cases filed yet</h3>
              <p className="text-sm text-text-muted max-w-xs mx-auto mb-8">You haven't posted any doubts to the community feed yet.</p>
              <Link 
                to="/community" 
                className="inline-block bg-warning text-crust px-8 py-4 font-black uppercase tracking-widest rounded-lg transition-transform hover:scale-105"
              >
                Start an Inquiry
              </Link>
            </div>
          ) : (
            doubts.map((doubt) => (
              <PostCard 
                key={doubt.id} 
                doubt={doubt} 
                isOwner={true}
                onDelete={() => handleDeleteDoubt(doubt.id)}
                onReport={() => handleReport(doubt.id, 'doubt')}
                onReportComment={(id) => handleReport(id, 'comment')}
                isDeleting={isDeleting === doubt.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
