import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dna, 
  RotateCw,
  Quote
} from 'lucide-react';

const SCIENTIFIC_QUOTES = [
  {
    text: "Wherever he steps, whatever he touches, whatever he leaves, will serve as a silent witness against him.",
    author: "Dr. Edmond Locard",
    title: "Pioneer of Forensic Science"
  },
  {
    text: "Science is the key to unlock the secrets of the past, reconstructing truth from the residue of time.",
    author: "Sir Bernard Spilsbury",
    title: "Forensic Pathology Founder"
  },
  {
    text: "It is a capital mistake to theorize before one has data. Insensibly one begins to twist facts to suit theories.",
    author: "Arthur Conan Doyle",
    title: "Sherlock Holmes Creator"
  },
  {
    text: "The sequence of nucleotides carries the ultimate blueprint of life, a code written in the stars of our cells.",
    author: "Rosalind Franklin",
    title: "Biophysicist & DNA Pioneer"
  },
  {
    text: "There is no branch of detective science which is so important and so much neglected as the art of tracing footprints.",
    author: "Hans Gross",
    title: "Criminalistics Pioneer"
  },
  {
    text: "Truth is not what you want it to be; it is what it is. And we must bend to its power or live a lie.",
    author: "M. M. Rao",
    title: "Forensic Chemist"
  }
];

interface BasePair {
  type: 'A-T' | 'T-A' | 'G-C' | 'C-G';
  locus: string;
  matchPercent: number;
}

