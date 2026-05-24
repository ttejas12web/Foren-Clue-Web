import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Home, Search, HelpCircle } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden bg-base text-text-main">
      {/* Background radial highlight */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #00f0ff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-warning/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-2xl w-full text-center relative z-10 flex flex-col items-center gap-8">
        
        {/* Animated Crying Robot Visual */}
        <div className="relative w-72 h-72 flex items-center justify-center select-none">
          {/* Pulsate glow behind the robot */}
          <div className="absolute w-48 h-48 bg-warning/10 dark:bg-warning/5 rounded-full blur-[40px] animate-pulse pointer-events-none" />
          
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 240 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
          >
            {/* Defs for gradients and filters */}
            <defs>
              <linearGradient id="metalGrad" x1="0" y1="0" x2="240" y2="240" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4A4E69" />
                <stop offset="50%" stopColor="#22223B" />
                <stop offset="100%" stopColor="#0F1016" />
              </linearGradient>
              <linearGradient id="earGrad" x1="0" y1="0" x2="0" y2="240" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFB703" />
                <stop offset="100%" stopColor="#D48C00" />
              </linearGradient>
              <linearGradient id="screenGrad" x1="0" y1="50" x2="0" y2="170" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1D1E2C" />
                <stop offset="100%" stopColor="#0B0C10" />
              </linearGradient>
              <linearGradient id="tearGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#005B94" stopOpacity="0.2" />
              </linearGradient>
              
              {/* Animations for tears */}
              <style>
                {`
                  @keyframes tearDrop {
                    0% {
                      stroke-dashoffset: 60;
                      opacity: 0;
                    }
                    15% {
                      opacity: 1;
                    }
                    80% {
                      stroke-dashoffset: 0;
                      opacity: 0.8;
                    }
                    100% {
                      stroke-dashoffset: -20;
                      opacity: 0;
                    }
                  }
                  .tear-stream {
                    stroke-dasharray: 60;
                    animation: tearDrop 3s infinite linear;
                  }
                  .tear-stream-delayed {
                    stroke-dasharray: 60;
                    animation: tearDrop 3.5s infinite linear;
                    animation-delay: 1.5s;
                  }
                  
                  @keyframes lipQuiver {
                    0%, 100% { transform: translateY(0); }
                    25% { transform: translateY(1.5px) rotate(1deg); }
                    50% { transform: translateY(-1px) rotate(-1.5deg); }
                    75% { transform: translateY(0.8px) rotate(0.5deg); }
                  }
                  .robot-mouth {
                    animation: lipQuiver 0.8s infinite ease-in-out;
                    transform-origin: center;
                  }

                  @keyframes earWiggle {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(3deg); }
                  }
                  .robot-ear-l {
                    animation: earWiggle 4s infinite ease-in-out;
                    transform-origin: 35px 120px;
                  }
                  .robot-ear-r {
                    animation: earWiggle 4s infinite ease-in-out;
                    animation-delay: 2s;
                    transform-origin: 205px 120px;
                  }

                  @keyframes shoulderShrug {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                  }
                  .robot-body {
                    animation: shoulderShrug 6s infinite ease-in-out;
                  }
                `}
              </style>
            </defs>

            {/* Robot Base Neck & Body Connection */}
            <g className="robot-body">
              {/* Shoulders */}
              <path d="M70 185 C70 185 85 210 120 210 C155 210 170 185 170 185" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="6" strokeLinecap="round" />
              {/* Neck */}
              <rect x="105" y="160" width="30" height="30" rx="4" fill="url(#metalGrad)" stroke="#FFB703" strokeWidth="2.5" />
              <line x1="110" y1="170" x2="130" y2="170" stroke="#FFB703" strokeWidth="2" strokeLinecap="round" />
              <line x1="110" y1="178" x2="130" y2="178" stroke="#FFB703" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Robot Ears with animated wiggles */}
            <g className="robot-ear-l">
              <rect x="23" y="105" width="12" height="30" rx="4" fill="url(#earGrad)" />
              <circle cx="29" cy="120" r="3" fill="#0F1016" />
            </g>
            <g className="robot-ear-r">
              <rect x="205" y="105" width="12" height="30" rx="4" fill="url(#earGrad)" />
              <circle cx="211" cy="120" r="3" fill="#0F1016" />
            </g>

            {/* Head Case */}
            <rect x="35" y="55" width="170" height="115" rx="24" fill="url(#metalGrad)" stroke="#3A3F58" strokeWidth="4" />
            
            {/* Screen border highlight */}
            <rect x="45" y="65" width="150" height="95" rx="16" fill="url(#screenGrad)" stroke="#111" strokeWidth="5" />
            
            {/* Subtle retro terminal scanner line */}
            <line x1="47" y1="75" x2="193" y2="75" stroke="#FFFFFF" strokeOpacity="0.04" strokeWidth="2" />
            <line x1="47" y1="112" x2="193" y2="112" stroke="#FFFFFF" strokeOpacity="0.03" strokeWidth="2" />

            {/* Sad/Worried Eyebrows */}
            <path d="M72 84 L92 92" stroke="#FFB703" strokeWidth="4" strokeLinecap="round" />
            <path d="M168 84 L148 92" stroke="#FFB703" strokeWidth="4" strokeLinecap="round" />

            {/* Glowing Pixelated/Sorrowful Eyes */}
            {/* Left Eye */}
            <g filter="drop-shadow(0px 0px 4px #00F0FF)">
              <rect x="75" y="96" width="22" height="14" rx="3" fill="#00F0FF" />
              {/* Sad highlight cutout inside pupil */}
              <circle cx="80" cy="100" r="3" fill="#1D1E2C" />
            </g>
            
            {/* Right Eye */}
            <g filter="drop-shadow(0px 0px 4px #00F0FF)">
              <rect x="143" y="96" width="22" height="14" rx="3" fill="#00F0FF" />
              {/* Sad highlight cutout inside pupil */}
              <circle cx="160" cy="100" r="3" fill="#1D1E2C" />
            </g>

            {/* Quivering mouth (sad curve down) */}
            <g className="robot-mouth">
              <path d="M106 138 C115 131, 125 131, 134 138" stroke="#FF3E3E" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            </g>

            {/* Tears streaming down with animation */}
            {/* Left Eye Tear Area */}
            <path
              className="tear-stream"
              d="M86 112 V155 L82 170"
              stroke="url(#tearGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right Eye Tear Area */}
            <path
              className="tear-stream-delayed"
              d="M154 112 V155 L158 175"
              stroke="url(#tearGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />

            {/* Interactive Crying Puddle beneath the neck */}
            <ellipse cx="120" cy="190" rx="14" ry="4" fill="#00F0FF" fillOpacity="0.25" filter="drop-shadow(0 0 2px #00F0FF)" className="animate-pulse" />
          </svg>

          {/* Glowing Red Warning Bulb on Antenna */}
          <div className="absolute top-[34px] left-1/2 -translate-x-1/2 flex flex-col items-center">
            {/* Antenna stick */}
            <div className="w-1 h-6 bg-[#3A3F58]" />
            {/* Pulsating red distress light */}
            <div className="absolute top-[-10px] w-4 h-4 rounded-full bg-red-500 animate-ping opacity-75" />
            <div className="absolute top-[-10px] w-4 h-4 rounded-full bg-red-600 border border-red-400" />
          </div>
        </div>

        {/* 404 Status Block */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-warning/10 border border-warning/20 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest text-warning">
            System Alert: 404 Not Found
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight mt-2 text-text-main">
            Evidence Not Found
          </h1>
          <p className="text-text-muted text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Our diagnostic systems successfully parsed your request for <code className="px-1.5 py-0.5 bg-surface-hover border border-black/10 dark:border-white/5 rounded text-warning font-mono text-xs">{location.pathname}</code>, but found absolutely no case files.
          </p>
        </div>

        {/* Action Panel */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            onClick={() => navigate(-1)}
            id="btn_404_back"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-surface hover:bg-surface-hover text-text-main border border-black/10 dark:border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95"
          >
            <ChevronLeft size={16} />
            Retrace Steps
          </button>
          <button
            onClick={() => navigate('/')}
            id="btn_404_home"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-warning hover:bg-warning-hover text-black rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-warning/20 transition-all duration-200 active:scale-95"
          >
            <Home size={16} />
            Forensic Home
          </button>
        </div>


      </div>
    </div>
  );
}
