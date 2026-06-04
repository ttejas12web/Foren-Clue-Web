import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, File, Image as ImageIcon, AlertCircle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { db, storage, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cn } from '@/lib/utils';
import { uploadFileResilient } from '@/lib/localFileStore';

interface UploadResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const forensicCategories = [
  'General',
  'DNA & Serology',
  'Fingerprinting & Dactyloscopy',
  'Digital Forensics & Cyber',
  'Ballistics & Firearms',
  'Crime Scene Investigation',
  'Toxicology & Pharmacology',
  'Forensic Medicine & Pathology',
  'Question Papers'
];

export function UploadResourceModal({ isOpen, onClose }: UploadResourceModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [category, setCategory] = useState(forensicCategories[0]);
  const [tabCategory, setTabCategory] = useState('books');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('PDF');
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        setError('Please select a valid PDF file for the resource.');
        return;
      }
      setPdfFile(file);
      setError(null);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file for the cover portrait.');
        return;
      }
      setCoverFile(file);
      setError(null);
    }
  };

  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title.trim()) {
      setError('Resource Title is required.');
      return;
    }

    if (!pdfFile) {
      setError('Please select a PDF file to upload.');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('Must be signed in to contribute resources to the Academic Library.');
      return;
    }

    setUploading(true);
    setStatusMessage('Preparing upload pipeline...');

    try {
      let uploadedPdfUrl = '';
      let uploadedCoverUrl = '';

      // 1. Upload PDF
      const cleanPdfName = `ebooks/pdfs/${Date.now()}_${pdfFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const pdfUpload = await uploadFileResilient(pdfFile, cleanPdfName, (msg) => setStatusMessage(`PDF: ${msg}`));
      uploadedPdfUrl = pdfUpload.url;

      // 2. Upload Cover Image (Optional)
      if (coverFile) {
        const cleanCoverName = `ebooks/covers/${Date.now()}_${coverFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const coverUpload = await uploadFileResilient(coverFile, cleanCoverName, (msg) => setStatusMessage(`Cover: ${msg}`));
        uploadedCoverUrl = coverUpload.url;
      }

      // 3. Save reference to Firestore
      setStatusMessage('Coupling storage references & indexing with Firestore database...');
      const resourceMetadata = {
        title: title.trim(),
        author: author.trim() || 'ForenClue Contributor',
        year: year ? parseInt(year) || year : new Date().getFullYear(),
        category: category,
        tabCategory: tabCategory,
        type: type,
        size: formatBytes(pdfFile.size),
        desc: desc.trim() || 'No description provided.',
        pdfUrl: uploadedPdfUrl,
        coverImage: uploadedCoverUrl || null,
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
        uploaded: 'Just now'
      };

      await addDoc(collection(db, 'ebooks'), resourceMetadata);

      setSuccess(true);
      setStatusMessage(null);
      // Reset form
      setTitle('');
      setAuthor('');
      setYear('');
      setCategory(forensicCategories[0]);
      setTabCategory('books');
      setDesc('');
      setPdfFile(null);
      setCoverFile(null);

      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2500);

    } catch (err: any) {
      console.error('Error in storage coupling pipeline:', err);
      setError(`Failed to save: ${err.message || 'Unknown network anomaly'}.`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !uploading && onClose()}
          className="absolute inset-0 bg-[#040814]/85 backdrop-blur-md"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-surface border border-black/10 dark:border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-black/10 dark:border-white/5 flex justify-between items-center bg-base/50 shrink-0">
            <div>
              <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                <Upload className="w-5 h-5 text-warning" /> Couple Resource & Cloud Storage
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Upload real PDFs/images to Firebase Storage and bind metadata in Firestore.
              </p>
            </div>
            {!uploading && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors text-text-muted hover:text-text-main cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Form Scroll Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl flex gap-3.5 items-start"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-bold">Error Processing Storage Request</p>
                  <p className="opacity-90 leading-relaxed">{error}</p>
                  <div className="mt-2 text-[11px] bg-red-950/30 p-2.5 rounded-lg border border-red-900/30 font-mono leading-relaxed text-red-300">
                    <span className="font-bold text-warning">Quick Fix Instructions:</span><br/>
                    1. Open Firebase Console.<br/>
                    2. Navigate to &lsquo;Build &gt; Storage&rsquo;.<br/>
                    3. Click &lsquo;Get Started&rsquo; (using defaults) to enable Storage bucket.<br/>
                    4. Under &lsquo;Rules&rsquo;, set to:<br/>
                    <code className="bg-crust px-1 py-0.5 rounded text-white text-[10px]">allow read, write: if true;</code> for sandbox test upload.
                  </div>
                </div>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center text-center text-emerald-400 space-y-2.5"
              >
                <CheckCircle className="w-12 h-12 text-emerald-500 animate-bounce" />
                <h4 className="text-base font-bold">Coupling Successful!</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  The PDF and assets are securely published on Firebase Storage. The connected Firestore reference has updated live in the eLibrary catalog.
                </p>
              </motion.div>
            )}

            {!success && (
              <form id="resource-upload-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5Col">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Document Title</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-warning/50 focus:ring-1 focus:ring-warning/50 transition-all font-mono"
                      placeholder="e.g. Forensic Toxicology Guide"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={uploading}
                    />
                  </div>

                  <div className="space-y-1.5Col">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Author / Publisher</label>
                    <input
                      type="text"
                      className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-warning/50 focus:ring-1 focus:ring-warning/50 transition-all font-mono"
                      placeholder="e.g. Dr. Apurba Nandy"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      disabled={uploading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Category Section</label>
                    <select
                      className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-text-main focus:outline-none focus:border-warning/50 focus:ring-1 focus:ring-warning/50"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={uploading}
                    >
                      {forensicCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Tab Section</label>
                    <select
                      className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-text-main focus:outline-none focus:border-warning/50 focus:ring-1 focus:ring-warning/50"
                      value={tabCategory}
                      onChange={(e) => setTabCategory(e.target.value)}
                      disabled={uploading}
                    >
                      <option value="books">Reference Books</option>
                      <option value="notes">Lecture Notes</option>
                      <option value="papers">Question Papers</option>
                      <option value="other">Other Stuff / Manuals</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Publication Year</label>
                    <input
                      type="text"
                      maxLength={4}
                      className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-text-main focus:outline-none focus:border-warning/50 focus:ring-1 focus:ring-warning/50 font-mono"
                      placeholder="e.g. 2024"
                      value={year}
                      onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, ''))}
                      disabled={uploading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Short Summary</label>
                  <textarea
                    rows={2}
                    className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-text-main placeholder-text-muted/50 focus:outline-none focus:border-warning/50 focus:ring-1 focus:ring-warning/50 transition-all font-sans"
                    placeholder="Provide a quick abstract or course code details..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    disabled={uploading}
                  />
                </div>

                {/* File Upload Zone for PDF */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Secure Document PDF File</label>
                  <div className="relative border-2 border-dashed border-black/15 dark:border-white/10 rounded-2xl p-5 hover:border-warning/35 transition-all bg-base/30 flex flex-col items-center justify-center text-center">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                    <File className="w-8 h-8 text-warning opacity-80 mb-2.5" />
                    {pdfFile ? (
                      <div className="text-xs">
                        <span className="font-bold text-text-main font-mono text-[11px] block text-warning truncate max-w-md">{pdfFile.name}</span>
                        <span className="text-text-muted font-mono">{formatBytes(pdfFile.size)}</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-text-main">Drag & drop or Click to choose study PDF</p>
                        <p className="text-[10px] text-text-muted mt-1 font-mono">Accepts valid PDF documents strictly up to 50MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* File Upload Zone for Cover Image */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Book/Resource Cover Portrait (Optional Image)</label>
                  <div className="relative border-2 border-dashed border-black/15 dark:border-white/10 rounded-2xl p-4 hover:border-warning/35 transition-all bg-base/30 flex flex-col items-center justify-center text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                    <ImageIcon className="w-7 h-7 text-text-muted mb-2" />
                    {coverFile ? (
                      <div className="text-xs">
                        <span className="font-bold text-text-main font-mono text-[11px] block truncate max-w-sm">{coverFile.name}</span>
                        <span className="text-text-muted font-mono">{formatBytes(coverFile.size)}</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-text-main">Select image cover (Makes eLibrary cards look beautiful)</p>
                        <p className="text-[10px] text-text-muted mt-0.5">Accepts JPEG, PNG, or WebP formats</p>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Footer controls */}
          <div className="p-6 border-t border-black/10 dark:border-white/5 bg-base/60 shrink-0 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 text-[10px] text-text-muted font-mono max-w-xs sm:max-w-md">
              {uploading ? (
                <div className="flex items-center gap-2 text-warning font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{statusMessage}</span>
                </div>
              ) : (
                <div className="flex gap-1.5 items-start">
                  <Info className="w-3.5 h-3.5 shrink-0 text-text-muted opacity-80" />
                  <span>Files publish directly on custom Google bucket endpoint. Verified references mapped via Firestore.</span>
                </div>
              )}
            </div>

            {!success && (
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-black/10 dark:hover:bg-white/10 text-text-muted hover:text-text-main transition-all border border-black/10 dark:border-white/10 disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="resource-upload-form"
                  disabled={uploading}
                  className="px-5 py-2.5 bg-warning text-crust font-black text-xs uppercase tracking-wider rounded-xl hover:bg-warning/90 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-md shadow-warning/10"
                >
                  {uploading ? 'Bundling...' : 'Publish Guide'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
