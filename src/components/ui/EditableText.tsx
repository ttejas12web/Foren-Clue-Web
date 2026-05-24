import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { Edit2, Check, X } from 'lucide-react';

interface EditableTextProps {
  id: string; // unique identifier e.g., "home_hero_title"
  defaultText: string;
  className?: string;
  isTextArea?: boolean;
}

export function EditableText({ id, defaultText, className = '', isTextArea = false }: EditableTextProps) {
  const { isAdmin } = useAuth();
  const [text, setText] = useState(defaultText);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(defaultText);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Setup a real-time listener so changes propagate instantly across clients
    const docRef = doc(db, 'websiteTexts', id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const val = docSnap.data().text;
        setText(val || defaultText);
        setEditText(val || defaultText);
      } else {
        setText(defaultText);
        setEditText(defaultText);
      }
    }, (err) => {
      console.warn("Could not sync website text:", id, err);
    });

    return () => unsubscribe();
  }, [id, defaultText]);

  const handleSave = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setLoading(true);
    try {
      await setDoc(doc(db, 'websiteTexts', id), { text: editText });
      setText(editText);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving website text:", id, err);
      alert("Failed to save. You might need to check security permissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEditText(text);
    setIsEditing(false);
  };

  if (isEditing && isAdmin) {
    return (
      <span className="relative inline-block w-full text-left" onClick={(e) => e.stopPropagation()}>
        {isTextArea ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full bg-surface border border-warning/50 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-warning text-text-main text-sm font-sans"
            rows={4}
          />
        ) : (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full bg-surface border border-warning/50 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-warning text-text-main text-sm font-sans"
          />
        )}
        <span className="flex gap-1 mt-1 justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-[10px] flex items-center gap-1 font-mono transition-colors"
          >
            <Check size={10} /> Save
          </button>
          <button
            onClick={handleCancel}
            className="px-2 py-1 bg-red-400/10 hover:bg-red-400/20 text-red-400 rounded text-[10px] flex items-center gap-1 font-mono transition-colors"
          >
            <X size={10} /> Cancel
          </button>
        </span>
      </span>
    );
  }

  return (
    <span className="relative group/edittext inline-block max-w-full text-left">
      <span className={className}>{text}</span>
      {isAdmin && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setEditText(text);
            setIsEditing(true);
          }}
          className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/edittext:opacity-100 p-1 bg-warning/10 hover:bg-warning/20 text-warning rounded-md transition-opacity z-10"
          title="Edit text content"
        >
          <Edit2 size={10} />
        </button>
      )}
    </span>
  );
}