export default function DnaVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);

  // States for dynamic quotes
  const [activeQuoteIndex, setActiveQuoteIndex] = useState<number>(0);

  // Mouse coords relative to center
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Custom base definitions
  const BASE_COLORS = {
    A: '#00f0ff', // Adenine (Cyan)
    T: '#ff7700', // Thymine (Orange)
    G: '#10b981', // Guanine (Green)
    C: '#ec4899', // Cytosine (Pink)
  };

  useEffect(() => {
    // Dynamic rotating scientific quotes interval
    const quoteInterval = setInterval(() => {
      setActiveQuoteIndex(prev => (prev + 1) % SCIENTIFIC_QUOTES.length);
    }, 5500);

    return () => {
      clearInterval(quoteInterval);
    };
  }, []);

  // Set up 3D Helix Animation on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = 400;
    let height = canvas.height = 420;

    // Handle container resize dynamically
    const handleResize = () => {
      if (!canvasWrapperRef.current || !canvasRef.current) return;
      const rect = canvasWrapperRef.current.getBoundingClientRect();
      width = canvasRef.current.width = rect.width;
      height = canvasRef.current.height = rect.height;
    };

    handleResize();
    const resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        handleResize();
      });
    });
    if (canvasWrapperRef.current) {
      resizeObserver.observe(canvasWrapperRef.current);
    }

    // Interactive mouse rotation tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      // Coordinates normalized to [-1, 1]
      mouseRef.current.targetX = (clientX / width) * 2 - 1;
      mouseRef.current.targetY = (clientY / height) * 2 - 1;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Initial DNA Data setup
    const numNodes = 28;
    const radius = 55; // Helix horizontal radius
    const speedCoeff = 0.025;
    let angleOffset = 0;

    // 3D Projection & Rendering loop
    const animate = () => {
      angleOffset += speedCoeff;

      // Smoothly interpolate mouse coords (lerp)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;

      // Clear with soft glow backdrop
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      const centerY = height / 2;
      const centerX = width / 2;

      // Save list of nodes to draw rungs/connections
      interface ProjectedNode {
        sx: number;
        sy: number;
        sz: number; // depth
        base: 'A' | 'T' | 'G' | 'C';
        color: string;
        isStrandA: boolean;
      }

      const projectedNodes: ProjectedNode[][] = [];

      for (let i = 0; i < numNodes; i++) {
        // Distribute along vertical axis
        const relativeY = ((i / (numNodes - 1)) * 2 - 1) * (height * 0.38);
        
        // Twist angle along helix length
        const baseAngle = (i * 0.45) + angleOffset;

        // Apply mouse pitch and yaw controls
        const yaw = mouseRef.current.x * 0.6;
        const pitch = mouseRef.current.y * 0.6;

        const getRotatedCoords = (angle: number) => {
          // Coordinates relative to helix core
          const x = radius * Math.cos(angle);
          const z = radius * Math.sin(angle);
          const y = relativeY;

          // 3D Rotation along Pitch (X axis)
          const cosP = Math.cos(pitch);
          const sinP = Math.sin(pitch);
          let y1 = y * cosP - z * sinP;
          let z1 = y * sinP + z * cosP;

          // 3D Rotation along Yaw (Y axis)
          const cosY = Math.cos(yaw);
          const sinY = Math.sin(yaw);
          let x2 = x * cosY - z1 * sinY;
          let z2 = x * sinY + z1 * cosY;

          // Perspective scaling
          const fov = 400;
          const scale = fov / (fov + z2);
          const screenX = centerX + x2 * scale;
          const screenY = centerY + y1 * scale;

          return { sx: screenX, sy: screenY, sz: z2 };
        };

        // Node pairs (opposites in phase)
        const nodeA = getRotatedCoords(baseAngle);
        const nodeB = getRotatedCoords(baseAngle + Math.PI);

        // Assign scientific nucleotide mappings sequentially
        const pairIndex = i % 4;
        let baseA: 'A' | 'T' | 'G' | 'C' = 'A';
        let baseB: 'A' | 'T' | 'G' | 'C' = 'T';

        if (pairIndex === 1) {
          baseA = 'T'; baseB = 'A';
        } else if (pairIndex === 2) {
          baseA = 'G'; baseB = 'C';
        } else if (pairIndex === 3) {
          baseA = 'C'; baseB = 'G';
        }

        projectedNodes.push([
          { ...nodeA, base: baseA, color: BASE_COLORS[baseA], isStrandA: true },
          { ...nodeB, base: baseB, color: BASE_COLORS[baseB], isStrandA: false }
        ]);
      }

      // Draw Connection Rungs (bases pairing) grouped by average depth for sorting
      const rungs = projectedNodes.map(([nA, nB]) => {
        return {
          nA,
          nB,
          avgZ: (nA.sz + nB.sz) / 2
        };
      });

      // Sort rungs back-to-front so closer objects overlap background elements
      rungs.sort((a, b) => b.avgZ - a.avgZ);

      // Draw connections
      rungs.forEach(({ nA, nB }) => {
        // Cytosine, Guanine, etc have bonding lines
        ctx.beginPath();
        const grad = ctx.createLinearGradient(nA.sx, nA.sy, nB.sx, nB.sy);
        grad.addColorStop(0, nA.color);
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
        grad.addColorStop(1, nB.color);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.moveTo(nA.sx, nA.sy);
        ctx.lineTo(nB.sx, nB.sy);
        ctx.stroke();

        // Draw small hydrogen bond markers along connection line
        const numBonds = nA.base === 'G' || nA.base === 'C' ? 3 : 2; // G-C has 3 hydrogen bonds, A-T has 2
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let b = 1; b <= numBonds; b++) {
          const ratio = b / (numBonds + 1);
          const bx = nA.sx + (nB.sx - nA.sx) * ratio;
          const by = nA.sy + (nB.sy - nA.sy) * ratio;
          ctx.beginPath();
          ctx.arc(bx, by, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw backbone ribbons (connecting successive Strand A/B nodes with sorting)
      const allIndividualNodes = projectedNodes.flat().sort((a, b) => b.sz - a.sz);

      // Draw node spheres with beautiful radial glowing gradient
      allIndividualNodes.forEach(node => {
        // Scale size slightly with depth
        const depthScaling = (400 - node.sz) / 400;
        const radiusPt = Math.max(2.5, 6 * depthScaling);

        ctx.beginPath();
        const radGrad = ctx.createRadialGradient(
          node.sx - radiusPt * 0.2, 
          node.sy - radiusPt * 0.2, 
          radiusPt * 0.1, 
          node.sx, 
          node.sy, 
          radiusPt
        );
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.3, node.color);
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0.9)');

        ctx.fillStyle = radGrad;
        ctx.shadowBlur = node.sz < 0 ? 12 : 0; // Only highlight elements closer than center
        ctx.shadowColor = node.color;
        
        ctx.arc(node.sx, node.sy, radiusPt, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow

        // Render atomic letter label for closer, large nodes
        if (depthScaling > 1.05) {
          ctx.fillStyle = '#0a0d14';
          ctx.font = 'bold 7px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.base, node.sx, node.sy);
        }
      });

      // Draw Sweep Laser Scan line (representing gel profiling barcode analysis)
      const scanY = centerY + Math.sin(Date.now() * 0.0018) * (height * 0.4);
      
      // Outer glow line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.moveTo(10, scanY - 1);
      ctx.lineTo(width - 10, scanY - 1);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.8;
      ctx.moveTo(10, scanY);
      ctx.lineTo(width - 10, scanY);
      ctx.stroke();

      // Laser scanning side indicators
      ctx.fillStyle = '#00f0ff';
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`LASER RANGE FINDER: LOCK`, 15, scanY - 6);
      ctx.textAlign = 'right';
      ctx.fillText(`SCAN_Y: ${Math.round(scanY)}px`, width - 15, scanY - 6);

      // Check for intersections to simulate dynamic locus detection
      const intersectingRung = rungs.find(r => Math.abs(r.nA.sy - scanY) < 14);
      if (intersectingRung) {
        ctx.beginPath();
        ctx.arc(intersectingRung.nA.sx, intersectingRung.nA.sy, 12, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex-grow flex flex-col justify-between bg-crust/90 backdrop-blur rounded-3xl p-5 border border-black/20 dark:border-white/5 shadow-2xl relative overflow-hidden"
    >
      {/* Biohazard / Tech Grid aesthetic border */}
      <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-gradient-to-b from-cyan-400 via-emerald-400 to-transparent" />
      
      {/* Header Info Panel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-400/40 flex items-center justify-center">
              <Dna className="text-cyan-400" size={16} />
            </div>
            <div>
              <span className="font-heading font-black text-sm tracking-widest text-[#00f0ff] uppercase block">
                DNA Helix
              </span>
            </div>
          </div>
        </div>

        {/* Real DNA canvas layout */}
        <div 
          ref={canvasWrapperRef}
          className="relative h-[320px] border border-white/5 rounded-2xl overflow-hidden bg-[#07090e]"
        >
          {/* Subtle watermarks */}
          <div className="absolute top-3 left-3 flex flex-col text-[8px] font-mono text-cyan-400/30 leading-tight">
            <span>SEQUENCE_CAPTURE_ACTIVE</span>
            <span>MODEL: STR_PROBE_3D_v2.4</span>
          </div>
          
          <div className="absolute bottom-3 right-3 flex items-center gap-2 text-[8px] font-mono text-text-muted/40">
            <RotateCw size={8} className="animate-spin" />
            <span>INTERACTIVE DRAG ROTATE</span>
          </div>

          {/* Canvas anchor */}
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing block"
          />

          {/* Gel Electrophoresis Diagnostic Barcode overlay on right */}
          <div className="absolute right-3 top-3 bottom-14 w-8 bg-black/40 border border-white/5 rounded-md p-1 flex flex-col justify-between items-center z-10">
            <span className="text-[6px] font-mono text-[#00f0ff] block font-black">GEL</span>
            
            {/* Array of gel lines */}
            <div className="w-full flex-grow flex flex-col justify-around py-2">
              <div className="h-0.5 w-full bg-cyan-400 opacity-90 shadow-[0_0_6px_#00f0ff]" />
              <div className="h-1 w-full bg-cyan-500/70" />
              <div className="h-0.5 w-full bg-emerald-400 opacity-80" />
              <div className="h-0.5 w-1/2 bg-cyan-400 mx-auto" />
              <div className="h-1.5 w-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
              <div className="h-0.5 w-3/4 bg-emerald-400/40" />
              <div className="h-1 w-full bg-cyan-400 shadow-[0_0_4px_#00f0ff]" />
              <div className="h-0.5 w-full bg-emerald-500" />
              <div className="h-0.5 w-full bg-cyan-500/30" />
              <div className="h-1.5 w-full bg-cyan-400 opacity-90 shadow-[0_0_6px_#00f0ff]" />
            </div>

            <span className="text-[5px] font-mono text-emerald-400 block font-normal">LOCK</span>
          </div>
        </div>

        {/* Forensic & Scientific Quotes Feed */}
        <div className="bg-[#0c0f16]/90 border border-white/5 rounded-2xl p-4 min-h-[92px] flex flex-col justify-center relative overflow-hidden backdrop-blur-md shadow-inner">
          {/* Subtle decoration elements */}
          <div className="absolute top-2 left-3 flex items-center gap-1 opacity-40">
            <Quote size={10} className="text-[#00f0ff]" />
            <span className="text-[7px] font-mono text-cyan-400 uppercase tracking-widest">INSIGHT_DECODE</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeQuoteIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="mt-3 space-y-1.5"
            >
              <p className="text-[10px] leading-relaxed text-slate-100 font-sans italic tracking-wide text-center">
                &ldquo;{SCIENTIFIC_QUOTES[activeQuoteIndex].text}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-2 text-[8px] font-mono text-text-muted mt-1 leading-none">
                <span className="font-bold text-[#ff7700] uppercase tracking-wider">
                  — {SCIENTIFIC_QUOTES[activeQuoteIndex].author}
                </span>
                <span className="opacity-30">|</span>
                <span className="uppercase tracking-widest text-[#00f0ff] font-semibold text-[7.5px]">
                  {SCIENTIFIC_QUOTES[activeQuoteIndex].title}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
