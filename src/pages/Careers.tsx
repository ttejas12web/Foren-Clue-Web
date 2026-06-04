import React from 'react';
import { useNavigate } from "react-router-dom";
import { DNAViewer } from "@/components/ui/ThreeDElement";
import { SEO } from "@/components/layout/SEO";

export default function Careers() {
  const navigate = useNavigate();
  const paths = [
    "Crime Scene Investigator",
    "Forensic Analyst",
    "DNA Expert",
    "Toxicologist"
  ];

  return (
    <div className="py-20 px-4 max-w-7xl mx-auto relative overflow-hidden">
      <SEO 
        title="Forensic Science Career Guidance & Roadmaps"
        description="Plan your forensic education. Explore step-by-step career path guidelines to become a crime scene investigator, DNA fingerprint examiner, ballistic analyst, or forensic toxicology consultant."
        keywords="become a forensic expert, forensic science jobs india, crime scene investigator study, dna lab expert career, how to study forensic"
        canonicalPath="/careers"
      />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] pointer-events-none opacity-20 -translate-y-1/2 -ml-32">
         <DNAViewer />
      </div>

      <div className="relative z-10">
        <h1 className="text-4xl md:text-6xl font-heading font-black mb-8 text-center uppercase tracking-tight">
          Career <span className="text-warning">Guidance</span>
        </h1>
        <p className="text-center text-text-muted mb-16 text-lg max-w-2xl mx-auto">
          Your roadmap to becoming a top-tier forensic expert.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface/80 backdrop-blur-sm p-8 border border-black/10 dark:border-white/5 shadow-xl">
              <h2 className="text-2xl font-bold font-heading mb-6">How to become a Forensic Expert</h2>
              <p className="text-text-muted leading-relaxed">
                The journey starts with a strong foundation in science, followed by specialized training in evidence collection, lab analysis, and law. We provide end-to-end guidance from your undergraduate degree to your first job in the field.
              </p>
            </div>
            
            <div className="bg-surface/80 backdrop-blur-sm p-8 border border-black/10 dark:border-white/5 shadow-xl">
              <h2 className="text-2xl font-bold font-heading mb-6">Career Paths</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paths.map(path => (
                  <div key={path} className="p-4 bg-base border border-black/10 dark:border-white/5 flex items-center gap-3">
                    <div className="w-2 h-2 bg-warning rounded-full" />
                    <span className="font-medium">{path}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-warning text-crust p-8 shadow-xl">
              <h3 className="text-xl font-heading font-black mb-4 uppercase">Career RoadMap Handbook</h3>
              <p className="mb-6 opacity-80 text-sm font-medium">Download our comprehensive guide to mastering the required skills.</p>
              <button 
                onClick={() => navigate('/?scroll=book-mockup')}
                className="w-full py-3 bg-crust text-warning font-black uppercase tracking-wider text-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                Get Roadmap
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
