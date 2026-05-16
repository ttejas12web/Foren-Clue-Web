import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import React from 'react';

interface EvidenceMarkerProps {
  number: React.ReactNode;
  className?: string;
  delay?: number;
}

export function EvidenceMarker({ number, className, delay = 0 }: EvidenceMarkerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: 90 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ 
        delay, 
        type: 'spring', 
        stiffness: 200, 
        damping: 15 
      }}
      className={cn(
        "relative flex flex-col items-center justify-end w-12 h-16 transform preserve-3d origin-bottom",
        className
      )}
    >
      <div className="absolute top-0 w-8 h-12 bg-warning rounded-t-sm border-2 border-warning-dark shadow-md flex items-start justify-center pt-1 overflow-hidden">
        {/* Tent fold crease */}
        <div className="absolute top-0 w-full h-[2px] bg-black/5 dark:bg-white/30" />
        <span className="font-heading font-black text-2xl text-crust leading-none">
          {number}
        </span>
      </div>
      <div className="w-10 h-4 bg-black/40 rounded-[100%] blur-[2px] absolute -bottom-1" />
    </motion.div>
  );
}
