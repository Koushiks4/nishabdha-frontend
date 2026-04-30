import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence, useSpring, useVelocity, useMotionValue } from "motion/react";
import { useNavigate } from "react-router-dom";
import { MoveLeft, Wind, Volume2, VolumeX } from "lucide-react";

// The Stages of Descending into Silence
const SILENCE_LEVELS = [
  { threshold: 0, text: "The noise of movement.", sub: "Every action sends ripples through the void." },
  { threshold: 4000, text: "Wait for the ripples to fade.", sub: "Stillness is a skill. Practice it now." },
  { threshold: 9000, text: "The frequency of absence.", sub: "You are hearing the space itself." },
  { threshold: 15000, text: "NISHABDHA", sub: "Architecture is just silence given a shape.", isFinal: true },
];

function DustParticle({ inactivityMs }: { inactivityMs: number }) {
  const x = useMemo(() => Math.random() * 100, []);
  const yInitial = useMemo(() => Math.random() * 100, []);
  const size = useMemo(() => Math.random() * 1.5 + 0.5, []);
  
  const settlingFactor = Math.min(1, inactivityMs / 12000);
  const currentY = yInitial + (settlingFactor * (100 - yInitial)) * 0.9;

  return (
    <motion.div
      className="fixed bg-white/5 rounded-full pointer-events-none z-1"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
      }}
      animate={{
        top: `${currentY}%`,
        opacity: [0.05, 0.15, 0.05],
      }}
      transition={{
        top: { duration: 3, ease: "easeOut" },
        opacity: { duration: 4 + Math.random() * 4, repeat: Infinity }
      }}
    />
  );
}

export default function Silence() {
  const navigate = useNavigate();
  const [inactivityMs, setInactivityMs] = useState(0);
  const [noiseIndex, setNoiseIndex] = useState(0);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const xVelocity = useVelocity(mouseX);
  const yVelocity = useVelocity(mouseY);

  useEffect(() => {
    let lastUpdate = Date.now();
    
    const moveHandler = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setInactivityMs(0);
    };

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastUpdate;
      setInactivityMs(prev => prev + delta);
      
      const velocity = Math.abs(xVelocity.get()) + Math.abs(yVelocity.get());
      setNoiseIndex(prev => {
        const target = Math.min(100, velocity / 12);
        return prev * 0.8 + target * 0.2;
      });
      
      lastUpdate = now;
    }, 50);

    window.addEventListener("mousemove", moveHandler);
    window.addEventListener("touchstart", () => setInactivityMs(0));
    document.body.style.overflow = "hidden";
    
    return () => {
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("touchstart", () => setInactivityMs(0));
      clearInterval(interval);
      document.body.style.overflow = "";
    };
  }, [mouseX, mouseY, xVelocity, yVelocity]);

  const currentLevel = useMemo(() => {
    return [...SILENCE_LEVELS].reverse().find(l => inactivityMs >= l.threshold) || SILENCE_LEVELS[0];
  }, [inactivityMs]);

  const blurAmount = Math.max(0, (noiseIndex / 5) - (inactivityMs / 3000));
  const grainOpacity = Math.min(0.08, noiseIndex / 200);

  return (
    <div className="relative h-screen w-screen bg-black text-white selection:bg-white selection:text-black font-sans overflow-hidden flex items-center justify-center">
      {/* Background Depth */}
      <div className="absolute inset-0 bg-[#050505] z-0" />
      
      {/* Dynamic Noise Grain Overlay */}
      <motion.div 
        animate={{ opacity: grainOpacity }}
        className="absolute inset-0 pointer-events-none z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-[0.02]" 
      />

      {/* Atmospheric Particles */}
      {[...Array(80)].map((_, i) => (
        <DustParticle key={i} inactivityMs={inactivityMs} />
      ))}

      {/* Noise Meter - Minimalist */}
      <div className="absolute top-12 left-12 flex items-center gap-6 z-40 opacity-10">
        <div className="flex gap-1.5 h-4 items-center">
          {[...Array(12)].map((_, i) => (
            <motion.div 
              key={i}
              className="w-[1px] bg-white"
              animate={{ 
                height: Math.max(1, (noiseIndex / 20) * Math.sin(i + Date.now() / 100) * 10 + 2),
                opacity: 0.1 + (noiseIndex / 100)
              }}
            />
          ))}
        </div>
        <span className="text-[7px] uppercase tracking-[0.5em] font-mono whitespace-nowrap">Ambience_Level: {noiseIndex.toFixed(0)}%</span>
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 text-center max-w-2xl px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLevel.text}
            initial={{ opacity: 0, y: 5 }}
            animate={{ 
              opacity: Math.max(0.05, 1 - noiseIndex/35),
              y: 0,
              filter: `blur(${blurAmount}px)`,
            }}
            exit={{ opacity: 0, filter: "blur(10px)", y: -5 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="space-y-10">
              <h2 className={`font-light leading-tight tracking-[0.3em] transition-all duration-1000 ${currentLevel.isFinal ? 'text-6xl md:text-8xl text-white' : 'text-3xl md:text-4xl text-white/60'}`}>
                {currentLevel.text}
              </h2>
              <p className="text-[9px] uppercase tracking-[1.2em] font-light text-white/10 max-w-md mx-auto leading-relaxed">
                {currentLevel.sub}
              </p>
            </div>

            {currentLevel.isFinal && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.5 }}
                onClick={() => navigate("/")}
                className="mt-24 text-[8px] uppercase tracking-[0.8em] text-white/20 hover:text-white transition-all flex items-center gap-4 mx-auto border-b border-white/0 hover:border-white/20 pb-2"
              >
                <MoveLeft size={10} strokeWidth={1.5} />
                Dissolve
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* The Descending Line */}
      <div className="absolute bottom-12 left-12 z-10 flex flex-col gap-4 opacity-10">
        <div className="w-[1px] h-32 bg-white/5 relative">
          <motion.div 
            className="absolute inset-0 bg-white/40 origin-top"
            animate={{ 
              scaleY: Math.min(1, inactivityMs / 20000)
            }}
          />
        </div>
        <div className="text-[7px] uppercase tracking-[1em] vertical-text">Stillness</div>
      </div>

      {/* Right Info */}
      <div className="absolute bottom-12 right-12 text-[7px] uppercase tracking-[0.4em] font-mono opacity-10 flex flex-col items-end gap-2 text-right">
        <div>Nishabdha_Protocol // Silence_Engine_v1</div>
        <div>Coordinates: {mouseX.get().toFixed(0)}, {mouseY.get().toFixed(0)}</div>
        <div>Noise_Exposure: {((noiseIndex * inactivityMs) / 100000).toFixed(2)}</div>
      </div>
    </div>
  );
}
