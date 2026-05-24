import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, FileText, HelpCircle, Archive, Search, Download, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

// Mock Data for demonstration
const resources = {
  books: [
    { id: 1, title: 'Principles of Forensic Medicine', author: 'Apurba Nandy', year: 2021, category: 'Medicine', type: 'PDF', size: '15MB' },
    { id: 2, title: 'Forensic Science: Fundamentals and Investigations', author: 'Anthony J. Bertino', year: 2020, category: 'Fundamentals', type: 'PDF', size: '22MB' },
    { id: 3, title: 'Criminal Investigation', author: 'Charles R. Swanson', year: 2018, category: 'Investigation', type: 'EPUB', size: '10MB' },
    { id: 4, title: 'Digital Forensics and Cyber Crime', author: 'Pavel Gladyshev', year: 2022, category: 'Cyber', type: 'PDF', size: '18MB' },
    { id: 5, title: 'Fundamentals of Forensic DNA Typing', author: 'John M. Butler', year: 2009, category: 'DNA', type: 'PDF', size: '12MB' },
  ],
  notes: [
    { id: 101, title: 'Toxicology Quick Revision', author: 'Dr. Smith', uploaded: '2 Weeks ago', category: 'Toxicology', type: 'PDF', size: '2MB' },
    { id: 102, title: 'Fingerprint Patterns Summary', author: 'Prof. Davis', uploaded: '1 Month ago', category: 'Dactyloscopy', type: 'PDF', size: '4MB' },
    { id: 103, title: 'Ballistics Formula Sheet', author: 'Institute of Ballistics', uploaded: '3 Months ago', category: 'Ballistics', type: 'PDF', size: '1MB' },
  ],
  papers: [
    { id: 201, title: 'UGC NET Forensic Science 2023', year: 2023, category: 'UGC NET', type: 'PDF', size: '5MB' },
    { id: 202, title: 'UGC NET Forensic Science 2022', year: 2022, category: 'UGC NET', type: 'PDF', size: '5.2MB' },
    { id: 203, title: 'FACT Exam Previous Year (2021)', year: 2021, category: 'FACT', type: 'PDF', size: '4.5MB' },
    { id: 204, title: 'CUET PG Forensic Science Sample', year: 2024, category: 'CUET PG', type: 'PDF', size: '3MB' },
  ],
  other: [
    { id: 301, title: 'Forensic Lab Manual', type: 'PDF', size: '8MB', desc: 'Standard operating procedures for laboratory.' },
    { id: 302, title: 'Crime Scene Investigation Kit Checklist', type: 'DOCX', size: '1MB', desc: 'Comprehensive list of equipments.' },
    { id: 303, title: 'Glossary of Forensic Terms', type: 'PDF', size: '2MB', desc: 'A to Z forensic dictionary.' },
  ]
};

const tabs = [
  { id: 'books', label: 'Reference Books', icon: BookOpen },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'papers', label: 'Question Papers', icon: HelpCircle },
  { id: 'other', label: 'Other Stuff', icon: Archive },
];

