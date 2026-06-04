import { useEffect, useRef, useState } from 'react';

interface EvidenceNode {
  x: number;
  y: number;
  label: string;
  id: string;
  pulseSize: number;
  pulseDirection: number;
}

export function ForensicGridCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    // Initial check
    const checkTheme = () => {
      setIsLightMode(document.documentElement.classList.contains('light'));
    };
    checkTheme();

    // Observe theme changing class on the html element
    const observer = new MutationObserver(() => {
      checkTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Dynamic Evidence Nodes (Floating crosshairs) matching forensic thematic mapping
    const evidenceNodes: EvidenceNode[] = [
      { x: 0.15, y: 0.25, label: "LATENT_FP_01", id: "FP-A", pulseSize: 2, pulseDirection: 1 },
      { x: 0.82, y: 0.18, label: "DNA_STR_MATCH_99.8%", id: "DNA-09", pulseSize: 5, pulseDirection: 1 },
      { x: 0.74, y: 0.65, label: "CYBER_IP_TRACE", id: "IP-110", pulseSize: 3, pulseDirection: -1 },
      { x: 0.22, y: 0.72, label: "BALLISTIC_ANGLE_RECON", id: "BAL-3", pulseSize: 4, pulseDirection: 1 },
      { x: 0.50, y: 0.80, label: "MICRO_TRACE_HAIR", id: "TR-8", pulseSize: 1, pulseDirection: 1 },
    ];

    // Falling digital streams (DNA codes & Binary matrix)
    const streamChars = ['A', 'T', 'G', 'C', '0', '1', 'X', 'Y'];
    const particles: { x: number; y: number; speed: number; char: string; size: number; opacity: number }[] = [];
    const particleCount = Math.min(60, Math.floor(width / 20));

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.5 + Math.random() * 1.5,
        char: streamChars[Math.floor(Math.random() * streamChars.length)],
        size: 9 + Math.floor(Math.random() * 5),
        opacity: 0.1 + Math.random() * 0.4,
      });
    }

    // Laser scan bar y-coordinate
    let scanLineY = 0;
    let scanDirection = 1;

    // Heat sweep circular radar angle
    let radarAngle = 0;

    // Resize Handler using ResizeObserver for perfect fluidity across devices
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (canvasRef.current) {
          width = canvasRef.current.width = entry.contentRect.width;
          height = canvasRef.current.height = entry.contentRect.height;
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Rendering loop running at 60 FPS
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Theme-based colors
      const gridColor = isLightMode ? 'rgba(2, 132, 199, 0.08)' : 'rgba(0, 240, 255, 0.05)';
      const laserGlowStart = isLightMode ? 'rgba(2, 132, 199, 0)' : 'rgba(0, 240, 255, 0)';
      const laserGlowMid = isLightMode ? 'rgba(2, 132, 199, 0.06)' : 'rgba(0, 240, 255, 0.06)';
      const laserGlowEnd = isLightMode ? 'rgba(2, 132, 199, 0.15)' : 'rgba(0, 240, 255, 0.15)';
      const laserFilamentColor = isLightMode ? 'rgba(2, 132, 199, 0.5)' : 'rgba(0, 240, 255, 0.4)';
      const radarRingColor = isLightMode ? 'rgba(2, 132, 199, 0.08)' : 'rgba(234, 179, 8, 0.04)';
      const radarBeamColor = isLightMode ? 'rgba(2, 132, 199, 0.25)' : 'rgba(0, 240, 255, 0.15)';
      const streamBaseColor = isLightMode ? 'rgba(2, 132, 199, ' : 'rgba(0, 240, 255, ';

      // 1. Draw subtle ambient high-tech grid (Gridlines spacing 45px)
      const gridSize = 45;
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Linear Scan Line (Horizontal glowing cyan laser band)
      scanLineY += 1.8 * scanDirection;
      if (scanLineY >= height) {
        scanDirection = -1;
      } else if (scanLineY <= 0) {
        scanDirection = 1;
      }

      // Draw laser glow trail
      const gradient = ctx.createLinearGradient(0, scanLineY - (15 * scanDirection), 0, scanLineY);
      gradient.addColorStop(0, laserGlowStart);
      gradient.addColorStop(0.5, laserGlowMid);
      gradient.addColorStop(1, laserGlowEnd);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanDirection > 0 ? scanLineY - 30 : scanLineY, width, 30);

      // Draw exact scanning laser filament
      ctx.strokeStyle = laserFilamentColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, scanLineY);
      ctx.lineTo(width, scanLineY);
      ctx.stroke();

      // 3. Draw Radar Sweep (Sonar circle sweeping in center region)
      radarAngle += 0.01;
      const radarCenterX = width / 2;
      const radarCenterY = height / 2;
      const radarRadius = Math.min(width, height) * 0.4;

      // Draw radar target concentric rings
      ctx.strokeStyle = radarRingColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(radarCenterX, radarCenterY, radarRadius * 0.4, 0, Math.PI * 2);
      ctx.arc(radarCenterX, radarCenterY, radarRadius * 0.8, 0, Math.PI * 2);
      ctx.arc(radarCenterX, radarCenterY, radarRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Radar sweeping beam line
      ctx.strokeStyle = radarBeamColor;
      ctx.beginPath();
      ctx.moveTo(radarCenterX, radarCenterY);
      ctx.lineTo(
        radarCenterX + Math.cos(radarAngle) * radarRadius,
        radarCenterY + Math.sin(radarAngle) * radarRadius
      );
      ctx.stroke();

      // 4. Update and Render Digital Base Particles (DNA Typing & Cyber Streams)
      ctx.font = '9px monospace';
      particles.forEach((p) => {
        // Render characters with higher active state opacity in light mode
        const mult = isLightMode ? 2.0 : 1.0;
        ctx.fillStyle = `${streamBaseColor}${Math.min(0.9, p.opacity * mult * (0.6 + 0.4 * Math.sin(scanLineY / 40)))})`;
        ctx.fillText(p.char, p.x, p.y);

        // Slow updates
        p.y += p.speed;
        if (p.y > height) {
          p.y = 0;
          p.x = Math.random() * width;
        }

        // Random code flickering
        if (Math.random() < 0.02) {
          p.char = streamChars[Math.floor(Math.random() * streamChars.length)];
        }
      });

      // 5. Drawing Forensic Evidence Target Markers
      evidenceNodes.forEach((node) => {
        // Map relative positions
        const nx = node.x * width;
        const ny = node.y * height;

        // Pulse logic
        node.pulseSize += 0.08 * node.pulseDirection;
        if (node.pulseSize > 8) node.pulseDirection = -1;
        if (node.pulseSize < 2) node.pulseDirection = 1;

        // Colors for crosshair marker
        const crosshairStroke = isLightMode ? 'rgba(217, 119, 6, 0.55)' : 'rgba(234, 179, 8, 0.35)';
        const pulseStroke = isLightMode ? `rgba(217, 119, 6, ${0.6 - (node.pulseSize / 20)})` : `rgba(234, 179, 8, ${0.4 - (node.pulseSize / 20)})`;
        const centerHairStroke = isLightMode ? 'rgba(217, 119, 6, 0.65)' : 'rgba(234, 179, 8, 0.4)';
        const idColor = isLightMode ? 'rgba(180, 83, 9, 0.9)' : 'rgba(234, 179, 8, 0.7)';
        const labelColor = isLightMode ? 'rgba(2, 132, 199, 0.85)' : 'rgba(0, 240, 255, 0.6)';

        // Draw crosshair circle
        ctx.strokeStyle = crosshairStroke;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(nx, ny, 6, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsing radar ripple ring
        ctx.strokeStyle = pulseStroke;
        ctx.beginPath();
        ctx.arc(nx, ny, 6 + node.pulseSize, 0, Math.PI * 2);
        ctx.stroke();

        // Precise Hairlines inside crosshairs
        ctx.strokeStyle = centerHairStroke;
        ctx.beginPath();
        ctx.moveTo(nx - 10, ny);
        ctx.lineTo(nx + 10, ny);
        ctx.moveTo(nx, ny - 10);
        ctx.lineTo(nx, ny + 10);
        ctx.stroke();

        // Draw micro science label text (using pixel-perfect mono styling)
        ctx.font = 'xx-small monospace';
        ctx.fillStyle = idColor;
        ctx.fillText(`ID:[${node.id}]`, nx + 12, ny - 2);
        ctx.fillStyle = labelColor;
        ctx.fillText(node.label, nx + 12, ny + 8);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [isLightMode]);

  // Safe callback verifying video state
  const handleVideoCanPlay = () => {
    setVideoLoaded(true);
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none"
    >
      {/* 
         Video Feed: Under extreme low-power modes (where autoplay is disabled in consumer devices), 
         or offline status, the video stays transparent and our rich, high-performance HTML5 canvas 
         layer draws beautiful, active technological components beautifully!
      */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        onCanPlay={handleVideoCanPlay}
        className={`w-full h-full object-cover scale-[1.03] transition-all duration-1000 ${
          videoLoaded ? (isLightMode ? 'opacity-20' : 'opacity-35 dark:opacity-45') : 'opacity-0'
        }`}
        style={{ 
          mixBlendMode: isLightMode ? 'multiply' : 'screen',
          filter: isLightMode 
            ? "invert(1) hue-rotate(5deg) brightness(1.15) contrast(1.1)" 
            : "hue-rotate(185deg) brightness(0.95) contrast(1.15)" 
        }}
      >
        {/* We use highly optimized digital tech loop videos on high-bandwidth static networks */}
        <source 
          src="https://assets.mixkit.co/videos/preview/mixkit-glowing-lines-and-numbers-on-a-hud-screen-34346-large.mp4" 
          type="video/mp4" 
        />
        {/* Mirror/Fallback digital flow pattern */}
        <source 
          src="https://assets.mixkit.co/videos/preview/mixkit-hud-interface-of-digital-elements-and-world-map-31952-large.mp4" 
          type="video/mp4" 
        />
      </video>

      {/* HTML5 Canvas overlay layer: always active, lightweight, pixel-perfect */}
      <canvas 
        ref={canvasRef} 
        style={{ mixBlendMode: isLightMode ? 'multiply' : 'screen' }}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Futuristic Ambient Backdrop Gradients and Masks (Ensure text is perfectly readable with ideal contrast) */}
      <div 
        className="absolute inset-0 z-10 transition-all duration-500" 
        style={{ 
          background: isLightMode 
            ? "radial-gradient(circle at 50% 50%, rgba(2, 132, 199, 0.05) 10%, rgba(248, 250, 252, 0.85) 80%, rgba(248, 250, 252, 1) 100%)"
            : "radial-gradient(circle at 50% 50%, rgba(13, 21, 46, 0.4) 10%, rgba(4, 8, 20, 0.85) 80%, rgba(4, 8, 20, 1) 100%)"
        }} 
      />
      <div className={`absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t ${isLightMode ? 'from-[#f8fafc]' : 'from-[#040814]'} to-transparent z-15 transition-all duration-500`} />
      <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${isLightMode ? 'from-[#f8fafc]' : 'from-[#040814]'} to-transparent z-15 transition-all duration-500`} />
    </div>
  );
}
