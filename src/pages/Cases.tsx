import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EvidenceMarker } from '@/components/ui/EvidenceMarker';
import { MagnifyingGlassViewer } from '@/components/ui/ThreeDElement';
import { CrimeSceneViewer, Evidence } from '@/components/ui/CrimeSceneViewer';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  Loader2, Sparkles, X, Box, FileText, ChevronRight, Clock, 
  MapPin, Microscope, Info, Search, Filter, Brain, Dna, 
  Target, Fingerprint, Database, AlertCircle, CheckCircle2,
  Trophy, BookOpen
} from 'lucide-react';
import Markdown from 'react-markdown';

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
  evidenceLabels?: string[];
  attachments?: string[];
}

interface AIParams {
  type: string;
  difficulty: string;
  technique: string;
}

interface GeneratedCaseData {
  title: string;
  story: string;
  evidence: Evidence[];
  suspects: { name: string; description: string; alibi: string; motive: string }[];
  quiz: { question: string; options: string[]; answer: number; explanation: string }[];
  conclusion: string;
}

// --- Data ---
const REAL_CASES: CaseFile[] = [
  {
    id: 'shark-arm',
    title: "The Shark Arm Mystery",
    tag: "Forensic Serology",
    year: "1935",
    location: "Sydney, Australia",
    difficulty: "Advanced",
    type: "Homicide",
    image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=1000",
    summary: "A captured tiger shark vomited a human arm, leading to a murder investigation that challenged the legal definition of a corpse.",
    details: `
### THE INVESTIGATION
In April 1935, a tiger shark caught off Coogee Beach vomited a human arm. Forensic examination by Dr. Palmer revealed the arm was not bitten off but surgically removed.

### FORENSIC BREAKTHROUGHS
*   **Fingerprint Recovery:** Despite partial digestion, experts recovered a clear fingerprint from the thumb.
*   **Tattoo Identification:** A distinctive tattoo of two boxers led to the identification of James Smith, a missing small-time criminal.
*   **Legal Precedent:** The case reached the High Court of Australia, debating whether an arm alone constitutes a body for a murder charge.

### TECHNIQUES USED
1.  **Dactyloscopy:** Advanced fingerprint recovery from water-damaged skin.
2.  **Surgical Analysis:** Determining the method of dismemberment.
3.  **Marine Biology:** Estimating digestion rates to determine immersion timing.
    `,
    evidenceLabels: ['Fingerprint', 'Surgical Tool Marks', 'Tattoo Card'],
    attachments: ['Autopsy Report', 'Fingerprint Match', 'Court Transcript']
  },
  {
    id: 'btk-digital',
    title: "The BTK Killer Capture",
    tag: "Digital Forensics",
    year: "2005",
    location: "Wichita, Kansas",
    difficulty: "Expert",
    type: "Cold Case",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000",
    summary: "After 30 years of evasion, Dennis Rader was caught through a single piece of metadata hidden on a floppy disk.",
    details: `
### THE CASE
Dennis Rader, known as 'BTK', terrorized Wichita for decades. In 2004, he resumed communication, believing he was untraceable.

### FORENSIC BREAKTHROURHS
*   **Metadata Extraction:** Police received a purple floppy disk. Analysts examined the FAT system.
*   **Deleted Code Recovery:** Forensic software recovered a deleted Word document.
*   **Identity Leak:** Metadata listed 'Christ Lutheran Church' and 'Dennis' as the last editor.

### TECHNIQUES USED
1.  **FAT System Analysis:** Deep system file inspection.
2.  **Data Carving:** Recovering fragments from unallocated space.
3.  **Registry Correlation:** Mapping digital footprints to physical locations.
    `,
    evidenceLabels: ['Floppy Disk', 'Word Metadata', 'Church Records'],
    attachments: ['Digital Metadata Log', 'Recovery Report', 'Arrest Record']
  },
  {
    id: 'romanov-dna',
    title: "The Romanov Identification",
    tag: "DNA Analysis",
    year: "1991",
    location: "Yekaterinburg, Russia",
    difficulty: "Scientific",
    type: "Cold Case",
    image: "https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&q=80&w=1000",
    summary: "The mystery of the missing Russian Imperial family solved using mitochondrial DNA.",
    details: `
### THE DISCOVERY
Mass graves discovered in the Ural mountains were believed to contain the remains of Tsar Nicholas II.

### FORENSIC BREAKTHROUGHS
*   **mtDNA Sequencing:** Used to check remains against living relatives like HRH Prince Philip.
*   **Heteroplasmy:** A rare mutation found in Nicholas II and his brother confirmed identity.
*   **Anthropology:** Matched skeletal ages and dental records to imperial files.

### TECHNIQUES USED
1.  **Mitochondrial DNA (mtDNA):** Matrilineal lineage tracking.
2.  **Facial Superimposition:** Skeletal measurements vs portraits.
    `,
    evidenceLabels: ['Skeletal Remains', 'Living Sample DNA', 'Imperial Records'],
    attachments: ['mtDNA Sequence', 'Anthropology Report', 'Family Tree']
  }
];

