import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative w-40 h-16 flex items-center justify-start">
        <img 
          src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7yfh9aP-3k7exKSgvW9ynV7lb9j62shvwJrpkiEi_9yiWUSxntW5Poc-MOXQCA0fd635VLo8C35glEPFtlSByqxDDepzEAX6D5T4SzFX-8fyKDIoo7_wV3EXH6u-UDF6P344Q4RRlRFY-qfqITWnuSXa7feb89eDlR9SCODoodogdY89rBez2K7fOiQI/s372/4b5616a4-6069-44a7-ba52-88f965165067.png" 
          alt="ForenClue Logo" 
          className="h-full object-contain"
          onError={(e) => {
            // Fallback to text if image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    </div>
  );
}
