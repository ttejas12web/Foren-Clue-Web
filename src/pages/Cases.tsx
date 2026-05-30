import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EvidenceMarker } from '@/components/ui/EvidenceMarker';
import { SEO } from '@/components/layout/SEO';
import { 
  Loader2, Sparkles, X, Box, FileText, ChevronRight, Clock, 
  MapPin, Microscope, Info, Search, Filter, Brain, Dna, 
  Target, Fingerprint, Database, AlertCircle, CheckCircle2,
  Trophy, BookOpen, Edit, Trash2, Plus, Share2, Check,
  RotateCw, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, Eye,
  Play, Pause, Volume2, Type, Copy, ExternalLink, Sun, Moon,
  QrCode, Twitter, Linkedin, Facebook, HelpCircle, Download, Printer, Instagram
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

  // --- Reading Optimization & Accessibility Options ---
  const [readingTheme, setReadingTheme] = useState<'slate' | 'sepia' | 'light'>('slate');
  const [readingFontSize, setReadingFontSize] = useState<number>(16); // in px
  const [readingFont, setReadingFont] = useState<'sans' | 'serif' | 'mono'>('sans');

  // --- Speech Synthesis Assistant (Text-to-Speech) ---
  const [isNarrating, setIsNarrating] = useState(false);
  const [isNarratorPaused, setIsNarratorPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  // --- Advanced Image Gallery Options ---
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState<boolean>(false);
  const [galleryViewMode, setGalleryViewMode] = useState<'carousel' | 'grid'>('carousel');

  // --- Custom Social Platform Sharing Dialog ---
  const [sharingCase, setSharingCase] = useState<CaseFile | null>(null);

  // Reset active slide index when a new case is selected
  useEffect(() => {
    setActiveSlideIndex(0);
    setIsSlideshowPlaying(false);
  }, [selectedCase]);

  // Slideshow play automation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSlideshowPlaying && selectedCase?.contentImages && selectedCase.contentImages.length > 0) {
      interval = setInterval(() => {
        setActiveSlideIndex(prev => 
          prev >= selectedCase.contentImages!.length - 1 ? 0 : prev + 1
        );
      }, 3500); // 3.5s transition
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSlideshowPlaying, selectedCase]);

  // Check speech synthesis support and handle automatic narration cutoff/cleanup
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setIsSpeechSupported(true);
    }
  }, []);

  useEffect(() => {
    // Stop speaking if case details is closed
    if (!selectedCase && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      setIsNarratorPaused(false);
    }
  }, [selectedCase]);

  const handleStartNarrator = () => {
    if (!selectedCase || !isSpeechSupported) return;
    
    if (isNarrating && isNarratorPaused) {
      window.speechSynthesis.resume();
      setIsNarratorPaused(false);
      return;
    }
    
    if (isNarrating && !isNarratorPaused) {
      window.speechSynthesis.pause();
      setIsNarratorPaused(true);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const titleClean = selectedCase.title || '';
      const summaryClean = selectedCase.summary || '';
      const detailsRaw = selectedCase.details || '';
      
      const detailsClean = detailsRaw
        .replace(/[#*`_\[\]()\-:=+>]/g, ' ')
        .replace(/\s+/g, ' ')
        .substring(0, 1500); // stable substring segment for standard utterance compatibility
      
      const combinedText = `Archived Forensic Case report. File Title: ${titleClean}. Overview summary: ${summaryClean}. Detailed Analysis says: ${detailsClean}`;
      const utterance = new SpeechSynthesisUtterance(combinedText);
      utterance.rate = speechRate;
      
      utterance.onend = () => {
        setIsNarrating(false);
        setIsNarratorPaused(false);
      };
      
      utterance.onerror = (evt) => {
        console.warn("Speech Synthesis failed:", evt);
        setIsNarrating(false);
        setIsNarratorPaused(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsNarrating(true);
      setIsNarratorPaused(false);
    } catch(err) {
      console.warn("Speech synthesis error or blocked by constraints:", err);
    }
  };

  const handleStopNarrator = () => {
    if (isSpeechSupported && typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      setIsNarratorPaused(false);
    }
  };

  // Adjust Speech speed rate during narration
  useEffect(() => {
    if (isNarrating && isSpeechSupported && selectedCase) {
      window.speechSynthesis.cancel();
      const titleClean = selectedCase.title || '';
      const summaryClean = selectedCase.summary || '';
      const detailsRaw = selectedCase.details || '';
      const detailsClean = detailsRaw.replace(/[#*`_\[\]()\-:=+>]/g, ' ').substring(0, 1200);
      const combinedText = `Archived Case report: ${titleClean}. Summary: ${summaryClean}. Details: ${detailsClean}`;
      
      const utterance = new SpeechSynthesisUtterance(combinedText);
      utterance.rate = speechRate;
      utterance.onend = () => {
        setIsNarrating(false);
        setIsNarratorPaused(false);
      };
      utterance.onerror = () => {
        setIsNarrating(false);
        setIsNarratorPaused(false);
      };
      window.speechSynthesis.speak(utterance);
      setIsNarrating(true);
      setIsNarratorPaused(false);
    }
  }, [speechRate]);

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
    
    const shareUrl = `https://forenclue.in/cases?case=${caseId}`;
    
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

  const handleOpenShare = (e: React.MouseEvent, caseItem: CaseFile) => {
    e.stopPropagation();
    setSharingCase(caseItem);
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
    }).sort((a, b) => {
      const timeA = ((a as any).createdAt as any)?.seconds || 0;
      const timeB = ((b as any).createdAt as any)?.seconds || 0;
      return timeB - timeA;
    });

    return allCases.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           c.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'All' || c.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterType, dbCases, isAdmin]);

  // --- Theme-specific contrast variables for standard document reading modes ---
  let toolbarBg = "bg-black/10 dark:bg-white/5 border-black/5 dark:border-white/5";
  let toolbarLabelColor = "text-text-muted";
  let toolbarZoomBg = "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/5";
  let toolbarZoomBtnLeft = "w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold text-text-muted hover:text-text-main transition-colors border-r border-[#8e8f99]/10 cursor-pointer";
  let toolbarZoomBtnRight = "w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold text-text-muted hover:text-text-main transition-colors border-l border-[#8e8f99]/10 cursor-pointer";
  let toolbarZoomText = "text-text-main";
  let toolbarVoiceText = "text-text-main";

  if (readingTheme === 'sepia') {
    toolbarBg = "bg-amber-950/5 border-amber-900/10";
    toolbarLabelColor = "text-amber-800 font-extrabold";
    toolbarZoomBg = "bg-amber-950/10 border-amber-900/15";
    toolbarZoomBtnLeft = "w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-amber-950/10 text-xs font-bold text-amber-900 hover:text-amber-950 transition-colors border-r border-amber-900/15 cursor-pointer";
    toolbarZoomBtnRight = "w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-amber-950/10 text-xs font-bold text-amber-900 hover:text-amber-950 transition-colors border-l border-amber-900/15 cursor-pointer";
    toolbarZoomText = "text-amber-950 font-black";
    toolbarVoiceText = "text-amber-950 font-black";
  } else if (readingTheme === 'light') {
    toolbarBg = "bg-zinc-100 border-zinc-200";
    toolbarLabelColor = "text-zinc-700 font-extrabold";
    toolbarZoomBg = "bg-zinc-200/50 border-zinc-200";
    toolbarZoomBtnLeft = "w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-zinc-300 text-xs font-bold text-zinc-700 hover:text-zinc-950 transition-colors border-r border-zinc-300 cursor-pointer";
    toolbarZoomBtnRight = "w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-zinc-300 text-xs font-bold text-zinc-700 hover:text-zinc-950 transition-colors border-l border-zinc-300 cursor-pointer";
    toolbarZoomText = "text-zinc-950 font-black";
    toolbarVoiceText = "text-zinc-950 font-black";
  }

  return (
    <div className="min-h-screen bg-base py-24 pb-32">
      <SEO 
        title="Solved Cases & Declassified Investigative Dossiers"
        description="Study declassified real-world forensic crime case studies. Examine trace evidence logging, ballistic reconstruction reports, and digital crime summaries."
        keywords="solved forensic cases, crime case studies, dactyloscopy case dossiers, criminalistics research archive"
        canonicalPath="/cases"
        image={selectedCase?.image}
      />
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0 forensic-grid" />
      </div>

      <div className={`mx-auto relative z-10 ${selectedCase ? 'w-full max-w-none px-6 md:px-12 lg:px-20' : 'max-w-7xl px-6'}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {!selectedCase ? (
            <>
              {/* Header */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-5xl md:text-7xl font-heading font-black uppercase tracking-tighter mb-4">
                Case <span className="text-warning">Archive</span>
              </h1>
              <p className="text-lg text-text-muted max-w-xl font-medium">
                Get the case studies to deep dive into forensic investigation
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
            {filteredArchive.map((item, idx) => (
              <motion.div 
                key={`case-${item.id}-${idx}`}
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
                      onClick={(e) => handleOpenShare(e, item)}
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
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Breadcrumb Navigation & Top Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/5">
            <button
              onClick={() => setSelectedCase(null)}
              className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-warning/15 hover:text-warning border border-black/10 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back To Case Studies</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => handleOpenShare(e, selectedCase)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-warning/10 hover:bg-warning border border-warning/15 text-warning hover:text-crust transition-all text-xs font-black uppercase tracking-widest cursor-pointer shadow-sm"
              >
                <Share2 size={13} className="text-current" />
                <span>Share Case Report</span>
              </button>
              
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCaseToEdit(selectedCase);
                      setSelectedCase(null);
                      setIsEditorOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-500 border border-blue-500/20 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Edit size={13}/> Edit Case
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
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Trash2 size={13}/> Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Hero Banner Grid Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-warning text-crust text-[9px] font-black uppercase tracking-widest rounded-lg">
                  {selectedCase.tag}
                </span>

              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black uppercase tracking-tight italic text-text-main leading-tight">
                {selectedCase.title}
              </h1>
            </div>

            {/* Quick Metadata Stats Grid */}
            <div className="p-4 sm:p-6 bg-surface border border-black/10 dark:border-white/5 rounded-2xl sm:rounded-3xl grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-black/5 dark:bg-white/5 rounded-xl sm:rounded-2xl text-center border border-black/10 dark:border-white/5">
                <Clock size={16} className="mx-auto text-warning mb-2" />
                <span className="text-[10px] sm:text-[11px] font-black uppercase text-text-muted block mb-1">Active Year</span>
                <span className="text-xs sm:text-sm font-black uppercase block text-text-main">{selectedCase.year}</span>
              </div>
              <div className="p-3 sm:p-4 bg-black/5 dark:bg-white/5 rounded-xl sm:rounded-2xl text-center border border-black/10 dark:border-white/5">
                <Target size={16} className="mx-auto text-warning mb-2" />
                <span className="text-[10px] sm:text-[11px] font-black uppercase text-text-muted block mb-1">Verified</span>
                <span className="text-xs sm:text-sm font-black uppercase block text-text-main">{selectedCase.type}</span>
              </div>
            </div>
          </div>

          {/* Detailed Content & Image Grid Area */}
          <div className="flex flex-col gap-6 sm:gap-8 lg:gap-12 items-start w-full">
            {/* Top metadata info card */}
            <div className="w-full">
              <div className="bg-surface border border-black/10 dark:border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <div className="md:col-span-1">
                  <div className="aspect-video sm:aspect-square md:aspect-video rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black bg-opacity-40 h-full">
                    <img src={selectedCase.image} className="w-full h-full object-cover grayscale opacity-85 hover:opacity-100 hover:grayscale-0 transition-all duration-500" alt="Primary Evidence" referrerPolicy="no-referrer" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                  {selectedCase.evidenceLabels && selectedCase.evidenceLabels.length > 0 && (
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#8e8f99] mb-3 block">Registered Items</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedCase.evidenceLabels.map(l => (
                          <span key={l} className="px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-[9px] font-bold text-text-muted">{l}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCase.attachments && selectedCase.attachments.length > 0 && (
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#8e8f99] mb-3 block">Attachments</label>
                      <div className="flex flex-wrap gap-3">
                        {selectedCase.attachments.map((a, i) => {
                          const isUrlOrBase64 = a.startsWith('http') || a.startsWith('data:');
                          const displayName = isUrlOrBase64 ? `Attachment ${i + 1}` : a;
                          return (
                            <a href={isUrlOrBase64 ? a : '#'} target={isUrlOrBase64 ? '_blank' : undefined} rel="noreferrer" key={i} className="group flex items-center justify-between gap-4 p-3 bg-base border border-black/10 dark:border-white/5 rounded-xl hover:border-warning/30 transition-all cursor-pointer min-w-[200px]">
                              <div className="flex items-center gap-3 min-w-0">
                                <FileText size={14} className="text-text-muted group-hover:text-warning shrink-0" />
                                <span className="text-[10px] font-bold text-text-muted group-hover:text-text-main truncate text-ellipsis">{displayName}</span>
                              </div>
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Document details reading view (Full width) */}
            <div className="w-full mt-8 sm:mt-12">
              <div className={`transition-colors duration-300 w-full ${
                readingTheme === 'slate' 
                  ? 'text-zinc-300' 
                  : readingTheme === 'sepia' 
                  ? 'text-[#4a3319] bg-[#f4ecd8] -mx-6 md:-mx-12 lg:-mx-20 px-6 md:px-12 lg:px-20 py-10 rounded-none' 
                  : 'text-zinc-800 bg-white -mx-6 md:-mx-12 lg:-mx-20 px-6 md:px-12 lg:px-20 py-10 rounded-none'
              }`}>
                {/* Accessible Toolbar - Tactile & Responsive */}
                <div className={`mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-wrap items-center justify-between gap-4 select-none border ${toolbarBg}`}>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-black ${toolbarLabelColor}`}>Text Zoom</span>
                      <div className={`flex items-center rounded-xl overflow-hidden border ${toolbarZoomBg}`}>
                        <button 
                          onClick={() => setReadingFontSize(prev => Math.max(12, prev - 1))}
                          title="Decrease Font Size"
                          className={toolbarZoomBtnLeft}
                        >
                          A-
                        </button>
                        <div className={`px-3 text-[10px] font-mono font-bold min-w-[36px] text-center ${toolbarZoomText}`}>
                          {readingFontSize}px
                        </div>
                        <button 
                          onClick={() => setReadingFontSize(prev => Math.min(24, prev + 1))}
                          title="Increase Font Size"
                          className={toolbarZoomBtnRight}
                        >
                          A+
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-black ${toolbarLabelColor}`}>Contrast</span>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button 
                          onClick={() => setReadingTheme('slate')}
                          title="Activate Slate Theme (Dark)"
                          className={`w-9 h-9 sm:w-7 sm:h-7 rounded-full bg-[#111214] border-2 flex items-center justify-center transition-all cursor-pointer ${
                            readingTheme === 'slate' ? 'border-warning scale-110 shadow-lg' : 'border-white/10'
                          }`}
                        >
                          <Moon size={11} className="text-white/80" />
                        </button>
                        
                        <button 
                          onClick={() => setReadingTheme('sepia')}
                          title="Activate Warm Sepia (Paper)"
                          className={`w-9 h-9 sm:w-7 sm:h-7 rounded-full bg-[#f4ecd8] border-2 flex items-center justify-center transition-all cursor-pointer ${
                            readingTheme === 'sepia' ? 'border-amber-700 scale-110 shadow-lg' : 'border-black/10'
                          }`}
                        >
                          <span className="text-[10px] font-extrabold text-amber-950">S</span>
                        </button>

                        <button 
                          onClick={() => setReadingTheme('light')}
                          title="Activate High Contrast Light"
                          className={`w-9 h-9 sm:w-7 sm:h-7 rounded-full bg-white border border-black/20 flex items-center justify-center transition-all cursor-pointer ${
                            readingTheme === 'light' ? 'border-blue-600 scale-110 shadow-lg' : 'border-black/10'
                          }`}
                        >
                          <Sun size={11} className="text-black/80" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {isSpeechSupported && (
                    <div className="flex items-center bg-warning/10 border border-warning/15 p-1.5 rounded-xl gap-2.5 max-w-full">
                      <button
                        onClick={handleStartNarrator}
                        className="w-10 h-10 sm:w-8 sm:h-8 bg-warning hover:bg-warning/90 transition-colors flex items-center justify-center rounded-lg text-crust shadow-md cursor-pointer shrink-0"
                        title={isNarrating && !isNarratorPaused ? "Pause Speech Reader" : "Begin Audio Speech Reading"}
                      >
                        {isNarrating && !isNarratorPaused ? (
                          <Pause size={12} className="fill-current text-current" />
                        ) : (
                          <Play size={12} className="fill-current text-current ml-0.5" />
                        )}
                      </button>

                      <div className="flex flex-col text-left min-w-[70px]">
                        <span className="text-[7px] font-black uppercase text-warning tracking-widest leading-none font-mono">Voice Synth</span>
                        <span className={`text-[9px] font-bold leading-tight mt-0.5 truncate ${toolbarVoiceText}`}>
                          {isNarrating && !isNarratorPaused ? "Reading..." : isNarrating ? "Paused" : "Read Aloud"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 pl-2 border-l border-warning/15">
                        <span className="text-[8px] font-mono text-warning">Rate</span>
                        <select 
                          value={speechRate}
                          onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                          className="bg-transparent font-mono text-[9px] font-bold text-warning outline-none cursor-pointer border-none p-0 pr-1"
                        >
                          <option value="0.75" className="bg-[#121315] text-white">0.75x</option>
                          <option value="1" className="bg-[#121315] text-white">1.0x</option>
                          <option value="1.2" className="bg-[#121315] text-white">1.2x</option>
                          <option value="1.5" className="bg-[#121315] text-white font-bold">1.5x</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Document Body */}
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className={`max-w-none w-full transition-all duration-300 prose-sm sm:prose-base ${
                    readingTheme === 'slate'
                      ? 'prose prose-invert prose-warning text-zinc-300'
                      : readingTheme === 'sepia'
                      ? 'prose prose-stone text-[#4a3319] prose-headings:text-[#2b190f]'
                      : 'prose prose-neutral text-zinc-900 prose-headings:text-black'
                  }`}
                  style={{ 
                    fontSize: `${readingFontSize}px`,
                    lineHeight: 1.8,
                  }}
                >
                  <div className="mb-12">
                    <Markdown>{selectedCase.details}</Markdown>
                  </div>

                  {/* Improved Scientific Exhibits Gallery: Minimal, Clean, User-Friendly */}
                  {selectedCase.contentImages && selectedCase.contentImages.length > 0 && (
                    <div className="mt-16 pt-12 border-t border-black/10 dark:border-white/5">
                      <div className="mb-6">
                        <span className="text-[10px] font-black uppercase tracking-wider text-warning flex items-center gap-1.5 mb-1 bg-warning/5 px-2.5 py-1 rounded w-fit">
                          <Box size={12} className="text-warning" /> Scientific Exhibits Locker
                        </span>
                        <h3 className={`text-xl font-black uppercase tracking-tight m-0 ${
                          readingTheme === 'slate' ? 'text-text-main' : readingTheme === 'sepia' ? 'text-[#2b190f]' : 'text-black'
                        }`}>
                          Media Gallery
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {selectedCase.contentImages.map((cImg, index) => {
                          const url = typeof cImg === 'string' ? cImg : cImg?.url || '';
                          const caption = typeof cImg === 'string' ? `Visual evidence exhibit #${index + 1}` : cImg?.caption || `Visual evidence exhibit #${index + 1}`;
                          
                          let cardBg = "bg-black/10 dark:bg-black/35 border-black/10 dark:border-white/5";
                          let captionColor = "text-text-muted group-hover:text-text-main";
                          
                          if (readingTheme === 'sepia') {
                            cardBg = "bg-amber-900/5 border-amber-900/15";
                            captionColor = "text-amber-950 font-black";
                          } else if (readingTheme === 'light') {
                            cardBg = "bg-zinc-50 border-zinc-200";
                            captionColor = "text-zinc-900 group-hover:text-black font-black";
                          }

                          return (
                            <motion.div
                              key={index}
                              whileHover={{ y: -4, scale: 1.01 }}
                              onClick={() => setActiveGalleryIndex(index)}
                              className={`group border rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:border-warning/30 transition-all duration-300 ${cardBg}`}
                            >
                              <div className="aspect-video relative overflow-hidden bg-black bg-opacity-40">
                                <img 
                                  src={url} 
                                  className="w-full h-full object-cover grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                                  alt={caption}
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-white/10 px-2.5 py-0.5 rounded-lg text-[8px] font-mono text-warning uppercase font-bold text-center">
                                  EX-{index + 1}
                                </div>
                              </div>
                              <div className="p-4">
                                <p className={`text-xs font-bold line-clamp-2 m-0 transition-colors duration-200 ${captionColor}`}>
                                  {caption}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedCase.forensicTechniques && selectedCase.forensicTechniques.length > 0 && (
                    <div className="mt-16 pt-12 border-t border-black/10 dark:border-white/5">
                      <h3 className={`text-lg font-black uppercase tracking-tight text-warning mb-6 flex items-center gap-2 m-0`}>
                        <Microscope size={18} /> Applied Forensic Methodology
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        {selectedCase.forensicTechniques.map((tech, idx) => {
                          let cardBgClass = "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/5";
                          let textClass = "text-text-main";
                          
                          if (readingTheme === 'sepia') {
                            cardBgClass = "bg-amber-950/5 border-amber-900/15";
                            textClass = "text-amber-950 font-black";
                          } else if (readingTheme === 'light') {
                            cardBgClass = "bg-zinc-50 border-zinc-200";
                            textClass = "text-zinc-950 font-black";
                          }

                          return (
                            <div 
                              key={idx} 
                              className={`flex items-center gap-3 p-4 border rounded-xl m-0 shadow-sm hover:border-warning/20 transition-all ${cardBgClass}`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-warning/10 border border-warning/10 flex items-center justify-center shrink-0">
                                <CheckCircle2 size={14} className="text-warning" />
                              </div>
                              <span className={`text-xs font-extrabold leading-tight ${textClass}`}>{tech}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedCase.sources && selectedCase.sources.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-black/10 dark:border-white/5">
                      <h3 className={`text-xs font-black uppercase tracking-widest mb-4 m-0 relative ${
                        readingTheme === 'slate' ? 'text-[#8e8f99]' : readingTheme === 'sepia' ? 'text-amber-800' : 'text-zinc-700'
                      }`}>Expert Sources & References</h3>
                      <div className="flex flex-wrap gap-3 mt-4">
                        {selectedCase.sources.map((source, idx) => {
                          let btnBgClass = "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10";
                          let btnTextClass = "text-[#8e8f99]";
                          
                          if (readingTheme === 'sepia') {
                            btnBgClass = "bg-amber-950/5 border-amber-900/15";
                            btnTextClass = "text-amber-900 font-black";
                          } else if (readingTheme === 'light') {
                            btnBgClass = "bg-zinc-50 border-zinc-200";
                            btnTextClass = "text-zinc-900 font-extrabold";
                          }

                          return (
                            <a 
                              key={idx} 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-bold hover:text-warning hover:border-warning/30 transition-all m-0 ${btnBgClass} ${btnTextClass}`}
                            >
                              {source.title}
                              <ExternalLink size={11} className="text-current" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Executive Case Summary (Placed at the end of the case) */}
                  {selectedCase.summary && (
                    <div className="mt-16 pt-8 border-t border-black/10 dark:border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-warning flex items-center gap-1.5 mb-2 bg-warning/5 px-2.5 py-1 rounded w-fit">
                        Executive Case Summary
                      </span>
                      <p className={`text-sm sm:text-base leading-relaxed font-semibold m-0 ${
                        readingTheme === 'sepia' 
                          ? 'text-amber-900' 
                          : readingTheme === 'light' 
                            ? 'text-zinc-900 font-extrabold' 
                            : 'text-text-muted'
                      }`}>
                        {selectedCase.summary}
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Recommended Cases */}
          <div className="mt-20 pt-16 border-t border-black/10 dark:border-white/5">
            <div className="mb-10 flex flex-col items-center text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#8e8f99] border border-black/10 dark:border-white/10 px-3 py-1.5 rounded-xl mb-4">Further Investigation</span>
              <h2 className="text-2xl sm:text-3xl font-heading font-black uppercase tracking-tight italic inline-flex items-center gap-3 text-text-main">
                <Database size={22} className="text-warning"/>
                Latest Published Cases
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredArchive.filter(c => c.id !== selectedCase.id).slice(0, 2).map((item, idx) => (
                <motion.div 
                  key={`recommended-${item.id}-${idx}`}
                  whileHover={{ y: -5 }}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setSelectedCase(item);
                  }}
                  className="bg-surface/50 border border-black/10 dark:border-white/5 rounded-3xl overflow-hidden hover:border-warning/30 transition-all cursor-pointer group shadow-xl"
                >
                  <div className="h-48 relative overflow-hidden">
                    <img src={item.image} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" alt={item.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-base via-base/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-warning text-crust text-[8px] font-black uppercase tracking-widest rounded-lg">{item.tag}</span>
                      {item.status === 'draft' && isAdmin && (
                        <span className="px-3 py-1 bg-red-500/80 text-white text-[8px] font-black uppercase tracking-widest rounded-lg">Draft</span>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{item.year} • {item.location}</span>
                      <EvidenceMarker number={item.difficulty[0]} className="scale-50 origin-right" />
                    </div>
                    <h3 className="text-xl font-heading font-black mb-3 uppercase italic group-hover:text-warning transition-colors">{item.title}</h3>
                    <p className="text-sm text-text-muted leading-relaxed mb-6 line-clamp-2">
                      {item.summary}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-black/10 dark:border-white/5">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenShare(e, item);
                        }}
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
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Fingerprint size={12} className="text-warning shrink-0" />
                        <span className="text-[10px] font-mono font-bold text-text-muted truncate">ID: {item.id}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
        </motion.div>
      </div>
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
            <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-white/5 rounded-xl border border-white/10 relative z-10 w-full select-none">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-warning/15 flex items-center justify-center border border-warning/10 shrink-0">
                  <Box size={14} className="text-warning animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-text-main truncate">Image Analyzer</h4>
                  <p className="text-[8px] sm:text-[10px] font-mono text-text-muted truncate">
                    Img {activeGalleryIndex + 1} of {selectedCase.contentImages.length}
                  </p>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Scale Display */}
                <div className="hidden min-[420px]:flex items-center px-2 py-1 bg-black/40 rounded-lg text-[8px] sm:text-[10px] font-mono text-warning uppercase border border-white/5">
                  Zoom: {Math.round(zoom * 100)}%
                </div>

                {/* Zoom Controls */}
                <button 
                  onClick={() => setZoom(prev => Math.max(0.25, prev - 0.25))}
                  title="Zoom Out"
                  className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-muted hover:text-text-main transition-colors border border-white/5 cursor-pointer flex items-center justify-center"
                >
                  <ZoomOut size={13} />
                </button>
                <button 
                  onClick={() => setZoom(prev => Math.min(4, prev + 0.25))}
                  title="Zoom In"
                  className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-muted hover:text-text-main transition-colors border border-white/5 cursor-pointer flex items-center justify-center"
                >
                  <ZoomIn size={13} />
                </button>

                {/* Reset Controls - Highly responsive text sizing */}
                <button 
                  onClick={() => { setZoom(1); setRotation(0); }}
                  className="px-2.5 py-1.5 sm:py-2 bg-warning/10 border border-warning/20 text-warning rounded-lg text-[9px] sm:text-[10px] uppercase font-mono hover:bg-warning/20 transition-colors cursor-pointer"
                >
                  Reset
                </button>

                {/* Close Button */}
                <button 
                  onClick={() => setActiveGalleryIndex(null)}
                  className="p-1.5 sm:p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-red-500/20 cursor-pointer flex items-center justify-center"
                >
                  <X size={13} />
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
                      className="max-w-[85vw] max-h-[45vh] sm:max-h-[60vh] object-contain drop-shadow-[0_0_30px_rgba(235,196,159,0.15)] rounded-lg border border-white/5"
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

      {/* Enhanced Custom Platform Social Sharing Drawer */}
      <AnimatePresence>
        {sharingCase && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#121315] border border-white/10 w-full max-w-xl rounded-2xl shadow-2xl p-6 relative select-none"
            >
              <button 
                onClick={() => setSharingCase(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                aria-label="Close sharing panel"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-warning/15 rounded-xl border border-warning/20 flex items-center justify-center text-warning">
                  <Share2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white leading-none">Investigative Share Link</h3>
                  <p className="text-[10px] text-text-muted mt-1.5 font-mono">Dossier Level: Verified Case Study File</p>
                </div>
              </div>

              {/* Clipboard copy widget */}
              <div className="mb-6">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8e8f99] block mb-2">Secure Dossier URL</label>
                <div className="flex items-center gap-2 p-1.5 bg-[#18191c] border border-white/10 rounded-xl">
                  <input 
                    type="text" 
                    readOnly 
                    value={`https://forenclue.in/cases?case=${sharingCase.id}`}
                    className="flex-grow bg-transparent text-xs text-white/95 px-3 py-1.5 focus:outline-none select-all font-mono"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`https://forenclue.in/cases?case=${sharingCase.id}`);
                      setCopiedId(sharingCase.id);
                      setTimeout(() => setCopiedId(null), 2500);
                    }}
                    className="px-4 py-2 bg-warning text-crust hover:bg-warning/90 transition-all font-sans text-[10px] font-black uppercase tracking-wider rounded-lg shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === sharingCase.id ? (
                      <>
                        <Check size={11} className="animate-bounce" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Social Channels Options Grid */}
              <div className="mb-8">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8e8f99] block mb-3">Share on Social Platforms</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  
                  {/* Twitter / X */}
                  <a 
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Investigating this fascinating declassified forensic case study: "' + sharingCase.title + '" on ForenClue. Check it out!')}&url=${encodeURIComponent('https://forenclue.in/cases?case=' + sharingCase.id)}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2.5 bg-[#1da1f2]/10 border border-[#1da1f2]/20 hover:bg-[#1da1f2]/20 text-[#1da1f2] rounded-xl text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Twitter size={14} className="shrink-0" />
                    <span>Twitter / X</span>
                  </a>

                  {/* LinkedIn */}
                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://forenclue.in/cases?case=' + sharingCase.id)}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2.5 bg-[#0a66c2]/10 border border-[#0a66c2]/20 hover:bg-[#0a66c2]/20 text-[#0a66c2] rounded-xl text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Linkedin size={14} className="shrink-0" />
                    <span>LinkedIn</span>
                  </a>

                  {/* WhatsApp */}
                  <a 
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this forensic investigation case study: ' + sharingCase.title + ' https://forenclue.in/cases?case=' + sharingCase.id)}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2.5 bg-[#25d366]/10 border border-[#25d366]/20 hover:bg-[#25d366]/30 text-[#25d366] rounded-xl text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Volume2 size={14} className="shrink-0 rotate-[-45deg]" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Instagram */}
                  <button 
                    onClick={() => {
                        window.open("https://instagram.com", "_blank");
                        navigator.clipboard.writeText(`https://forenclue.in/cases?case=${sharingCase.id}`);
                        setCopiedId(sharingCase.id);
                        setTimeout(() => setCopiedId(null), 2500);
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 bg-[#E1306C]/10 border border-[#E1306C]/20 hover:bg-[#E1306C]/20 text-[#E1306C] rounded-xl text-xs font-bold transition-all hover:scale-[1.02] text-left cursor-pointer"
                  >
                    <Instagram size={14} className="shrink-0" />
                    <span>Instagram</span>
                  </button>

                  {/* Facebook */}
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://forenclue.in/cases?case=' + sharingCase.id)}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2.5 bg-[#1877f2]/10 border border-[#1877f2]/20 hover:bg-[#1877f2]/20 text-[#1877f2] rounded-xl text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Facebook size={14} className="shrink-0" />
                    <span>Facebook</span>
                  </a>

                  {/* System native share menu */}
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: sharingCase.title,
                          text: sharingCase.summary,
                          url: `https://forenclue.in/cases?case=${sharingCase.id}`
                        }).catch(console.warn);
                      } else {
                        alert("Native system menu is not supported on this device's browser window. Use our copying or platform options above!");
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 bg-warning/5 border border-warning/10 hover:bg-warning/15 text-warning rounded-xl text-xs font-bold transition-all hover:scale-[1.02] text-left cursor-pointer"
                  >
                    <Share2 size={14} className="shrink-0" />
                    <span>System Menu</span>
                  </button>

                </div>
              </div>

              {/* QR and Custom Generated Sticker Exporter Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/5">
                {/* QR Code preview */}
                <div className="bg-[#18191c] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center mb-3 shadow-lg relative group">
                    <QrCode size={80} className="text-black shrink-0" />
                    <div className="absolute inset-0 bg-warning/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <span className="bg-black text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded">Scan VR</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase text-warning tracking-wider">Device Mirror</span>
                  <p className="text-[9px] text-[#8e8f99] mt-1 max-w-[170px] leading-relaxed">Scan QR code with smartphone camera to study on secondary screen.</p>
                </div>

                {/* Evidence ID Tag Snapshot Generator Preview */}
                <div className="bg-[#18191c] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-mono text-warning uppercase font-bold">CASE EVIDENCE TICKET</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                    </div>
                    {/* Simulated Polaroid Specimen Label layout */}
                    <div className="bg-white text-black p-2.5 rounded-lg font-mono text-[8px] border-l-4 border-warning shadow-md space-y-1">
                      <div><strong className="text-[9.5px] uppercase text-zinc-900 leading-tight block">{sharingCase.title.length > 24 ? sharingCase.title.substring(0, 24) + '...' : sharingCase.title}</strong></div>
                      <div className="flex justify-between border-t border-zinc-200 pt-1 mt-1 text-zinc-500 font-bold">
                        <span>TAG: {sharingCase.tag}</span>
                        <span>YEAR: {sharingCase.year}</span>
                      </div>
                      <div className="flex justify-between text-zinc-500 font-bold">
                        <span>LOC: {sharingCase.location}</span>
                        <span>DIFFICULTY: {sharingCase.difficulty}</span>
                      </div>
                      <div className="text-center font-bold tracking-widest text-[9.5px] border-t border-dashed border-zinc-300 pt-1.5 text-zinc-800">
                        ||||| | ||| |||| | {sharingCase.id.substring(0, 8).toUpperCase()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <button 
                      onClick={() => {
                        window.print();
                      }}
                      className="w-full py-2 bg-white/5 border border-white/10 hover:border-warning/30 hover:bg-warning hover:text-black transition-all rounded-lg text-[9px] font-black uppercase tracking-widest text-text-muted flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download size={10} />
                      <span>Print Evidence Tag</span>
                    </button>
                  </div>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
