import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Upload, Loader2, Plus, Trash2 } from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Converts a single Google Drive sharing URL to a direct viewable image link
export function convertGDriveUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('drive.google.com')) {
    let fileId = '';
    
    // Pattern 1: /file/d/FILE_ID/view or /file/d/FILE_ID/preview
    const dMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (dMatch && dMatch[1]) {
      fileId = dMatch[1];
    } else {
      // Pattern 2: ?id=FILE_ID or &id=FILE_ID
      const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        fileId = idMatch[1];
      }
    }
    
    if (fileId) {
      return `https://docs.google.com/uc?export=view&id=${fileId}`;
    }
  }
  return trimmed;
}

// Replaces all Google Drive links inside a text block (like the details markdown input)
export function convertGDriveUrlsInText(text: string | null | undefined): string {
  if (!text) return '';
  
  // Regex to match any variant of Google Drive links
  const gdriveRegex = /https:\/\/drive\.google\.com\/(?:file\/d\/([a-zA-Z0-9_-]+)(?:\/[^\s\)]*)?|open\?(?:[^\s\)]*&)?id=([a-zA-Z0-9_-]+)[^\s\)]*)/g;
  
  return text.replace(gdriveRegex, (match, id1, id2) => {
    const fileId = id1 || id2;
    if (fileId) {
      return `https://docs.google.com/uc?export=view&id=${fileId}`;
    }
    return match;
  });
}

interface CaseEditorModalProps {
  onClose: () => void;
  caseToEdit?: any; // the case to edit, or null/undefined if creating new
  userEmail: string;
}

