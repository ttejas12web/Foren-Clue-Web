import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EvidenceMarker } from '@/components/ui/EvidenceMarker';
import { 
  Loader2, Sparkles, X, Box, FileText, ChevronRight, Clock, 
  MapPin, Microscope, Info, Search, Filter, Brain, Dna, 
  Target, Fingerprint, Database, AlertCircle, CheckCircle2,
  Trophy, BookOpen, Edit, Trash2, Plus, Share2, Check,
  RotateCw, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, Eye
} from 'lucide-react';
import Markdown from 'react-markdown';
import { useAuth, checkIsAdmin } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { CaseEditorModal } from '@/components/ui/CaseEditorModal';

// --- Types ---
interface CaseFile {
  id: string;
  title: string;
  tag: string;
  year: string;
  location: string;
  difficulty: "Beginner" | "Advanced" | "Expert" | "Scientific" | "Historical";
  type: "Homicide" | "Cyber" | "Theft" | "Forgery" | "Cold Case";
  image: string;
  summary: string;
  details: string;
  status?: string;
  createdBy?: string;
  evidenceLabels?: string[];
  attachments?: string[];
  contentImages?: (string | { url: string; caption?: string })[];
  sources?: { title: string; url: string }[];
  forensicTechniques?: string[];
}

export default function Cases() {
  const { user, isAdmin } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedCase, setSelectedCase] = useState<CaseFile | null>(null);

  const [dbCases, setDbCases] = useState<CaseFile[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState<CaseFile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

  // Reset controls when transitioning images
  useEffect(() => {
    setRotation(0);
    setZoom(1);
    setNaturalSize(null);
  }, [activeGalleryIndex]);

  // Sync URL query when selectedCase changes
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (selectedCase) {
      searchParams.set('case', selectedCase.id);
    } else {
      searchParams.delete('case');
    }
    const paramStr = searchParams.toString();
    const newUrl = `${window.location.pathname}${paramStr ? '?' + paramStr : ''}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  }, [selectedCase]);

  // Support deep-linking to shared cases
  useEffect(() => {
    if (dbCases.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const sharedCaseId = params.get('case');
      if (sharedCaseId) {
        const found = dbCases.find(c => c.id === sharedCaseId);
        if (found) {
          setSelectedCase(found);
        }
      }
    }
  }, [dbCases]);

  const handleCopyLink = (e: React.MouseEvent, caseId: string, caseTitle: string, caseSummary: string) => {
    e.stopPropagation(); // prevent opening the modal when clicking share!
    
    const shareUrl = `${window.location.origin}/cases?case=${caseId}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${caseTitle} | ForenClue Case Study`,
        text: caseSummary,
        url: shareUrl
      })
      .then(() => {
        setCopiedId(caseId);
        setTimeout(() => setCopiedId(null), 2500);
      })
      .catch((err) => {
        console.log("Native share failed or dismissed", err);
        copyToClipboard(shareUrl, caseId);
      });
    } else {
      copyToClipboard(shareUrl, caseId);
    }
  };

  const copyToClipboard = (text: string, caseId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(caseId);
      setTimeout(() => setCopiedId(null), 2500);
    }).catch(err => {
      console.error("Failed to copy link:", err);
    });
  };

  useEffect(() => {
    const q = query(collection(db, 'cases'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const casesData: CaseFile[] = [];
      snapshot.forEach((doc) => {
        casesData.push({ id: doc.id, ...doc.data() } as CaseFile);
      });
      setDbCases(casesData);
    }, (error) => {
      console.warn("Could not load dynamic cases:", error);
    });
    return () => unsubscribe();
  }, []);

  const filteredArchive = useMemo(() => {
    const allCases = [...dbCases].filter(c => {
       // Only keep files published by admins
       if (!c.createdBy || !checkIsAdmin(c.createdBy)) return false;
       // user can see published, or admin can see all
       return c.status !== 'draft' || isAdmin;
    });

    return allCases.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           c.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'All' || c.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterType, dbCases, isAdmin]);

  return (
    <div className="min-h-screen bg-base py-24 pb-32">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0 forensic-grid" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-5xl md:text-7xl font-heading font-black uppercase tracking-tighter mb-4">
                Case <span className="text-warning">Archive</span>
              </h1>
              <p className="text-lg text-text-muted max-w-xl font-medium">
                Declassified forensic reports from landmark investigations around the globe.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  type="text" 
                  placeholder="Search dossiers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-bold focus:border-warning/50 outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                <Filter size={14} className="text-warning shrink-0" />
                {['All', 'Homicide', 'Cold Case', 'Cyber'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all shrink-0 ${filterType === t ? 'bg-warning/10 border-warning text-warning' : 'border-black/10 dark:border-white/5 text-text-muted hover:border-black/10 dark:border-white/10'}`}
                  >
                    {t}
                  </button>
                ))}
                {isAdmin && (
                  <button 
                    onClick={() => {
                       setCaseToEdit(null);
                       setIsEditorOpen(true);
                    }}
                    className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border border-warning/50 text-warning hover:bg-warning/10 transition-all shrink-0 flex items-center gap-1"
                  >
                    <Plus size={12}/> Add Case
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Case Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArchive.map((item) => (
              <motion.div 
                key={item.id}
                whileHover={{ y: -10 }}
                onClick={() => setSelectedCase(item)}
                className="bg-surface/50 border border-black/10 dark:border-white/5 rounded-3xl overflow-hidden hover:border-warning/30 transition-all cursor-pointer group shadow-xl"
              >
                <div className="h-56 relative overflow-hidden">
                  <img src={item.image} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" alt={item.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-base via-base/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-warning text-crust text-[8px] font-black uppercase tracking-widest rounded-lg">{item.tag}</span>
                    {item.status === 'draft' && isAdmin && (
                      <span className="px-3 py-1 bg-red-500/80 text-white text-[8px] font-black uppercase tracking-widest rounded-lg">Draft</span>
                    )}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{item.year} • {item.location}</span>
                    <EvidenceMarker number={item.difficulty[0]} className="scale-50 origin-right" />
                  </div>
                  <h3 className="text-2xl font-heading font-black mb-4 uppercase italic group-hover:text-warning transition-colors">{item.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed mb-8 line-clamp-3">
                    {item.summary}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-black/10 dark:border-white/5">
                    <button 
                      type="button"
                      onClick={(e) => handleCopyLink(e, item.id, item.title, item.summary)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/5 border border-warning/15 hover:bg-warning hover:text-crust hover:border-warning font-sans text-[10px] font-black uppercase tracking-wider text-warning transition-all cursor-pointer"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check size={11} className="text-current animate-bounce" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 size={11} className="text-current" />
                          <span>Share</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-widest text-warning group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1">
                      Open Case <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Real Case Detail Modal */}
      <AnimatePresence>
        {selectedCase && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-base/98 backdrop-blur-xl flex items-center justify-center p-0 md:p-8 overflow-y-auto"
          >
            <motion.div 
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.95 }}
              className="bg-surface border border-black/10 dark:border-white/10 w-full max-w-6xl min-h-screen md:min-h-0 md:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md p-6 border-b border-black/10 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                    <FileText size={20} className="text-warning" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black uppercase tracking-tight">{selectedCase.title}</h2>
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-md">
                        <CheckCircle2 size={10} className="text-green-500" />
                        <span className="text-[8px] font-black uppercase text-green-500">Verified</span>
                      </div>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Official Forensic Archive • Expert Peer-Reviewed</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(e, selectedCase.id, selectedCase.title, selectedCase.summary)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-warning/10 hover:bg-warning border border-warning/20 text-warning hover:text-crust transition-all text-[11px] font-black uppercase tracking-widest cursor-pointer shadow-sm"
                  >
                    {copiedId === selectedCase.id ? (
                      <>
                        <Check size={14} className="text-current animate-bounce" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={14} className="text-current" />
                        <span>Share Study</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => setSelectedCase(null)}
                    className="p-3 bg-black/5 dark:bg-white/5 hover:bg-warning hover:text-crust transition-all rounded-xl cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col lg:flex-row relative">
                {isAdmin && selectedCase && (
                   <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
                     <button
                        onClick={() => {
                           setCaseToEdit(selectedCase);
                           setSelectedCase(null);
                           setIsEditorOpen(true);
                        }}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                     >
                       <Edit size={14}/> Edit
                     </button>
                     <button
                        onClick={async () => {
                           if (confirm('Are you sure you want to delete this case?')) {
                              try {
                                 await deleteDoc(doc(db, 'cases', selectedCase.id));
                                 setSelectedCase(null);
                              } catch (e) {
                                 console.error("Error deleting case", e);
                              }
                           }
                        }}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                     >
                       <Trash2 size={14}/> Delete
                     </button>
                   </div>
                )}
                
                <div className="lg:w-80 p-8 border-r border-black/10 dark:border-white/5 bg-crust/30 space-y-8">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-3 block">Primary Evidence</label>
                    <img src={selectedCase.image} className="w-full aspect-square object-cover rounded-2xl grayscale border border-black/10 dark:border-white/5" alt="Evidence" referrerPolicy="no-referrer" />
                  </div>

                  {selectedCase.evidenceLabels && selectedCase.evidenceLabels.length > 0 && (
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-3 block">Recovered Items</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedCase.evidenceLabels.map(l => (
                          <span key={l} className="px-3 py-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-[9px] font-bold text-text-muted">{l}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl text-center border border-black/10 dark:border-white/5">
                      <Clock size={16} className="mx-auto text-warning mb-2" />
                      <span className="text-[10px] font-black uppercase text-text-muted block mb-1">Active Year</span>
                      <span className="text-[10px] font-black uppercase block text-text-main">{selectedCase.year}</span>
                    </div>
                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl text-center border border-black/10 dark:border-white/5">
                      <Target size={16} className="mx-auto text-warning mb-2" />
                      <span className="text-[10px] font-black uppercase text-text-muted block mb-1">Verdict</span>
                      <span className="text-[10px] font-black uppercase block text-text-main">{selectedCase.type}</span>
                    </div>
                  </div>

                  {selectedCase.attachments && selectedCase.attachments.length > 0 && (
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-4 block">Archive Attachments</label>
                      <div className="space-y-2">
                        {selectedCase.attachments.map((a, i) => {
                          const isUrlOrBase64 = a.startsWith('http') || a.startsWith('data:');
                          const displayName = isUrlOrBase64 ? `Attachment File ${i + 1}` : a;
                          return (
                          <a href={isUrlOrBase64 ? a : '#'} target={isUrlOrBase64 ? '_blank' : undefined} rel="noreferrer" key={i} className="group flex items-center justify-between p-4 bg-base border border-black/10 dark:border-white/5 rounded-xl hover:border-warning/30 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-warning/50">
                            <div className="flex items-center gap-3 min-w-0">
                              <FileText size={14} className="text-text-muted group-hover:text-warning shrink-0" />
                              <span className="text-[10px] font-bold text-text-muted group-hover:text-text-main truncate text-ellipsis">{displayName}</span>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] shrink-0" />
                          </a>
                        )})}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar max-h-[85vh]">
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-invert prose-warning max-w-none">
                      <div className="mb-12">
                        <Markdown>{selectedCase.details}</Markdown>
                      </div>

                      {selectedCase.contentImages && selectedCase.contentImages.length > 0 && (
                        <div className="mb-12">
                          <h3 className="text-xl font-black uppercase tracking-tight text-text-main mb-6 flex items-center gap-2">
                             <Box size={20} className="text-warning" /> Scientific Gallery
                          </h3>
                          <p className="text-xs text-text-muted mt-[-1rem] mb-6">Click any original record to activate high-fidelity analyzer: zoom, rotate, and view in uncropped full orientation.</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {selectedCase.contentImages.map((img, idx) => {
                              const imgObj = typeof img === 'string' ? { url: img, caption: '' } : img;
                              const imgUrl = imgObj?.url || '';
                              const imgCaption = imgObj?.caption || '';
                              return (
                                <div 
                                  key={idx} 
                                  onClick={() => setActiveGalleryIndex(idx)}
                                  className="group cursor-pointer bg-base/40 p-4 rounded-2xl border border-black/10 dark:border-white/5 hover:border-warning/30 transition-all duration-300 flex flex-col justify-between"
                                >
                                  <div className="relative overflow-hidden rounded-xl border border-black/10 dark:border-white/10 aspect-video mb-3">
                                    <img src={imgUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="Evidence detail" referrerPolicy="no-referrer" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end p-4 justify-between">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1">
                                        <Eye size={10} className="text-warning animate-pulse" /> Interactive Analysis
                                      </span>
                                      <span className="text-[9px] font-mono text-warning bg-warning/10 px-2 py-0.5 rounded border border-warning/20">Open Original</span>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-1">
                                      Visual Evidence Records #{idx + 1}
                                    </div>
                                    <div className="text-xs font-bold text-text-main line-clamp-2">
                                      {imgCaption || 'No specific forensic caption recorded.'}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {selectedCase.forensicTechniques && selectedCase.forensicTechniques.length > 0 && (
                        <div className="mb-12 p-8 bg-warning/5 border border-warning/10 rounded-3xl">
                          <h3 className="text-xl font-black uppercase tracking-tight text-warning mb-6 flex items-center gap-2">
                             <Microscope size={20} /> Applied Forensic Techniques
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selectedCase.forensicTechniques.map((tech, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-3 bg-surface border border-black/10 dark:border-white/5 rounded-xl">
                                <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
                                  <CheckCircle2 size={14} className="text-warning" />
                                </div>
                                <span className="text-xs font-bold text-text-main">{tech}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedCase.sources && selectedCase.sources.length > 0 && (
                        <div className="mt-16 pt-8 border-t border-black/10 dark:border-white/5">
                          <h3 className="text-sm font-black uppercase tracking-widest text-text-muted mb-6">Expert Verification & Sources</h3>
                          <div className="flex flex-wrap gap-4">
                            {selectedCase.sources.map((source, idx) => (
                              <a 
                                key={idx} 
                                href={source.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-xs font-bold text-text-muted hover:text-warning hover:border-warning/30 transition-all"
                              >
                                {source.title}
                                <Info size={12} />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                   </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Editor Modal */}
      {isEditorOpen && isAdmin && user?.email && (
        <CaseEditorModal 
          onClose={() => {
             setIsEditorOpen(false);
             setCaseToEdit(null);
          }} 
          caseToEdit={caseToEdit} 
          userEmail={user.email}
        />
      )}

      {/* Dynamic Scientific Lightbox - Original Dimensions & Orientation Viewer */}
      <AnimatePresence>
        {activeGalleryIndex !== null && selectedCase?.contentImages && selectedCase.contentImages[activeGalleryIndex] && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 md:p-6"
          >
            {/* Lightbox TOP Control Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-white/5 rounded-xl border border-white/10 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-warning/15 flex items-center justify-center border border-warning/10">
                  <Box size={14} className="text-warning animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-text-main">Scientific Image Analyzer</h4>
                  <p className="text-[10px] font-mono text-text-muted">
                    Evidence Case ID: {selectedCase.id.substring(0, 8)} • Image {activeGalleryIndex + 1} of {selectedCase.contentImages.length}
                  </p>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {/* Scale Display */}
                <div className="flex items-center px-2.5 py-1.5 bg-black/40 rounded-lg text-[10px] font-mono text-warning uppercase border border-white/5">
                  Zoom: {Math.round(zoom * 100)}%
                </div>

                {/* Resolution Display */}
                {naturalSize && (
                  <div className="flex items-center px-2.5 py-1.5 bg-black/40 rounded-lg text-[10px] font-mono text-text-muted uppercase border border-white/5">
                    Original: {naturalSize.width} × {naturalSize.height} px
                  </div>
                )}

                {/* Zoom Controls */}
                <button 
                  onClick={() => setZoom(prev => Math.max(0.25, prev - 0.25))}
                  title="Zoom Out"
                  className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-muted hover:text-text-main transition-colors border border-white/5"
                >
                  <ZoomOut size={14} />
                </button>
                <button 
                  onClick={() => setZoom(prev => Math.min(4, prev + 0.25))}
                  title="Zoom In"
                  className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-muted hover:text-text-main transition-colors border border-white/5"
                >
                  <ZoomIn size={14} />
                </button>

                {/* Rotation Controls */}
                <button 
                  onClick={() => setRotation(prev => prev - 90)}
                  title="Rotate Counter-Clockwise"
                  className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-muted hover:text-text-main transition-colors border border-white/5"
                >
                  <RotateCcw size={14} />
                </button>
                <button 
                  onClick={() => setRotation(prev => prev + 90)}
                  title="Rotate Clockwise"
                  className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-muted hover:text-text-main transition-colors border border-white/5"
                >
                  <RotateCw size={14} />
                </button>

                {/* Reset Controls */}
                <button 
                  onClick={() => { setZoom(1); setRotation(0); }}
                  className="px-2.5 py-1.5 bg-warning/10 border border-warning/20 text-warning rounded-lg text-[10px] uppercase font-mono hover:bg-warning/20 transition-colors"
                >
                  Reset
                </button>

                {/* Close Button */}
                <button 
                  onClick={() => setActiveGalleryIndex(null)}
                  className="p-1.5 sm:p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-red-500/20"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Lightbox MAIN content section */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden my-4">
              {/* Prev Button */}
              {activeGalleryIndex > 0 && (
                <button 
                  onClick={() => {
                    setActiveGalleryIndex(prev => prev !== null ? prev - 1 : null);
                  }}
                  className="absolute left-2 sm:left-4 z-10 p-3 bg-black/60 hover:bg-warning hover:text-crust rounded-full text-text-main border border-white/10 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-warning/50"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              {/* Image viewport */}
              <div className="w-full h-full flex items-center justify-center p-4">
                <div className="overflow-auto max-w-full max-h-full flex items-center justify-center custom-scrollbar">
                  <div 
                    className="transition-transform duration-200 ease-out flex items-center justify-center"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`
                    }}
                  >
                    <img 
                      src={(() => {
                        const imgItem = selectedCase.contentImages[activeGalleryIndex];
                        return typeof imgItem === 'string' ? imgItem : imgItem?.url || '';
                      })()} 
                      alt="Scientific Document Detail" 
                      onLoad={(e) => {
                        const imgEl = e.currentTarget;
                        setNaturalSize({ width: imgEl.naturalWidth, height: imgEl.naturalHeight });
                      }}
                      className="max-w-[85vw] max-h-[60vh] object-contain drop-shadow-[0_0_30px_rgba(235,196,159,0.15)] rounded-lg border border-white/5"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>

              {/* Next Button */}
              {activeGalleryIndex < selectedCase.contentImages.length - 1 && (
                <button 
                  onClick={() => {
                    setActiveGalleryIndex(prev => prev !== null ? prev + 1 : null);
                  }}
                  className="absolute right-2 sm:right-4 z-10 p-3 bg-black/60 hover:bg-warning hover:text-crust rounded-full text-text-main border border-white/10 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-warning/50"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>

            {/* Lightbox BOTTOM Caption & Detail information panel */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 max-h-[25vh] overflow-y-auto custom-scrollbar relative z-10">
              <span className="text-[10px] uppercase font-mono tracking-widest text-warning block mb-1 font-black">
                Evidence Forensic Caption
              </span>
              <p className="text-sm font-bold text-text-main">
                {(() => {
                  const imgItem = selectedCase.contentImages[activeGalleryIndex];
                  if (!imgItem) return '';
                  return typeof imgItem === 'string' 
                    ? 'No specific forensic caption recorded.'
                    : imgItem.caption || 'No specific forensic caption recorded.';
                })()}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 pt-3 border-t border-white/5 text-[9px] text-text-muted font-mono leading-none">
                <div>Case Tag: <span className="text-text-main uppercase font-bold">{selectedCase.tag}</span></div>
                <div>Category: <span className="text-text-main uppercase font-bold">{selectedCase.type}</span></div>
                <div>Rotation: <span className="text-text-main uppercase font-bold">{rotation % 360}° Rotation</span></div>
                <div>Aspect Constraint: <span className="text-text-main uppercase font-bold">Nature Original (Uncropped)</span></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