export default function EBooks() {
  const [activeTab, setActiveTab] = useState('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbEBooks, setDbEBooks] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'ebooks'), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setDbEBooks(list);
    }, (error) => {
      console.warn("Could not load dynamic eBooks:", error);
    });
    return () => unsub();
  }, []);

  const mergedBooks = [
    ...resources.books,
    ...dbEBooks.filter(item => item.tabCategory === 'books' || !item.tabCategory)
  ];

  const mergedNotes = [
    ...resources.notes,
    ...dbEBooks.filter(item => item.tabCategory === 'notes')
  ];

  const mergedPapers = [
    ...resources.papers,
    ...dbEBooks.filter(item => item.tabCategory === 'papers')
  ];

  const mergedOther = [
    ...resources.other,
    ...dbEBooks.filter(item => item.tabCategory === 'other')
  ];

  // Function to filter items based on search query
  const getFilteredItems = (items: any[]) => {
    if (!searchQuery) return items;
    const lowerQuery = searchQuery.toLowerCase();
    return items.filter(item => 
      (item.title || '').toLowerCase().includes(lowerQuery) || 
      (item.author && item.author.toLowerCase().includes(lowerQuery)) ||
      (item.category && item.category.toLowerCase().includes(lowerQuery))
    );
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-base relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-surface z-0 border-b border-black/10 dark:border-white/5">
         <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]"></div>
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-base"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center p-3 bg-warning/10 rounded-2xl mb-6">
              <BookOpen className="w-8 h-8 text-warning" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-text-main uppercase tracking-tight">
              E-<span className="text-warning">Library</span> & Resources
            </h1>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              A comprehensive digital library for forensic students. Access reference books, lecture notes, previous year question papers, and more.
            </p>
          </motion.div>
        </div>

        {/* Global Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-xl mx-auto mb-12 relative"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-text-muted" />
          </div>
          <input
            type="text"
            className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-text-main placeholder-text-muted/50 focus:outline-none focus:border-warning/50 focus:ring-1 focus:ring-warning/50 transition-all font-mono"
            placeholder="Search books, notes, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 relative",
                  isActive ? "text-crust bg-warning" : "text-text-muted bg-surface hover:text-text-main border border-black/10 dark:border-white/5 hover:border-black/10 dark:border-white/10"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-crust" : "text-text-muted")} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {activeTab === 'books' && (
              <motion.div
                key="books"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {getFilteredItems(mergedBooks).length > 0 ? (
                  getFilteredItems(mergedBooks).map((book) => (
                    <ResourceCard key={book.id} item={book} icon={BookOpen} />
                  ))
                ) : (
                  <EmptyState />
                )}
              </motion.div>
            )}

            {activeTab === 'notes' && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {getFilteredItems(mergedNotes).length > 0 ? (
                  getFilteredItems(mergedNotes).map((note) => (
                    <ResourceCard key={note.id} item={note} icon={FileText} />
                  ))
                ) : (
                  <EmptyState />
                )}
              </motion.div>
            )}

            {activeTab === 'papers' && (
              <motion.div
                key="papers"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {getFilteredItems(mergedPapers).length > 0 ? (
                  getFilteredItems(mergedPapers).map((paper) => (
                    <ResourceCard key={paper.id} item={paper} icon={HelpCircle} />
                  ))
                ) : (
                  <EmptyState />
                )}
              </motion.div>
            )}

            {activeTab === 'other' && (
              <motion.div
                key="other"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
              >
                {getFilteredItems(mergedOther).length > 0 ? (
                  getFilteredItems(mergedOther).map((item) => (
                    <ResourceCard key={item.id} item={item} icon={Archive} />
                  ))
                ) : (
                  <EmptyState />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

function ResourceCard({ item, icon: Icon }: { item: any, icon: any }) {
  const handleDownload = () => {
    if (item.pdfUrl) {
      window.open(item.pdfUrl, '_blank');
    } else {
      alert("This document's source file is only an archive preview. Downloads require an upgraded verification key.");
    }
  };

  return (
    <div className="bg-surface border border-black/10 dark:border-white/5 rounded-xl p-6 hover:border-warning/30 transition-colors group flex flex-col h-full">
      {/* Book Image Cover section */}
      {(item.image || item.coverImage) && (
        <div className="h-44 w-full relative overflow-hidden bg-black/10 dark:bg-white/5 rounded-lg mb-4 flex items-center justify-center p-2 border border-black/5 dark:border-white/5">
          <img 
            src={item.image || item.coverImage} 
            alt={item.title} 
            className="max-h-full object-contain rounded shadow-lg group-hover:scale-105 transition-transform duration-500" 
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg text-text-main group-hover:text-warning group-hover:bg-warning/10 transition-colors">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2">
          {item.type && (
            <span className="text-[10px] font-mono px-2 py-1 bg-black/5 dark:bg-white/5 text-text-muted rounded">
              {item.type}
            </span>
          )}
          {item.size && (
            <span className="text-[10px] font-mono px-2 py-1 bg-black/5 dark:bg-white/5 text-text-muted rounded">
              {item.size}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex-grow">
        <h3 className="text-lg font-bold text-text-main mb-2 leading-tight group-hover:text-warning transition-colors">
          {item.title}
        </h3>
        
        <div className="space-y-1 mb-4 text-sm">
          {item.author && <p className="text-text-muted">By: <span className="text-text-main/80">{item.author}</span></p>}
          {item.year && <p className="text-text-muted">Year: <span className="text-text-main/80">{item.year}</span></p>}
          {item.uploaded && <p className="text-text-muted">Uploaded: <span className="text-text-main/80">{item.uploaded}</span></p>}
          {item.category && <p className="text-text-muted">Category: <span className="text-warning/80">{item.category}</span></p>}
          {item.desc && <p className="text-text-muted leading-relaxed">{item.desc}</p>}
        </div>
      </div>

      <div className="pt-4 border-t border-black/10 dark:border-white/5 flex gap-3 mt-auto">
        <button 
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-text-main text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        <button 
          onClick={handleDownload}
          className="px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-text-muted hover:text-text-main transition-colors" 
          title="Open in new tab"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-text-muted" />
      </div>
      <h3 className="text-xl font-bold text-text-main mb-2">No resources found</h3>
      <p className="text-text-muted">We couldn't find any items matching your search criteria.</p>
    </div>
  );
}
