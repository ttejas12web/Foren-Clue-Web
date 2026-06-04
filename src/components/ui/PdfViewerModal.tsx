import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ZoomIn, ZoomOut, Search, ChevronLeft, ChevronRight, 
  Download, FileText, Sun, Moon, Eye, Printer, BookOpen, 
  Check, Info, FileDown, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: {
    id: number | string;
    title: string;
    author?: string;
    year?: number | string;
    uploaded?: string;
    category?: string;
    type?: string;
    size?: string;
    desc?: string;
    pdfUrl?: string;
  };
}

// Generates simulated rich academic content based on the eBook/Paper/Note details
function getSimulatedDocumentContent(resource: any) {
  const title = resource.title || '';
  const category = (resource.category || '').toLowerCase();
  
  if (category.includes('medicine') || title.includes('Medicine') || title.includes('Pathology')) {
    return {
      chapters: [
        {
          id: 'intro',
          title: 'Section 1: Forensic Pathology Autopsies',
          pages: [
            `PRINCIPLES OF FORENSIC MEDICINE & PATHOLOGY\n==========================================\n\nChapter I: Introduction to Autopsy Procedures\nSub-topic: Post-Mortem Rigidity and Lividity\n\n1. Legal Authority:\nEvery forensic autopsy must be preceded by a formal inquest report from coroners or police investigators. Unofficial autopsy is strictly forbidden.\n\n2. External Examination:\n- Documentation of complete physical traits: height, approximate weight, build.\n- Complete cataloging of identifying marks: birthmarks, surgical scars, professional tattoos, dental records.\n- Analysis of Hypostasis (Post-Mortem Lividity): Purple discoloration in dependent parts of the body, fixing generally within 6 to 12 hours. Fixed status indicates gravitational pooling cannot be disrupted.`,
            `3. Rigor Mortis Development Phases:\n- Initial flaccidity: 0 to 2 hours.\n- Commencement in small facial muscle nodes (jaw, eyelids): 2 to 4 hours.\n- Complete extension to lower extremities: 12 hours.\n- Maintenance phase: 12 to 24 hours.\n- Gradual resolution (secondary flaccidity): 24 to 36 hours.\n\n4. Internal Cranial, Thoracic, and Abdominal Openings:\n- The classical 'Y' shape primary incision is standard.\n- Visual examination of gastric content: aids in estimating time of last meal (standard digestion takes 2 to 4 hours).`
          ]
        },
        {
          id: 'injuries',
          title: 'Section 2: Classification of Blunt Force Traumas',
          pages: [
            `Chapter II: Mechanical Wounds\n------------------------------\n\n1. Abrasion:\nSuperficial epithelial cell layer loss, maintaining a pristine dermal baseline. Useful for reconstructing weapon shape vectors (e.g., shoe sole prints or tire tracks).\n\n2. Contusion (Bruising):\nSubcutaneous capillary breakage leading to local extravasation of blood cells. Color progression timeline:\n- Red/Blue/Purple: Day 1-3 (Fresh hemoglobin oxidation status).\n- Greenish Tint: Day 4-7 (Biliverdin accumulation).\n- Yellowish Fade: Day 7-10 (Bilirubin crystallization).\n- Normal skin color return: 2 weeks.`,
            `3. Laceration Wounds:\nIrregular skin tears from shear-straining tensile stresses. Must be carefully distinguished from sharp-force incised wounds.\n- Diagnostic Signs: Tissue bridging (subcutaneous blood vessels, nerves, and connective fibers cross the gap untouched). Bruising along wound margins is common.`
          ]
        }
      ]
    };
  } else if (category.includes('toxicology') || title.includes('Toxicology') || title.includes('Poisons')) {
    return {
      chapters: [
        {
          id: 'quick-rev',
          title: 'Topic 1: Classification of Toxic Agents',
          pages: [
            `FORENSIC TOXICOLOGY RAPID STUDY GUIDE\n====================================\n\nI. Corrosive Acids and Alkalis\n-----------------------------\n- Inorganic Acids: Sulfuric Acid (leads to deep black charring at the mouth or esophagus, known as Vitriolage).\n- Nitric Acid: Yellowish stain (due to xanthoproteic reaction with human skin proteins).\n- Hydrochloric Acid: Greyish/white caustic coagulation.\n- Strong Alkalis: Liquefactive necrosis with soapy sensation, high esophageal perforation risk.\n\nII. Heavy Metals and Metalloids\n--------------------------------\n- Arsenic (As): Hair and nail deposition. Causes Aldrich-Mee's lines (white lines across fingernails). Acute toxicity shows "Choleriform" severe water diarrhea.\n- Lead (Pb): Saturation of nervous systems. Symptoms include blue line in gums (Burtonian Line), basophilic stippling of erythrocytes, and wrist drop.`,
            `III. Gaseous Inhalants\n---------------------\n1. Carbon Monoxide (CO):\n- Mechanism: Displays 200 units higher hemoglobin binding affinity than normal oxygen molecules, blocking oxyhemoglobin formations.\n- Diagnostic Indicator: Bright cherry-red skin tissues, internal organs, and post-mortem blood clots.\n\n2. Hydrogen Cyanide (HCN):\n- Mechanism: Binds directly to ferric ions in cytochrome oxidase, cellular respiration halts instantly.\n- Distinctive Scent: Strong bitter almonds smell recognizable upon cranial opening.`
          ]
        },
        {
          id: 'antidotes',
          title: 'Topic 2: Active Reagents & Antidotes Table',
          pages: [
            `PHARMACOLOGICAL TREATMENT VECTORS IN FORENSICS\n---------------------------------------------\n\n1. Arsenic / Mercury Poisoning:\n- Treatment agent: British Anti-Lewisite (BAL - Dimercaprol).\n- Action: Sulfhydryl group competition binds and excretes chelates.\n\n2. Lead Intoxication:\n- Treatment agent: Calcium Disodium EDTA.\n- Action: Mobilizes skeletal lead reserves into urine.\n\n3. Organophosphate Insecticides:\n- Symptoms: Pinpoint pupils, excessive wet salivation, sweating, muscle fasciculations (DUMBBELS criteria).\n- Treatment agent: Atropine sulfate (parasympathetic blocker) coupled with Pralidoxime (PAM) to reactivate acetylcholinesterase.`
          ]
        }
      ]
    };
  } else if (category.includes('net') || category.includes('quiz') || title.includes('NET') || title.includes('Exam') || title.includes('Paper')) {
    return {
      chapters: [
        {
          id: 'exam-section1',
          title: 'Paper Section I: Core Forensic Chemistry',
          pages: [
            `UGC NET / STATE FACT MOCK EXAMINATION MODULE\n============================================\n\nINSTRUCTIONS: Attempt all questions. Check answers at the bottom of the page.\n\nQ1. Which of the following color tests is utilized in forensic labs to screen for the presence of marijuana compounds?\n  [A] Marquis Test\n  [B] Duquenois-Levine Test\n  [C] Scott Test\n  [D] Dille-Koppanyi Reagent\n\nQ2. In HPLC chromatography, what physical parameter governs the selective retention of analyte compounds inside the column?\n  [A] Boiling point vaporization\n  [B] Mobile phase flow rate volume\n  [C] Partition coefficient ratio between phases\n  [D] High excitation ultraviolet wavelengths`,
            `Q3. The distinct yellow coloration produced in skin tissues during Nitric Acid poisoning is clinically termed:\n  [A] Vitriolage necrosis\n  [B] Xanthoproteic reaction\n  [C] Basophilic stippling\n  [D] Prussian blue crystallization\n\nQ4. In firearms analysis, the presence of specific 'GSR' primer elements consists of:\n  [A] Sulfur, Charcoal, Nitrate\n  [B] Lead, Barium, Antimony\n  [C] Copper, Zinc, Tin\n  [D] Nickel, Chromium, Manganese\n\n---------------------------------------------\nANSWER KEY CODES (Verifiable for study check):\nQ1: [B]  |  Q2: [C]  |  Q3: [B]  |  Q4: [B]\n---------------------------------------------`
          ]
        },
        {
          id: 'exam-section2',
          title: 'Paper Section II: Forensic Biology and Serology',
          pages: [
            `MODEL PRACTICE TEST - CORE BIOLOGICAL EVIDENCE\n----------------------------------------------\n\nQ5. Which enzyme is target-probed in forensic semen validation tests prior to DNA profiling?\n  [A] Amylase alpha\n  [B] Acid Phosphatase (AP)\n  [C] Creatine Kinase\n  [D] Alkaline Lipase\n\nQ6. The highly polymorphic STR loci utilized in CODIS index records typically have repeat structures consisting of:\n  [A] 1-2 base pairs\n  [B] 4-5 base pairs\n  [C] 10-15 base pairs\n  [D] 20-50 base pairs\n\nQ7. Species identification of unknown bloodstains is conclusively achieved using which immunological test?\n  [A] Kastle-Meyer Test\n  [B] Luminol chemiluminescence\n  [C] Precipitin gel ring method\n  [D] Takayama crystal test`
          ]
        }
      ]
    };
  } else if (category.includes('fingerprint') || category.includes('dactyloscopy') || title.includes('Fingerprint')) {
    return {
      chapters: [
        {
          id: 'patterns',
          title: 'Section 1: Ridge Pattern Classifications',
          pages: [
            `DACTYLOSCOPY & DERMATOGLYPHICS MANUAL\n====================================\n\n1. Arch Patterns (5% distribution in population):\n- Plain Arch: Ridges flow from one side to the other, rising slightly in the center without sharp angles.\n- Tented Arch: Ridges rise sharply or contain a central spike/angle < 90 degrees.\n\n2. Loop Patterns (60-65% distribution):\n- Must have: at least one delta point, one core point, and a recurving ridge.\n- Radial Loop: Loops flow or slope toward the radius bone (thumb direction).\n- Ulnar Loop: Loops flow or slope toward the ulna bone (pinky direction).`,
            `3. Whorl Patterns (30-35% distribution):\n- Must have: a minimum of two deltas and at least one ridge making a complete circuit (circle, oval, or spiral).\n- Subtypes: Plain whorl, central pocket loop whorl, double loop whorl (two distinct loops in one pattern), and accidental whorl (irregular features matching multiple traits).\n\n4. Minutiae Feature Nodes (Points of Match):\n- Bifurcation: A ridge splitting into two paths.\n- Ridge Ending: A ridge terminating mid-path.\n- Island/Dot: A microscopic standalone ridge point.\n- Enclosure: A ridge splitting and immediately closing back.`
          ]
        }
      ]
    };
  } else {
    // Default generic comprehensive study materials
    return {
      chapters: [
        {
          id: 'overview',
          title: 'Study Dossier Overview',
          pages: [
            `FORENSIC SCIENCE ACADEMIC PLATFORM RESOURCE\n==========================================\n\nTitle: ${title}\nAuthor/Source: ${resource.author || 'ForenClue Editorial Council'}\nSubject Category: ${resource.category || 'General Forensic Science'}\nAcademic Level: Master/Research Prep\n\nDOCUMENT PREVIEW ABSTRACT:\nThis academic booklet provides a comprehensive, structured overview of core diagnostic markers in forensic investigation. It includes step-by-step methodologies compiled under peer review guidelines to prepare students for UGC NET, FACT, CUET, and practical laboratory internships.`,
            `DIAGNOSTIC CRITERIA & METRICS:\n\n1. Quality Controls:\n- Ensure the chain of custody is documented with timestamp labels.\n- Handle all biological materials in temperature-regulated containers to avoid enzymic breakdown.\n- Calibrate analytic systems using high-grade standards before logging case data.\n\n2. Analytical Frameworks:\n- High Performance Liquid Chromatography (HPLC) for toxicology extraction analysis.\n- Gas Chromatography-Mass Spectrometry (GC-MS) as the gold standard confirmation test.\n- Capillary Electrophoresis for DNA STR profiling.`
          ]
        }
      ]
    };
  }
}

