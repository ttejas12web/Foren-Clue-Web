import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface CrimeTapeProps {
  text?: string;
  className?: string;
  angle?: number;
}

export function CrimeTape({ text = "CRIME SCENE DO NOT CROSS", className, angle = -2 }: CrimeTapeProps) {
  return (
    <div className="w-full overflow-hidden py-4 pointer-events-none z-10 flex items-center justify-center">
      <motion.div 
        initial={{ rotate: 0 }}
        animate={{ rotate: angle }}
        className={cn(
          "w-[110%] bg-warning text-crust font-heading font-black text-xl uppercase tracking-[0.2em] py-2 flex items-center shadow-lg whitespace-nowrap",
          className
        )}
      >
        {/* Render multiple text blocks to ensure it fills the screen */}
        {[...Array(20)].map((_, i) => (
          <div key={i} className="flex items-center">
            <span className="mx-4">{text}</span>
            <div className="h-6 w-3 bg-crust transform -skew-x-12 mx-4" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
