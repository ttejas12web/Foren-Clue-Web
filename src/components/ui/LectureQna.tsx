import React, { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Send, User, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QnaItem = ({ qna }: { qna: any }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [replyInput, setReplyInput] = useState("");
  const { user, userProfile } = useAuth();
  
  useEffect(() => {
    const commentsQ = query(
      collection(db, 'lectureQna', qna.id, 'comments'),
      orderBy('createdAt', 'asc')
    );
    
    const unsubs = onSnapshot(commentsQ, snap => {
      const coms: any[] = [];
      snap.forEach(d => {
        coms.push({ id: d.id, ...d.data() });
      });
      setComments(coms);
    });
    return () => unsubs();
  }, [qna.id]);
  
  const handleAddReply = async () => {
    if (!replyInput || !replyInput.trim() || !user) return;
    
    try {
      await addDoc(collection(db, 'lectureQna', qna.id, 'comments'), {
        content: replyInput.trim(),
        authorId: user.uid,
        authorName: userProfile?.displayName || 'User',
        createdAt: serverTimestamp()
      });
      setReplyInput("");
    } catch (err) {
      console.error("Failed to add reply", err);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!user || user.uid !== qna.authorId) return;
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteDoc(doc(db, 'lectureQna', qna.id));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDeleteComment = async (commentId: string, commentAuthorId: string) => {
    if (!user || user.uid !== commentAuthorId) return;
    if (confirm("Delete this reply?")) {
      try {
        await deleteDoc(doc(db, 'lectureQna', qna.id, 'comments', commentId));
      } catch (e) {
        console.error(e);
      }
    }
  };
  
  return (
    <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5 mb-4">
      <div className="flex justify-between items-start mb-2">
         <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center text-warning">
             <User size={14} />
           </div>
           <div>
             <p className="text-xs font-bold text-text-main">{qna.authorName}</p>
             <p className="text-[10px] text-text-muted">
               {qna.createdAt?.seconds ? new Date(qna.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
             </p>
           </div>
         </div>
         {user && user.uid === qna.authorId && (
            <button onClick={handleDeleteQuestion} className="text-text-muted hover:text-red-500 transition-colors">
              <Trash2 size={12} />
            </button>
         )}
      </div>
      <p className="text-sm text-text-main mt-3 leading-relaxed">{qna.content}</p>
      
      {/* Comments Section */}
      <div className="mt-4 pl-4 border-l-2 border-black/10 dark:border-white/10 space-y-3">
        {comments.map((comment, idx) => (
           <div key={idx} className="bg-base p-3 rounded-lg flex justify-between group">
             <div>
               <div className="flex items-center gap-2 mb-1">
                 <p className="text-xs font-bold text-text-main">{comment.authorName}</p>
                 <p className="text-[9px] text-text-muted">
                   {comment.createdAt?.seconds ? new Date(comment.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                 </p>
               </div>
               <p className="text-xs text-text-muted">{comment.content}</p>
             </div>
             {user && user.uid === comment.authorId && (
                <button onClick={() => handleDeleteComment(comment.id, comment.authorId)} className="text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={10} />
                </button>
             )}
           </div>
        ))}
        
        {user ? (
          <div className="flex items-center gap-2 mt-2">
            <input 
              type="text" 
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter') handleAddReply(); }}
              placeholder="Write a reply..."
              className="flex-1 bg-surface border border-black/10 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-text-main focus:outline-none focus:border-warning/50"
            />
            <button 
              onClick={handleAddReply}
              disabled={!replyInput.trim()}
              className="bg-warning/20 text-warning hover:bg-warning text-crust hover:text-crust p-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Send size={12} />
            </button>
          </div>
        ) : (
          <p className="text-[10px] text-text-muted italic">Log in to reply</p>
        )}
      </div>
    </div>
  );
};

export function LectureQna({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const [qnas, setQnas] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const { user, userProfile } = useAuth();
  
  useEffect(() => {
    if (!courseId || !lessonId) return;
    
    // Listen for QnAs for this lesson
    const q = query(
      collection(db, 'lectureQna'), 
      where('courseId', '==', courseId), 
      where('lessonId', '==', lessonId),
      orderBy('createdAt', 'desc')
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      const results: any[] = [];
      snapshot.forEach(docSnap => {
        results.push({ id: docSnap.id, ...docSnap.data() });
      });
      setQnas(results);
    });
    
    return () => unsub();
  }, [courseId, lessonId]);

  const handleAskQuestion = async () => {
    if (!newQuestion.trim() || !user) return;
    try {
      await addDoc(collection(db, 'lectureQna'), {
        courseId,
        lessonId,
        content: newQuestion.trim(),
        authorId: user.uid,
        authorName: userProfile?.displayName || 'User',
        createdAt: serverTimestamp()
      });
      setNewQuestion("");
    } catch (e) {
      console.error("Error posting question:", e);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      <div className="mb-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-warning mb-2">Lecture Q&A</h3>
        <p className="text-xs text-text-muted">Discuss this specific lecture with other learners. Ask questions and share answers.</p>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 pr-2 custom-scrollbar">
        <AnimatePresence>
          {qnas.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-text-muted">No questions yet. Be the first to ask!</p>
            </div>
          ) : (
            qnas.map(qna => (
              <motion.div
                key={qna.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <QnaItem qna={qna} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {user ? (
        <div className="mt-auto border-t border-black/10 dark:border-white/5 pt-4">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Ask a question about this lecture..."
            rows={2}
            className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-lg p-3 text-sm text-text-main resize-none focus:outline-none focus:border-warning/50 mb-2"
          />
          <div className="flex justify-end">
            <button
               onClick={handleAskQuestion}
               disabled={!newQuestion.trim()}
               className="bg-warning text-crust font-bold uppercase tracking-widest text-xs px-4 py-2 rounded shadow hover:bg-warning/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              Post Question <Send size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-auto border-t border-black/10 dark:border-white/5 pt-4 text-center">
           <p className="text-xs text-text-muted">Please log in and enroll to ask a question.</p>
        </div>
      )}
    </div>
  );
}