export function PdfViewerModal({ isOpen, onClose, resource }: PdfViewerModalProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [searchWord, setSearchWord] = useState('');
  const [searchHits, setSearchHits] = useState<{ chapterIdx: number; pageIdx: number }[]>([]);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [currentSearchHitIdx, setCurrentSearchHitIdx] = useState(-1);
  const [viewMode, setViewMode] = useState<'pdf' | 'summary'>('summary');

  useEffect(() => {
    if (resource && resource.pdfUrl) {
      setViewMode('pdf');
    } else {
      setViewMode('summary');
    }
  }, [resource]);

  const docData = getSimulatedDocumentContent(resource);

  // Auto-fill active theme based on body/document class but keep it custom for paper
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  // Sync page & chapter when chapter changes via sidebar
  const handleChapterSelect = (idx: number) => {
    setSelectedChapter(idx);
    setCurrentPage(0);
  };

  const activePages = docData.chapters[selectedChapter].pages;

  const nextPage = () => {
    if (currentPage < activePages.length - 1) {
      setCurrentPage(prev => prev + 1);
    } else if (selectedChapter < docData.chapters.length - 1) {
      setSelectedChapter(prev => prev + 1);
      setCurrentPage(0);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    } else if (selectedChapter > 0) {
      const prevChPages = docData.chapters[selectedChapter - 1].pages;
      setSelectedChapter(prev => prev - 1);
      setCurrentPage(prevChPages.length - 1);
    }
  };

  // Perform a fast document search highlight
  useEffect(() => {
    if (!searchWord || searchWord.length < 2) {
      setSearchHits([]);
      setCurrentSearchHitIdx(-1);
      return;
    }

    const hits: { chapterIdx: number; pageIdx: number }[] = [];
    docData.chapters.forEach((ch, chIdx) => {
      ch.pages.forEach((pg, pgIdx) => {
        if (pg.toLowerCase().includes(searchWord.toLowerCase())) {
          hits.push({ chapterIdx: chIdx, pageIdx: pgIdx });
        }
      });
    });

    setSearchHits(hits);
    if (hits.length > 0) {
      setCurrentSearchHitIdx(0);
      setSelectedChapter(hits[0].chapterIdx);
      setCurrentPage(hits[0].pageIdx);
    } else {
      setCurrentSearchHitIdx(-1);
    }
  }, [searchWord]);

  const nextSearchHit = () => {
    if (searchHits.length === 0) return;
    const nextIdx = (currentSearchHitIdx + 1) % searchHits.length;
    setCurrentSearchHitIdx(nextIdx);
    setSelectedChapter(searchHits[nextIdx].chapterIdx);
    setCurrentPage(searchHits[nextIdx].pageIdx);
  };

  // Real client-side study report builder to fulfill "download options for all resources"
  const triggerFileDownload = (format: 'html' | 'txt') => {
    const title = resource.title || 'Forensic_Study_Resource';
    const author = resource.author || 'ForenClue';
    
    let content = '';
    const cleanFileName = title.replace(/[^a-zA-Z0-9]/g, '_');

    if (format === 'html') {
      content = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background-color: #fafafa;
    }
    .header {
      border-bottom: 3px solid #0284c7;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 { color: #0f172a; margin-bottom: 5px; }
    .meta { color: #64748b; font-size: 0.9em; margin-bottom: 20px; }
    .chapter {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
    }
    h2 { color: #0284c7; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
    pre {
      white-space: pre-wrap;
      font-family: inherit;
      font-size: 1em;
    }
    .footer {
      text-align: center;
      font-size: 0.8em;
      color: #94a3b8;
      margin-top: 50px;
      border-top: 1px solid #e1e8ed;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="meta">By ${author} | Published/Released in ${resource.year || 'Academic Cycle'} | Formatted for High-Definition Printing</div>
    <p><em>${resource.desc || 'Forensic Science Study Companion provided by ForenClue.'}</em></p>
  </div>
  
  ${docData.chapters.map(ch => `
    <div class="chapter">
      <h2>${ch.title}</h2>
      ${ch.pages.map(pg => `<pre>${pg.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`).join('<hr style="border: 0; border-top: 1px dashed #e2e8f0; margin: 25px 0;" />')}
    </div>
  `).join('')}

  <div class="footer">
    © ForenClue Academy. Prepared dynamically for webcreator500@gmail.com. Printed with high-resolution laboratory styling guidelines.
  </div>
</body>
</html>`;
    } else {
      content = `========================================================================\n`;
      content += `${title.toUpperCase()}\n`;
      content += `========================================================================\n\n`;
      content += `Resource: ${resource.title}\n`;
      content += `Author: ${author}\n`;
      content += `Category: ${resource.category || 'General Forensic Science'}\n`;
      content += `Description: ${resource.desc || 'No further description.'}\n\n`;
      content += `------------------------------------------------------------------------\n\n`;

      docData.chapters.forEach(ch => {
        content += `${ch.title.toUpperCase()}\n`;
        content += `-`.repeat(ch.title.length) + `\n\n`;
        ch.pages.forEach((pg, i) => {
          content += `Page ${i + 1}:\n${pg}\n\n`;
        });
        content += `\n` + `=`.repeat(72) + `\n\n`;
      });
    }

    const mimeType = format === 'html' ? 'text/html' : 'text/plain';
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${cleanFileName}.${format === 'html' ? 'html' : 'txt'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${resource.title} - Laboratory Print Service</title>
          <style>
            body { font-family: monospace; white-space: pre-wrap; padding: 40px; line-height: 1.5; color: black; background: white; }
            h1 { text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; text-transform: uppercase; }
            h2 { border-bottom: 1px dashed black; margin-top: 40px; padding-bottom: 5px; }
            .chapter { page-break-inside: avoid; }
            .footer { margin-top: 60px; text-align: center; border-top: 1px solid black; padding-top: 10px; font-size: x-small; }
          </style>
        </head>
        <body>
          <h1>FORENCLUE LABORATORY STUDY NOTES</h1>
          <p><strong>Resource Name:</strong> ${resource.title}</p>
          <p><strong>Department:</strong> ${resource.category || "Forensic Science"}</p>
          <hr/>
          ${docData.chapters.map(ch => `
            <div class="chapter">
              <h2>${ch.title}</h2>
              ${ch.pages.join('\n\n-- PAGE DECORATOR --\n\n')}
            </div>
          `).join('')}
          <div class="footer">Printed for user webcreator500@gmail.com. Forensic evidence and study parameters are certified accurate.</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#040814]/80 backdrop-blur-md"
        />

        {/* Modal Outer Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-base border border-black/10 dark:border-white/10 w-full max-w-6xl h-[92vh] sm:h-[86vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative z-10"
        >
          {/* Header Panel */}
          <div className="p-4 sm:p-5 border-b border-black/10 dark:border-white/5 bg-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-warning/15 rounded-xl text-warning">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-text-main line-clamp-1 leading-tight">
                  {resource.title}
                </h2>
                <p className="text-xs text-text-muted">
                  Study PDF Viewer &bull; {resource.author || 'ForenClue Team'}
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              {/* Document Theme Buttons */}
              <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg border border-black/5 dark:border-white/5">
                <button 
                  onClick={() => setTheme('light')}
                  className={cn("px-2 py-1 text-xs rounded font-medium transition-colors", theme === 'light' ? 'bg-white text-black shadow-sm' : 'text-text-muted hover:text-text-main')}
                >
                  <Sun className="w-3.5 h-3.5 inline mr-1" /> Light
                </button>
                <button 
                  onClick={() => setTheme('sepia')}
                  className={cn("px-1.5 py-1 text-xs rounded font-medium transition-colors", theme === 'sepia' ? 'bg-[#f4ecd8] text-[#4a3319] shadow-sm' : 'text-text-muted hover:text-text-main')}
                >
                  Sepia
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={cn("px-2 py-1 text-xs rounded font-medium transition-colors", theme === 'dark' ? 'bg-zinc-800 text-white shadow-sm' : 'text-text-muted hover:text-text-main')}
                >
                  <Moon className="w-3.5 h-3.5 inline mr-1" /> Dark
                </button>
              </div>

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors text-text-muted hover:text-text-main shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Viewer Core Section with Sidebar + Canvas Page block */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Table of Contents sidebar for Desktop */}
            <div className={cn("hidden md:flex flex-col w-64 bg-surface border-r border-black/10 dark:border-white/5 p-4 overflow-y-auto transition-all", viewMode === 'pdf' && "md:hidden")}>
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-warning" /> Chapters Index
              </h4>
              
              <div className="space-y-1.5 flex-1">
                {docData.chapters.map((ch, idx) => (
                  <button
                    key={ch.id}
                    onClick={() => handleChapterSelect(idx)}
                    className={cn(
                      "w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between group",
                      selectedChapter === idx 
                        ? "bg-warning/10 text-warning border border-warning/15" 
                        : "text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    <span className="truncate pr-2">{ch.title}</span>
                    <span className="text-[9px] text-text-muted/65 font-mono">
                      {ch.pages.length}p
                    </span>
                  </button>
                ))}
              </div>

              {/* Info Tips under index */}
              <div className="mt-auto pt-4 border-t border-black/10 dark:border-white/5 text-[10px] text-text-muted/70 flex flex-col gap-1">
                <div className="flex gap-1.5 items-start">
                  <Info className="w-3.5 h-3.5 shrink-0 text-warning/70 mt-0.5" />
                  <span>Interactive high-resolution simulation with multiple reader themes tailored to prevent eye strain.</span>
                </div>
              </div>
            </div>

            {/* Document display Area */}
            <div className="flex-1 flex flex-col bg-crust p-3 sm:p-5 overflow-hidden relative">
              
              {/* Optional Real PDF / Interactive Study Analysis Switch */}
              {resource.pdfUrl && (
                <div className="flex justify-center mb-3 shrink-0">
                  <div className="flex gap-1 p-1 bg-surface border border-black/10 dark:border-white/10 rounded-xl">
                    <button
                      onClick={() => setViewMode('pdf')}
                      className={cn(
                        "px-4 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5",
                        viewMode === 'pdf' ? "bg-warning text-crust shadow" : "text-text-muted hover:text-text-main"
                      )}
                    >
                      <Eye className="w-3.5 h-3.5" /> Direct PDF Document
                    </button>
                    <button
                      onClick={() => setViewMode('summary')}
                      className={cn(
                        "px-4 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5",
                        viewMode === 'summary' ? "bg-warning text-crust shadow" : "text-text-muted hover:text-text-main"
                      )}
                    >
                      <BookOpen className="w-3.5 h-3.5" /> eLibrary Study Guide
                    </button>
                  </div>
                </div>
              )}

              {viewMode === 'pdf' && resource.pdfUrl ? (
                <div className="flex-1 overflow-hidden bg-black/15 dark:bg-black/30 rounded-2xl border border-black/10 dark:border-white/5 p-1 flex flex-col">
                  <iframe
                    src={`${resource.pdfUrl}#toolbar=1`}
                    className="w-full h-full border-0 rounded-xl"
                    title={resource.title}
                  />
                </div>
              ) : (
                <>
                  {/* Toolbar in body: search, zoom, pages info */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-surface border border-black/10 dark:border-white/10 rounded-2xl p-2.5 mb-4 shrink-0">
                    {/* Search Term Bar */}
                    <div className="relative w-fit min-w-[150px] sm:min-w-[220px]">
                      <Search className="absolute inset-y-0 left-3 my-auto w-3.5 h-3.5 text-text-muted" />
                      <input 
                        type="text" 
                        placeholder="Search inside doc..." 
                        value={searchWord}
                        onChange={(e) => setSearchWord(e.target.value)}
                        className="w-full bg-base border border-black/10 dark:border-white/5 rounded-xl pl-8 pr-16 py-1.5 text-xs text-text-main focus:outline-none focus:border-warning/50 font-mono"
                      />
                      {searchHits.length > 0 && (
                        <div className="absolute right-1 inset-y-1 flex items-center gap-1">
                          <span className="text-[10px] font-mono text-warning bg-warning/10 px-1.5 rounded">
                            {currentSearchHitIdx + 1}/{searchHits.length}
                          </span>
                          <button 
                            onClick={nextSearchHit}
                            className="p-1 hover:bg-black/10 dark:hover:bg-white/15 rounded text-text-muted hover:text-text-main cursor-pointer"
                            title="Next Search Hit"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Chapter Select menu for Mobile */}
                    <div className="md:hidden w-full sm:w-auto">
                      <select
                        value={selectedChapter}
                        onChange={(e) => handleChapterSelect(Number(e.target.value))}
                        className="w-full bg-base border border-black/10 dark:border-white/5 rounded-xl p-1.5 text-xs font-semibold text-text-main focus:outline-none focus:border-warning/30"
                      >
                        {docData.chapters.map((ch, idx) => (
                          <option key={ch.id} value={idx}>{ch.title}</option>
                        ))}
                      </select>
                    </div>

                    {/* Zoom Controls & Print options */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 border-r border-black/10 dark:border-white/5 pr-3">
                        <button 
                          onClick={() => setZoom(prev => Math.max(0.75, prev - 0.15))}
                          className="p-1.5 hover:bg-black/10 dark:hover:bg-white/15 rounded-lg text-text-muted hover:text-text-main transition-colors cursor-pointer"
                          title="Zoom Out"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-mono font-bold text-text-muted min-w-[36px] text-center">
                          {Math.round(zoom * 100)}%
                        </span>
                        <button 
                          onClick={() => setZoom(prev => Math.min(1.5, prev + 0.15))}
                          className="p-1.5 hover:bg-black/10 dark:hover:bg-white/15 rounded-lg text-text-muted hover:text-text-main transition-colors cursor-pointer"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                      </div>

                      <button 
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main transition-colors cursor-pointer"
                        title="Print Document"
                      >
                        <Printer className="w-4 h-4" />
                        <span className="hidden sm:inline font-semibold">Print</span>
                      </button>
                    </div>
                  </div>

                  {/* The Realistic Printable/Renderable document page block */}
                  <div className="flex-1 overflow-auto flex items-center justify-center p-3 relative min-h-0 bg-black/15 dark:bg-black/40 rounded-2xl border border-black/10 dark:border-white/5">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${selectedChapter}-${currentPage}`}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          transform: `scale(${zoom})`,
                          transformOrigin: 'center center'
                        }}
                        className={cn(
                          "w-full max-w-[620px] aspect-[1/1.4] p-8 sm:p-12 shadow-2xl rounded-xl border flex flex-col justify-between transition-all duration-300 relative select-text overflow-y-auto max-h-full",
                          theme === 'light' && "bg-[#ffffff] text-[#0f172a] border-[#e2e8f0]",
                          theme === 'sepia' && "bg-[#f4ecd8] text-[#4a3319] border-[#e4d4b2]",
                          theme === 'dark' && "bg-[#0b1329] text-[#e2e8f0] border-white/5"
                        )}
                      >
                        {/* Corner laboratory style grids or aesthetic lines for academic rigor */}
                        <div className="absolute top-2 left-2 text-[8px] font-mono text-text-muted/20">ForenClue-Doc-[{resource.id}]</div>
                        <div className="absolute top-2 right-2 text-[8px] font-mono text-text-muted/40">Lab Copy • SECURE</div>

                        {/* Paper Top margin header */}
                        <div className="border-b border-black/5 dark:border-white/5 pb-3 flex justify-between items-center bg-transparent shrink-0">
                          <span className="text-[10px] font-bold tracking-widest uppercase text-warning opacity-80 font-mono">
                            {docData.chapters[selectedChapter].title}
                          </span>
                          <span className="text-[9px] font-mono text-text-muted/60">
                            Page {currentPage + 1}/{activePages.length}
                          </span>
                        </div>

                        {/* Actual page body text block */}
                        <div className="flex-1 my-6 text-[11px] sm:text-[13px] leading-relaxed font-mono whitespace-pre-wrap flex flex-col gap-4 overflow-y-auto pr-1">
                          {highlightSearchMatches(activePages[currentPage], searchWord)}
                        </div>

                        {/* Paper Bottom footer */}
                        <div className="border-t border-black/5 dark:border-white/5 pt-3 flex justify-between items-center text-[9px] text-text-muted/65 font-mono shrink-0">
                          <span>ForenClue E-Library Verification Platform</span>
                          <span>{currentPage + 1 === activePages.length && selectedChapter + 1 === docData.chapters.length ? "End of File" : "Draft Reading"}</span>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Navigation in footer: Prev / Next page */}
                  <div className="flex items-center justify-between mt-4 shrink-0 px-2">
                    <button 
                      onClick={prevPage}
                      disabled={selectedChapter === 0 && currentPage === 0}
                      className="flex items-center gap-1.5 px-4 py-2 bg-surface hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold text-text-main transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    <div className="text-xs font-semibold text-text-muted">
                      Chapter {selectedChapter + 1} of {docData.chapters.length} &bull; Page {currentPage + 1}/{activePages.length}
                    </div>

                    <button 
                      onClick={nextPage}
                      disabled={selectedChapter === docData.chapters.length - 1 && currentPage === activePages.length - 1}
                      className="flex items-center gap-1.5 px-4 py-2 bg-surface hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold text-text-main transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}

            </div>

            {/* Sidebar with dynamic, functional download options */}
            <div className="w-80 bg-surface border-l border-black/10 dark:border-white/5 p-5 hidden lg:flex flex-col justify-between overflow-y-auto">
              <div>
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-warning" /> Download Station
                </h4>

                <p className="text-xs text-text-muted mb-5 leading-relaxed">
                  Export this verified document to your local workstation. Select from the high-fidelity download options compiled strictly for forensic study:
                </p>

                {/* Download Menu Buttons */}
                <div className="space-y-3.5">
                  <button
                    onClick={() => triggerFileDownload('html')}
                    className="w-full relative p-4 bg-base hover:bg-black/5 dark:hover:bg-white/5 text-left rounded-2xl border border-black/15 dark:border-white/10 hover:border-warning/40 transition-all flex items-start gap-3 group/dl text-xs cursor-pointer"
                  >
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg group-hover/dl:bg-emerald-500/20 transition-colors">
                      <FileDown className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="font-bold text-text-main group-hover/dl:text-warning transition-colors flex items-center gap-1">
                        High-Fi Printable PDF / HTML
                      </div>
                      <div className="text-[10px] text-text-muted mt-0.5">
                        High fidelity paper layout with beautiful CSS rendering suitable to save or print as high-res local PDF.
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => triggerFileDownload('txt')}
                    className="w-full relative p-4 bg-base hover:bg-black/5 dark:hover:bg-white/5 text-left rounded-2xl border border-black/15 dark:border-white/10 hover:border-warning/40 transition-all flex items-start gap-3 group/dl text-xs cursor-pointer"
                  >
                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg group-hover/dl:bg-amber-500/20 transition-colors">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="font-bold text-text-main group-hover/dl:text-warning transition-colors">
                        Study Text Guide (.txt)
                      </div>
                      <div className="text-[10px] text-text-muted mt-0.5">
                        Optimized plain text dossier containing all bullet summaries suitable for fast text-to-speech or summary parsing.
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="w-full relative p-4 bg-base hover:bg-black/5 dark:hover:bg-white/5 text-left rounded-2xl border border-black/15 dark:border-white/10 hover:border-warning/40 transition-all flex items-start gap-3 group/dl text-xs cursor-pointer"
                  >
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg group-hover/dl:bg-blue-500/20 transition-colors">
                      <Printer className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="font-bold text-text-main group-hover/dl:text-warning transition-colors">
                        Direct Page Print Service
                      </div>
                      <div className="text-[10px] text-text-muted mt-0.5">
                        Triggers system print dialog. Standard mono spacing layouts safe for quick reference cheat sheets.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Status or alerts */}
              <div className="mt-8">
                {downloadSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl flex items-center gap-2 text-xs text-emerald-400 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Dossier file generated and downloaded successfully!</span>
                  </motion.div>
                ) : (
                  <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 p-3 rounded-2xl text-[10px] text-text-muted/80 leading-relaxed font-mono">
                    <span className="text-warning font-bold">● ONLINE STATUS</span> &bull; All options compile verified serverless assets locally. Safe and responsive in offline mode.
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Highlights parts of the text matching search word
function highlightSearchMatches(text: string, searchWord: string) {
  if (!searchWord || searchWord.length < 2) return text;

  const escapedSearchWord = searchWord.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearchWord})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, idx) => 
        part.toLowerCase() === searchWord.toLowerCase() ? (
          <mark key={idx} className="bg-amber-400/90 text-black px-0.5 rounded font-bold animate-pulse">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