// --- AI Setup ---
let aiInstance: GoogleGenAI | null = null;
function getAI() {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY_MISSING");
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
}

export default function Cases() {
  const [activeView, setActiveView] = useState<'archive' | 'lab'>('archive');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedCase, setSelectedCase] = useState<CaseFile | null>(null);

  // AI Simulation State
  const [aiParams, setAiParams] = useState<AIParams>({ type: 'Homicide', difficulty: 'Beginner', technique: 'DNA' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCase, setGeneratedCase] = useState<GeneratedCaseData | null>(null);
  const [analyzeMode, setAnalyzeMode] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [activeTab, setActiveTab] = useState<'story' | 'threeD' | 'suspects'>('story');

  const filteredArchive = useMemo(() => {
    return REAL_CASES.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           c.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'All' || c.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterType]);

  const generateAICase = async () => {
    setIsGenerating(true);
    setGeneratedCase(null);
    setAnalyzeMode(false);
    setQuizFinished(false);
    setQuizScore(0);
    setCurrentQuizIndex(0);
    
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a detailed forensic case for training.
        Type: ${aiParams.type}
        Difficulty: ${aiParams.difficulty}
        Focal Technique: ${aiParams.technique}
        
        Return JSON with:
        "title": string,
        "story": markdown (narrative, investigation steps, evidence findings),
        "evidence": array of {id, name, finding, type, position:[x,y,z]} (types: blood, fingerprint, weapon, body, glass, generic),
        "suspects": array of {name, description, alibi, motive},
        "quiz": array of 3 {question, options:string[], answer:number (index), explanation},
        "conclusion": string.
        
        Position constraints: x and z between -7 and 7. y is 0.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              story: { type: Type.STRING },
              evidence: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    finding: { type: Type.STRING },
                    type: { type: Type.STRING },
                    position: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                  }
                }
              },
              suspects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    alibi: { type: Type.STRING },
                    motive: { type: Type.STRING }
                  }
                }
              },
              quiz: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    answer: { type: Type.INTEGER },
                    explanation: { type: Type.STRING }
                  }
                }
              },
              conclusion: { type: Type.STRING }
            },
            required: ["title", "story", "evidence", "suspects", "quiz", "conclusion"]
          }
        }
      });
      
      const data = JSON.parse(response.text);
      setGeneratedCase(data);
      setActiveTab('story');
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (!generatedCase) return;
    if (idx === generatedCase.quiz[currentQuizIndex].answer) {
      setQuizScore(s => s + 1);
    }
    
    if (currentQuizIndex < generatedCase.quiz.length - 1) {
      setCurrentQuizIndex(i => i + 1);
    } else {
      setQuizFinished(true);
    }
  };

  return (
    <div className="min-h-screen bg-base py-24 pb-32">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0 forensic-grid" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* View Switcher */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex p-1 bg-surface border border-black/10 dark:border-white/5 rounded-2xl shadow-2xl">
            <button 
              onClick={() => setActiveView('archive')}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all ${activeView === 'archive' ? 'bg-warning text-crust' : 'text-text-muted hover:text-text-main'}`}
            >
              <Database size={14} /> Investigation Archive
            </button>
            <button 
              onClick={() => setActiveView('lab')}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all ${activeView === 'lab' ? 'bg-warning text-crust shadow-[0_0_20px_rgba(255,191,0,0.3)]' : 'text-text-muted hover:text-text-main'}`}
            >
              <Brain size={14} /> AI Simulation Lab
            </button>
          </div>
        </div>

        {activeView === 'archive' ? (
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
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <span className="px-3 py-1 bg-warning text-crust text-[8px] font-black uppercase tracking-widest rounded-lg">{item.tag}</span>
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
                      <div className="flex gap-2">
                        {item.evidenceLabels?.map(l => (
                          <span key={l} className="w-2 h-2 rounded-full bg-warning/40" title={l} />
                        ))}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-warning group-hover:translate-x-2 transition-transform inline-flex items-center gap-1">
                        View Dossier <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            {/* Lab Simulation Mode */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Controls Sidebar */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-surface border border-black/10 dark:border-white/5 p-8 rounded-3xl shadow-2xl">
                  <div className="flex items-center gap-2 mb-8 text-warning">
                    <Brain size={24} />
                    <h2 className="text-xl font-black uppercase tracking-tight">Simulator Config</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Crime Classification</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Homicide', 'Theft', 'Cyber', 'Forgery'].map(t => (
                          <button 
                            key={t}
                            onClick={() => setAiParams({...aiParams, type: t})}
                            className={`p-3 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all ${aiParams.type === t ? 'bg-warning/10 border-warning text-warning shadow-[0_0_15px_rgba(255,191,0,0.1)]' : 'border-black/10 dark:border-white/5 text-text-muted hover:border-black/10 dark:border-white/10'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Specialized Area</label>
                      <select 
                        value={aiParams.technique}
                        onChange={(e) => setAiParams({...aiParams, technique: e.target.value})}
                        className="w-full bg-crust border border-black/10 dark:border-white/5 rounded-xl p-4 text-xs font-bold outline-none focus:border-warning/50 appearance-none"
                      >
                        <option>DNA Phenotyping</option>
                        <option>Ballistics</option>
                        <option>Digital Forensics</option>
                        <option>Toxicology</option>
                        <option>Odontology</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Cognitive Difficulty</label>
                      <div className="flex gap-2">
                        {['Beginner', 'Advanced', 'Expert'].map(d => (
                          <button 
                            key={d}
                            onClick={() => setAiParams({...aiParams, difficulty: d})}
                            className={`flex-1 py-3 rounded-xl border text-[8px] font-bold uppercase tracking-widest transition-all ${aiParams.difficulty === d ? 'bg-warning/10 border-warning text-warning' : 'border-black/10 dark:border-white/5 text-text-muted hover:border-black/10 dark:border-white/10'}`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={generateAICase}
                      disabled={isGenerating}
                      className="w-full bg-warning text-crust py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-[0_0_30px_rgba(255,191,0,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles className="group-hover:animate-pulse" size={16} />}
                      {isGenerating ? "Synthesizing Evidence..." : "Initiate Simulation"}
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-warning/5 border border-warning/10 rounded-2xl">
                   <div className="flex items-center gap-2 mb-3">
                      <Target size={16} className="text-warning" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-warning">Simulation Goal</span>
                   </div>
                   <p className="text-[10px] text-text-muted font-medium leading-relaxed italic">
                     This module uses generative intelligence to build complex investigative scenarios. Use the 3D lab to inspect evidence before attempting the final analysis.
                   </p>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-8">
                {generatedCase ? (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="bg-surface border border-black/10 dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
                      {/* Tabs */}
                      <div className="flex border-b border-black/10 dark:border-white/5 shrink-0">
                        {[
                          { id: 'story', icon: FileText, label: 'Investigation File' },
                          { id: 'threeD', icon: Box, label: 'Virtual Scene' },
                          { id: 'suspects', icon: Search, label: 'Suspect Pool' }
                        ].map(t => (
                          <button 
                            key={t.id}
                            onClick={() => setActiveTab(t.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'text-warning border-b-2 border-warning bg-warning/5' : 'text-text-muted hover:text-text-main'}`}
                          >
                            <t.icon size={14} /> {t.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
                        <AnimatePresence mode="wait">
                          {activeTab === 'story' && (
                            <motion.div key="story" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="prose prose-invert prose-warning max-w-none">
                              <h2 className="text-4xl font-heading font-black uppercase tracking-tight text-text-main mb-8 border-l-4 border-warning pl-6">{generatedCase.title}</h2>
                              <div className="text-text-muted">
                                <Markdown>{generatedCase.story}</Markdown>
                              </div>
                            </motion.div>
                          )}

                          {activeTab === 'threeD' && (
                            <motion.div key="threeD" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full absolute inset-0">
                              <CrimeSceneViewer evidence={generatedCase.evidence} className="h-full w-full" />
                            </motion.div>
                          )}

                          {activeTab === 'suspects' && (
                            <motion.div key="suspects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {generatedCase.suspects.map((s, i) => (
                                <div key={i} className="bg-crust p-8 border border-black/10 dark:border-white/5 rounded-2xl hover:border-warning/30 transition-colors">
                                  <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-base rounded-xl flex items-center justify-center border border-black/10 dark:border-white/10">
                                      <Search className="text-text-muted" size={20} />
                                    </div>
                                    <h4 className="text-xl font-heading font-black uppercase italic">{s.name}</h4>
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-warning mb-1 block">Profile</span>
                                      <p className="text-xs text-text-muted italic">"{s.description}"</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-text-muted mb-1 block">Alibi</span>
                                        <p className="text-[10px] font-bold">{s.alibi}</p>
                                      </div>
                                      <div>
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-text-muted mb-1 block">Motive</span>
                                        <p className="text-[10px] font-bold">{s.motive}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-6 border-t border-black/10 dark:border-white/5 bg-crust/50 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                           <AlertCircle size={14} className="text-warning" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Evidence Fully Processed</span>
                        </div>
                        <button 
                          onClick={() => setAnalyzeMode(true)}
                          className="flex items-center gap-2 px-8 py-3 bg-white text-crust font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-warning transition-all"
                        >
                          <Brain size={14} /> Analyze & Solve Case
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-[700px] border-2 border-dashed border-black/10 dark:border-white/5 rounded-3xl flex flex-col items-center justify-center text-center p-12">
                     <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-8 border border-black/10 dark:border-white/10 shadow-2xl">
                        <Database size={40} className="text-text-muted opacity-20" />
                     </div>
                     <h3 className="text-2xl font-heading font-black uppercase italic mb-4 tracking-wider">Awaiting Simulation Data</h3>
                     <p className="text-text-muted max-w-sm font-medium leading-relaxed">
                       Configure the investigation parameters on the sidebar to generate a new forensic challenge.
                     </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
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
                    <h2 className="text-xl font-black uppercase tracking-tight">{selectedCase.title}</h2>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Official Forensic Archive</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCase(null)}
                  className="p-3 bg-black/5 dark:bg-white/5 hover:bg-warning hover:text-crust transition-all rounded-xl"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 flex flex-col lg:flex-row">
                <div className="lg:w-80 p-8 border-r border-black/10 dark:border-white/5 bg-crust/30 space-y-8">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-3 block">Primary Evidence</label>
                    <img src={selectedCase.image} className="w-full aspect-square object-cover rounded-2xl grayscale border border-black/10 dark:border-white/5" alt="Evidence" />
                  </div>

                  {selectedCase.evidenceLabels && (
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

                  {selectedCase.attachments && (
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-4 block">Archive Attachments</label>
                      <div className="space-y-2">
                        {selectedCase.attachments.map(a => (
                          <div key={a} className="group flex items-center justify-between p-4 bg-base border border-black/10 dark:border-white/5 rounded-xl hover:border-warning/30 transition-all cursor-pointer">
                            <div className="flex items-center gap-3">
                              <FileText size={14} className="text-text-muted group-hover:text-warning" />
                              <span className="text-[10px] font-bold text-text-muted group-hover:text-text-main">{a}</span>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar max-h-[70vh]">
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-invert prose-warning max-w-none">
                      <Markdown>{selectedCase.details}</Markdown>
                   </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analyze Mode Modal */}
      <AnimatePresence>
        {analyzeMode && generatedCase && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-base/95 backdrop-blur-2xl flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-surface border border-black/10 dark:border-white/10 w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-warning/10 blur-[100px] pointer-events-none" />

              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-warning text-crust rounded-full flex items-center justify-center font-black">
                    {currentQuizIndex + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">Analysis Terminal</h3>
                    <p className="text-[9px] uppercase tracking-widest text-text-muted">Section {currentQuizIndex + 1} of {generatedCase.quiz.length}</p>
                  </div>
                </div>
                <button onClick={() => setAnalyzeMode(false)} className="text-text-muted hover:text-text-main"><X size={20} /></button>
              </div>

              {!quizFinished ? (
                <div className="space-y-8">
                  <h4 className="text-2xl font-medium leading-normal italic">
                    "{generatedCase.quiz[currentQuizIndex].question}"
                  </h4>
                  <div className="grid gap-3">
                    {generatedCase.quiz[currentQuizIndex].options.map((opt, i) => (
                      <button 
                        key={i}
                        onClick={() => handleAnswer(i)}
                        className="group flex items-center justify-between p-6 bg-base border border-black/10 dark:border-white/10 rounded-2xl text-left hover:border-warning/50 hover:bg-warning/5 transition-all outline-none"
                      >
                        <span className="text-sm font-medium">{opt}</span>
                        <ChevronRight size={18} className="text-text-muted group-hover:text-warning" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-24 h-24 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                     <Trophy size={48} className="text-warning" />
                     <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1.2 }} 
                      className="absolute inset-0 border-2 border-warning rounded-full border-dashed animate-spin-slow" 
                      style={{ animationDuration: '10s' }}
                    />
                  </div>
                  <h3 className="text-4xl font-heading font-black uppercase mb-4">Competency: {Math.round((quizScore / generatedCase.quiz.length) * 100)}%</h3>
                  <p className="text-text-muted mb-10 max-w-sm mx-auto">
                    You accurately analyzed {quizScore} out of {generatedCase.quiz.length} critical aspects of this investigation.
                  </p>
                  
                  <div className="bg-crust p-6 rounded-2xl border border-black/10 dark:border-white/5 mb-10">
                     <h5 className="text-[10px] font-black uppercase tracking-widest text-warning mb-3">Case Conclusion</h5>
                     <p className="text-xs text-text-muted leading-relaxed line-clamp-3">{generatedCase.conclusion}</p>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => { setAnalyzeMode(false); setGeneratedCase(null); }}
                      className="flex-1 py-4 bg-white text-crust font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-warning transition-all"
                    >
                      New Case
                    </button>
                    <button 
                      onClick={() => setAnalyzeMode(false)}
                      className="flex-1 py-4 bg-transparent border border-black/10 dark:border-white/10 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-black/5 dark:bg-white/5 transition-all"
                    >
                      Return to Lab
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
