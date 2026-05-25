import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { CrimeTape } from '@/components/ui/CrimeTape';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search, ShieldAlert, BookOpen, Users, Star, Download } from 'lucide-react';
import { EvidenceMarker } from '@/components/ui/EvidenceMarker';
import { EditableText } from '@/components/ui/EditableText';
// DNAViewer removed

const MotionLink = motion.create(Link);

export default function Home() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-300, 300], [10, -10]);
  const rotateY = useTransform(x, [-300, 300], [-10, 10]);

  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const scrollTarget = searchParams.get('scroll');
    if (scrollTarget === 'book-mockup') {
      const element = document.getElementById('book-mockup-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Clean up the search parameter so it doesn't scroll again on manual reloads
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('scroll');
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]);

  function handleMouseMove(event: React.MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const handleDownloadSample = () => {
    const content = `======================================================================
FORENCLUE SCIENTIFIC EXAMINATION HANDBOOK (PREVIEW CLASSROOM PACKET)
======================================================================
ForenClue Publications Ltd. | www.forenclue.edu
Classification: Exclusive Forensic Blueprint Sample
Document Reference: FEP-2026-HBK-001X

Dear forensic student/educator,

Thank you for downloading the exclusive sample chapter from the upcoming
"Forensic Investigation Handbook: Theory, Application & Protocols".

Here is a quick operational checklist included in Chapter 2:

SECTION 2.4: SYSTEMATIC CRIME SCENE PROTOCOLS
----------------------------------------------
1. Establish Boundary Control
   - Define Outer, Inner, and Core security perimeters.
   - Deploy high-contrast physical barriers (Crime Scene Tape).
   - Authorize Entry/Exit logging to secure chain of custody.

2. Comprehensive Photography & Documentation
   - Take overall room context shots before introducing evidence markers.
   - Utilize linear measurement grids and macro exposure for specific trace materials.
   - Implement stereoscopic capture for reconstruction algorithms.

3. Live Sample Retention
   - Always wear double-layered nitrile gloves. Use separate tweezers for distinct hairs.
   - Place biological trace materials only into well-aerated paper bags to prevent humidity-based mold decomposition.
   - Package volatile digital storage hardware immediately into anti-static Faraday shielding.

Find complete lessons, certifications, and active community doubts folders
on ForenClue platform!

Keep Investigating,
The ForenClue Curriculum Board
======================================================================`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ForenClue_Forensic_Investigation_Handbook_Sample.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-grid-pattern pt-20"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0 bg-base/80 z-0" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center perspective-1000">
          <motion.div
            style={{ rotateX, rotateY, z: 50, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.span 
              style={{ translateZ: 20 }}
              className="inline-block py-1 px-3 rounded-full bg-warning/10 border border-warning/30 text-warning text-sm font-semibold mb-6 uppercase tracking-wider block-shadow"
            >
              India's First Dedicated Platform
            </motion.span>
            <motion.h1 
              style={{ translateZ: 50 }}
              className="font-heading font-black text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tighter mb-8 uppercase text-text-main drop-shadow-2xl"
            >
              Forensic <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-warning to-warning-dark inline-block transform -skew-x-6 mt-2">
                Precision
              </span>
            </motion.h1>
            <motion.p 
              style={{ translateZ: 30 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl font-body text-text-muted max-w-3xl mx-auto leading-relaxed mb-10 text-center px-4"
            >
              <EditableText 
                id="home_hero_subtitle" 
                defaultText="Empowering students, educators, and professionals with real-world forensic knowledge, case-based learning, and career guidance."
                isTextArea
                className="text-center"
              />
            </motion.p>
            
            <motion.div style={{ translateZ: 40 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <MotionLink 
                to="/courses"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 bg-warning text-crust font-black uppercase tracking-wider rounded-none relative group overflow-hidden transition-all shadow-xl shadow-warning/20"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Learning <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-warning-dark transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-0" />
              </MotionLink>
              <MotionLink 
                to="/community" 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 bg-surface text-text-main font-bold uppercase tracking-wider rounded-none border border-black/10 dark:border-white/10 hover:border-warning/50 hover:bg-black/5 dark:bg-white/5 transition-all shadow-xl"
              >
                Join Community
              </MotionLink>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <CrimeTape text="INVESTIGATION IN PROGRESS - DO NOT CROSS -" />

      {/* About Snapshot */}
      <section className="py-24 bg-crust relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="relative">
              <div className="absolute -inset-4 bg-warning/10 border border-warning/20 transform rotate-3" />
              <div className="bg-surface p-8 relative border border-black/10 dark:border-white/5 shadow-2xl backdrop-blur-sm">
                 <EvidenceMarker number={<Star size={24} fill="currentColor" />} className="absolute -top-10 -left-6" />
                 <h2 className="font-heading font-black text-4xl mb-6">Bridge the Gap</h2>
                 <p className="text-text-muted text-lg leading-relaxed mb-6">
                   <EditableText id="home_about_par1" defaultText="ForenClue is a next-generation forensic education platform designed to bridge the gap between theoretical learning and real-world forensic science applications." isTextArea />
                 </p>
                 <p className="text-text-muted text-lg leading-relaxed border-l-4 border-warning pl-4">
                   <EditableText id="home_about_par2" defaultText="We provide structured courses, case studies, and career pathways tailored for aspiring forensic professionals." isTextArea />
                 </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: Search, title: "Case-Based", desc: "Real crime case breakdowns" },
                { icon: BookOpen, title: "Structured", desc: "Courses Beginner → Advanced" },
                { icon: Users, title: "Career Path", desc: "Skills roadmap & guidance" },
                { icon: ShieldAlert, title: "Certified", desc: "Recognized certification programs" }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-base/50 border border-black/10 dark:border-white/5 p-6 hover:border-warning/30 transition-colors group"
                >
                  <feature.icon size={32} className="text-warning mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-heading font-bold text-xl mb-2">{feature.title}</h3>
                  <p className="text-sm text-text-muted">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Exclusive Forensic Handbook / Book Section */}
      <section id="book-mockup-section" className="py-24 bg-base relative overflow-hidden border-t border-black/10 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Book Mockup & Download Block (12 cols) */}
            <div className="lg:col-span-12 flex flex-col items-center justify-center">
              {/* Coming Soon Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-warning/15 border border-warning/30 rounded-full text-warning text-xs font-black uppercase tracking-widest mb-6 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-warning animate-ping" />
                Coming Soon
              </div>

              <div className="relative group max-w-sm w-full">
                {/* Subtle Ambient Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-warning to-amber-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                
                <div className="relative bg-surface border border-black/10 dark:border-white/5 p-6 rounded-2xl shadow-2xl flex flex-col items-center text-center animate-fadeIn">
                  {/* 3D Perspective Book Wrapper */}
                  <div style={{ perspective: "1200px" }} className="w-full flex justify-center mb-8 relative py-4">
                    <motion.div
                      initial={{ opacity: 0, y: 60, rotateY: -30, rotateX: 12, scale: 0.9 }}
                      whileInView={{ opacity: 1, y: 0, rotateY: -15, rotateX: 6, scale: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      whileHover={{ rotateY: -2, rotateX: 2, scale: 1.06, y: -8 }}
                      transition={{ type: "spring", stiffness: 90, damping: 15 }}
                      style={{ transformStyle: "preserve-3d" }}
                      className="relative w-[210px] h-[280px] sm:w-[240px] sm:h-[320px] rounded-r-lg shadow-[25px_25px_50px_rgba(0,0,0,0.55)] cursor-pointer select-none group/book"
                    >
                      {/* Depth effect for pages (drawn along right side in 3D space) */}
                      <div 
                        className="absolute h-full w-[16px] bg-gradient-to-r from-gray-200 via-gray-100 to-white dark:from-white/10 dark:via-white/5 dark:to-white/15 border-y border-r border-black/15 dark:border-white/10"
                        style={{ 
                          right: "-16px",
                          top: "2px",
                          height: "calc(100% - 4px)",
                          transform: "rotateY(90deg)", 
                          transformOrigin: "left center" 
                        }}
                      >
                        {/* Fake pages lines */}
                        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                      </div>

                      {/* Cover wrapper with depth crease */}
                      <div 
                        className="absolute inset-0 rounded-r-lg overflow-hidden border border-white/10 bg-crust"
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <img 
                          src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEive7NdnBis_kLLqaN2d8q37014tEMd2ftmqFkeCIiLjxkG2sDfip5VQldxh9izJC-KTsD4ZfXnILFWEOG2jmJkwdKww8-jqW-2jAqpTsv4AOE47MkqpHHibGcBN4GhPqN3OIF1xxIbs0KQLRgxfk2XJRsdlQyY_JqqRnajm2-pB1xoiZN4BnkdtDc9ICU/s1500/1779707899.png" 
                          alt="Forensic Investigation Handbook Cover" 
                          className="w-full h-full object-cover rounded-r-lg"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Glossy sheen effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover/book:translate-x-full transition-transform duration-1000 ease-out z-20" />
                        
                        {/* Spine depth crease overlay */}
                        <div className="absolute top-0 bottom-0 left-[12px] w-[3px] bg-black/40 shadow-[0_0_5px_rgba(0,0,0,0.6)] z-10" />
                        <div className="absolute top-0 bottom-0 left-0 w-[12px] bg-gradient-to-r from-black/50 to-transparent z-10" />
                      </div>

                      {/* Ribbon badge */}
                      <div className="absolute top-4 left-[-10px] bg-warning text-crust text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded shadow-lg z-30 transform -skew-x-6">
                        Exclusive Preview
                      </div>
                    </motion.div>
                  </div>

                  {/* Title / Description under book */}
                  <h3 className="font-heading font-black text-lg mb-4 uppercase tracking-tight text-text-main">
                    Forensic Careers Blueprint Book
                  </h3>

                  {/* Download / Notify Button with Newsletter subscription form */}
                  {!isJoined ? (
                    <form 
                      onSubmit={(e) => { 
                        e.preventDefault(); 
                        if (waitlistEmail.trim()) {
                          setIsJoined(true); 
                        }
                      }} 
                      className="w-full flex flex-col gap-2.5"
                    >
                      <input 
                        type="email" 
                        required 
                        placeholder="Enter your email for launch access & updates" 
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-crust border border-white/10 text-text-main placeholder-text-muted focus:border-warning outline-none text-xs text-center"
                      />
                      <button 
                        type="submit"
                        className="w-full px-6 py-3 bg-warning hover:bg-warning-dark text-crust font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs shadow-lg hover:shadow-warning/20 cursor-pointer active:scale-95"
                      >
                        Notify Me on Launch
                      </button>
                    </form>
                  ) : (
                    <div className="w-full p-4 bg-warning/10 border border-warning/20 rounded-xl text-center text-xs font-bold text-warning uppercase tracking-wide">
                      ⚡ Registration Confirmed! We will email you on Launch!
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-warning text-crust">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-12">
             <h2 className="font-heading font-black text-3xl md:text-5xl uppercase tracking-tight">
               Trusted by 100+ Learners
             </h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
             {[
               {
                 quote: "The case-based approach completely changed how I understand forensic evidence handling. Highly recommended!",
                 author: "Forensic Student"
               },
               {
                 quote: "The interactive 3D simulations are a game-changer for digital forensic education. Incredibly immersive.",
                 author: "Prof. Sharma, Cyber Lead"
               },
               {
                 quote: "ForenClue provides a bridge between academic theory and the rigorous demands of professional investigation.",
                 author: "Ananya V., Senior Analyst"
               },
               {
                 quote: "The structured learning path helped me secure my first role in a state forensic lab.",
                 author: "Rahul K., FS Graduate"
               },
               {
                 quote: "Detailed case studies offer insights into evidence collection that textbooks simply cannot match.",
                 author: "Dr. Mehta, Consultant"
               }
             ].map((testimonial, i) => (
               <div key={i} className="bg-crust/5 p-6 rounded-lg flex flex-col justify-between">
                 <div>
                   <div className="flex text-crust mb-3">
                     {[...Array(5)].map((_, j) => (
                       <svg key={j} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                       </svg>
                     ))}
                   </div>
                   <p className="font-medium text-base leading-snug font-serif italic mb-4">
                     "{testimonial.quote}"
                   </p>
                 </div>
                 <p className="font-bold text-xs uppercase tracking-wider">- {testimonial.author}</p>
               </div>
             ))}
           </div>
        </div>
      </section>
      
      <CrimeTape text="CROSSING BOUNDARIES OF SCIENCE" angle={1} className="bg-white text-black" />

    </div>
  );
}