export function CaseEditorModal({ onClose, caseToEdit, userEmail }: CaseEditorModalProps) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: caseToEdit?.title || '',
    tag: caseToEdit?.tag || '',
    year: caseToEdit?.year || '',
    location: caseToEdit?.location || '',
    difficulty: caseToEdit?.difficulty || 'Beginner',
    type: caseToEdit?.type || 'Homicide',
    summary: caseToEdit?.summary || '',
    details: caseToEdit?.details || '',
    status: caseToEdit?.status || 'draft',
    evidenceLabels: caseToEdit?.evidenceLabels?.join(', ') || '',
    forensicTechniques: caseToEdit?.forensicTechniques?.join(', ') || '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState(caseToEdit?.image || '');
  const [contentImages, setContentImages] = useState<{ url: string; caption: string }[]>(() => {
    if (!caseToEdit?.contentImages) return [];
    return caseToEdit.contentImages.map((img: any) => {
      if (typeof img === 'string') {
        return { url: img, caption: '' };
      }
      return { url: img?.url || '', caption: img?.caption || '' };
    });
  });
  const [newContentImageFiles, setNewContentImageFiles] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<string[]>(caseToEdit?.attachments || []);
  const [newAttachmentFiles, setNewAttachmentFiles] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleContentImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewContentImageFiles(Array.from(e.target.files));
    }
  };

  const handleAttachmentsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewAttachmentFiles(Array.from(e.target.files));
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    if (storage) {
      try {
        const fileRef = ref(storage, path);
        await uploadBytes(fileRef, file);
        return await getDownloadURL(fileRef);
      } catch (err) {
        console.warn("Storage upload failed, falling back to base64", err);
      }
    }
    
    // Fallback path: compress images, directly encode other files
    if (file.type.startsWith('image/')) {
        const { compressImage } = await import('@/lib/image-utils');
        const compressedBlob = await compressImage(file, 800, 0.6); // aggressively compress for firestore
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(compressedBlob);
        });
    }

    if (file.size > 800000) {
       throw new Error(`File ${file.name} is too large (>800kb) for direct upload. Please use a smaller file or configure a Storage bucket.`);
    }

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let mainImageUrl = convertGDriveUrl(existingImage);
      if (imageFile) {
        mainImageUrl = await uploadFile(imageFile, `cases/${Date.now()}_${imageFile.name}`);
      }

      let uploadedContentImages = contentImages.map(img => ({
        url: convertGDriveUrl(img.url),
        caption: img.caption || ''
      }));
      for (const file of newContentImageFiles) {
        const url = await uploadFile(file, `cases/content/${Date.now()}_${file.name}`);
        const cleanName = file.name.split('.').slice(0, -1).join('.').replace(/[_-]/g, ' ');
        const autoCaption = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        uploadedContentImages.push({ url, caption: autoCaption });
      }

      let uploadedAttachments = [...attachments];
      for (const file of newAttachmentFiles) {
        const url = await uploadFile(file, `cases/attachments/${Date.now()}_${file.name}`);
        uploadedAttachments.push(url);
      }

      const convertedDetails = convertGDriveUrlsInText(formData.details);

      const caseData = {
        ...formData,
        details: convertedDetails,
        evidenceLabels: formData.evidenceLabels.split(',').map((s: string) => s.trim()).filter(Boolean),
        forensicTechniques: formData.forensicTechniques.split(',').map((s: string) => s.trim()).filter(Boolean),
        image: mainImageUrl || 'https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&q=80&w=1000',
        contentImages: uploadedContentImages,
        attachments: uploadedAttachments,
        createdBy: userEmail,
        updatedAt: serverTimestamp(),
      };

      if (caseToEdit?.id && !caseToEdit.id.startsWith('hardcoded_')) {
        // Update existing document
        await setDoc(doc(db, 'cases', caseToEdit.id), caseData, { merge: true });
      } else {
        // Create new document
        await addDoc(collection(db, 'cases'), {
          ...caseData,
          createdAt: serverTimestamp()
        });
      }

      onClose();
    } catch (err) {
      console.error("Error saving case:", err);
      alert("Error saving case. Please check permissions and console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-base/98 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-surface border border-black/10 dark:border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto"
      >
        <div className="p-6 border-b border-black/10 dark:border-white/5 flex justify-between items-center bg-surface sticky top-0 z-10">
          <h2 className="text-xl font-heading font-black uppercase">{caseToEdit ? 'Edit Case Study' : 'Add New Case Study'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Title</label>
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-crust border border-white/10 rounded-lg p-3 text-sm focus:border-warning outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Tag (e.g. DNA Analysis)</label>
              <input required name="tag" value={formData.tag} onChange={handleChange} className="w-full bg-crust border border-white/10 rounded-lg p-3 text-sm focus:border-warning outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Year</label>
              <input required name="year" value={formData.year} onChange={handleChange} className="w-full bg-crust border border-white/10 rounded-lg p-3 text-sm focus:border-warning outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Location</label>
              <input required name="location" value={formData.location} onChange={handleChange} className="w-full bg-crust border border-white/10 rounded-lg p-3 text-sm focus:border-warning outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Difficulty</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full bg-crust border border-white/10 rounded-lg p-3 text-sm focus:border-warning outline-none">
                <option>Beginner</option>
                <option>Advanced</option>
                <option>Expert</option>
                <option>Scientific</option>
                <option>Historical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-crust border border-white/10 rounded-lg p-3 text-sm focus:border-warning outline-none">
                <option>Homicide</option>
                <option>Cyber</option>
                <option>Theft</option>
                <option>Forgery</option>
                <option>Cold Case</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-crust border border-white/10 rounded-lg p-3 text-sm focus:border-warning outline-none">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
               <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Main Image / Thumbnail (Upload or Link)</label>
               <input type="text" value={existingImage} onChange={(e) => setExistingImage(e.target.value)} placeholder="Paste image link/GDrive link here..." className="w-full bg-crust border border-white/10 rounded-lg p-3 text-sm focus:border-warning outline-none mb-1" />
               <p className="text-[10px] text-text-muted mb-2 font-mono">Supports Google Drive sharing links (auto-converts to direct image)!</p>
               <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-warning/10 file:text-warning hover:file:bg-warning/20" />
               {imageFile && <div className="mt-2 text-xs text-green-500">File selected: {imageFile.name} (Will override link)</div>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Summary (Short)</label>
            <textarea required name="summary" value={formData.summary} onChange={handleChange} rows={2} className="w-full bg-crust border border-white/10 rounded-lg p-3 text-sm focus:border-warning outline-none custom-scrollbar" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-text-muted uppercase">Details (Markdown supported)</label>
              <span className="text-[10px] text-warning font-mono">Google Drive sharing links are auto-converted!</span>
            </div>
            <textarea required name="details" value={formData.details} onChange={handleChange} rows={8} className="w-full bg-crust border border-white/10 rounded-lg p-3 text-sm focus:border-warning outline-none custom-scrollbar font-mono" placeholder="State the details... Use markdown `![image](gdrive_sharing_url)` to embed inline photos!" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Evidence Labels (comma separated)</label>
                <input name="evidenceLabels" value={formData.evidenceLabels} onChange={handleChange} className="w-full bg-crust border border-white/10 rounded-lg p-3 text-sm focus:border-warning outline-none" placeholder="e.g. Fingerprint, DNA" />
             </div>
             <div>
                <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Forensic Techniques (comma separated)</label>
                <input name="forensicTechniques" value={formData.forensicTechniques} onChange={handleChange} className="w-full bg-crust border border-white/10 rounded-lg p-3 text-sm focus:border-warning outline-none" placeholder="e.g. Dactyloscopy, PCR" />
             </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Gallery Images (Upload or Links)</label>
             <div className="flex gap-2 mb-2">
               <input type="text" id="galleryLinkInput" placeholder="Paste image/GDrive link here" className="flex-1 bg-crust border border-white/10 rounded-lg p-3 text-sm focus:border-warning outline-none" />
               <button type="button" onClick={() => {
                 const el = document.getElementById('galleryLinkInput') as HTMLInputElement;
                 if (el && el.value) {
                   const converted = convertGDriveUrl(el.value);
                   setContentImages(prev => [...prev, { url: converted, caption: '' }]);
                   el.value = '';
                 }
               }} className="bg-warning/20 text-warning px-4 rounded-lg text-sm font-bold">Add Link</button>
             </div>
             <input type="file" accept="image/*" multiple onChange={handleContentImagesUpload} className="w-full text-sm text-text-muted mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-warning/10 file:text-warning hover:file:bg-warning/20" />
             
             <div className="space-y-3 max-h-72 overflow-y-auto p-2 bg-crust rounded-xl border border-white/10 custom-scrollbar mb-4">
               {contentImages.map((img, i) => (
                  <div key={i} className="flex gap-4 p-3 bg-surface border border-white/10 rounded-xl relative group items-center">
                    <img src={img.url} className="w-16 h-16 object-cover rounded-lg border border-white/15 shrink-0" alt="gallery thumbnail" />
                    <div className="flex-1 min-w-0">
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-text-muted mb-1">Image Address / Link</label>
                      <span className="text-[10px] font-mono text-text-main block truncate pr-8">{img.url}</span>
                      
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-text-muted mt-2 mb-1 font-bold">Dossier Caption</label>
                      <input 
                        type="text" 
                        value={img.caption || ''} 
                        placeholder="Enter brief caption describing this evidence image..."
                        onChange={(e) => {
                          const updatedCaption = e.target.value;
                          setContentImages(prev => prev.map((item, idx) => idx === i ? { ...item, caption: updatedCaption } : item));
                        }} 
                        className="w-full bg-base border border-white/15 rounded px-2.5 py-1.5 text-xs text-text-main focus:border-warning outline-none" 
                      />
                    </div>
                    <button type="button" onClick={() => setContentImages(contentImages.filter((_, idx) => idx !== i))} className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg shrink-0 animate-fadeIn">
                      <Trash2 size={16}/>
                    </button>
                  </div>
               ))}
               {contentImages.length === 0 && (
                 <p className="text-xs text-text-muted text-center py-6 font-mono">No laboratory files added to scientific gallery yet.</p>
               )}
             </div>
             {newContentImageFiles.length > 0 && (
               <div className="text-xs text-warning font-semibold mt-1">
                 {newContentImageFiles.length} newly selected files will be uploaded and added with auto-captions on saving.
               </div>
             )}
          </div>

          <div>
             <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Attachments (PDF/Doc - Max 800kb without Storage)</label>
             <input type="file" accept=".pdf,.doc,.docx,.txt" multiple onChange={handleAttachmentsUpload} className="w-full text-sm text-text-muted mb-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-warning/10 file:text-warning hover:file:bg-warning/20" />
             <div className="flex gap-2 flex-wrap">
               {attachments.map((att, i) => (
                  <div key={i} className="relative group p-2 bg-white/5 rounded border border-white/10 text-xs">
                    Attachment {i + 1}
                    <button type="button" onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12}/>
                    </button>
                  </div>
               ))}
               {newAttachmentFiles.map(f => <div key={f.name} className="p-2 bg-black/10 dark:bg-white/10 text-xs rounded border border-black/20 dark:border-white/20">{f.name}</div>)}
             </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-black/10 dark:border-white/5 gap-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg font-bold text-text-muted hover:text-text-main">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-warning text-crust rounded-lg font-bold tracking-widest flex items-center gap-2 hover:bg-warning-dark transition-colors disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : (caseToEdit ? 'Save Changes' : 'Create Case')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
