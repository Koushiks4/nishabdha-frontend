import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, useSpring, useVelocity } from "motion/react";
import { useNavigate } from "react-router-dom";
import Lenis from "lenis";

const sectionData = [
  { 
    text: "WE DO NOT CREATE FOR EVERYONE", 
    align: "top-left",
    id: "hero-1"
  },
  { 
    text: "We create for those who notice", 
    align: "bottom-right",
    id: "hero-2"
  },
  { 
    text: "Most things fill space\nWe define it",
    align: "center-left",
    id: "def"
  },
  { 
    text: "Less. But precise.\nLess. But intentional.\nLess. But powerful.",
    align: "center",
    isList: true,
    id: "less"
  },
  { 
    text: "Noise is everywhere\nWe chose to remove it",
    align: "top-right",
    id: "noise"
  },
  { 
    text: "Every piece absorbs more than sound",
    align: "bottom-left",
    id: "absorb-1"
  },
  { 
    text: "It absorbs distraction\nIt absorbs excess\nIt absorbs what does not belong",
    align: "center-right",
    id: "absorb-2"
  },
  { 
    text: "If it does not change the space\nit does not belong in it",
    align: "center",
    id: "belong"
  },
  { 
    text: "NISHABDHA",
    subText: "For those who notice",
    isFinal: true,
    id: "final"
  },
];

function Spotlight() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const springX = useSpring(0, { damping: 30, stiffness: 200 });
  const springY = useSpring(0, { damping: 30, stiffness: 200 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    springX.set(mousePos.x);
    springY.set(mousePos.y);
  }, [mousePos, springX, springY]);

  return (
    <motion.div 
      style={{ 
        left: springX, 
        top: springY,
        x: "-50%",
        y: "-50%"
      }}
      className="fixed w-[600px] h-[600px] pointer-events-none z-[5] rounded-full bg-white/[0.03] blur-[100px]"
    />
  );
}

function NoiseBackground() {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 400 });
  const noiseOpacity = useTransform(smoothVelocity, [-2000, 0, 2000], [0.08, 0.04, 0.08]);

  return (
    <motion.div 
      style={{ opacity: noiseOpacity }}
      className="fixed inset-0 pointer-events-none z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay bg-repeat" 
    />
  );
}

function FloatingParticles() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 5000], [0, -200]);
  const y2 = useTransform(scrollY, [0, 5000], [0, 150]);
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      <motion.div 
        style={{ y: y1 }}
        className="absolute top-[20%] left-[10%] w-[1px] h-32 bg-white/10" 
      />
      <motion.div 
        style={{ y: y2 }}
        className="absolute top-[60%] right-[15%] w-16 h-16 border border-white/5 rounded-full" 
      />
      <motion.div 
        style={{ y: y1 }}
        className="absolute top-[40%] right-[5%] w-24 h-[1px] bg-white/5 rotate-45" 
      />
      <motion.div 
        style={{ y: y2 }}
        className="absolute bottom-[20%] left-[20%] w-0.5 h-0.5 bg-white/20 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" 
      />
    </div>
  );
}

function Section({ data, onReturn }: { data: any; onReturn: () => void; key?: string | number }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { amount: 0.3 });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.45, 0.55, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.45, 0.55, 1], [30, 0, 0, -30]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1, 1.02]);
  const filter = "blur(0px)";

  const alignClasses: Record<string, string> = {
    "top-left": "items-start justify-start p-16 md:p-32",
    "bottom-right": "items-end justify-end p-16 md:p-32",
    "center-left": "items-start justify-center p-16 md:p-32",
    "center-right": "items-end justify-center p-16 md:p-32",
    "top-right": "items-end justify-start p-16 md:p-32",
    "bottom-left": "items-start justify-end p-16 md:p-32",
    "center": "items-center justify-center p-8",
  };

  return (
    <motion.section
      ref={ref}
      style={{ opacity, y, filter, scale }}
      className={`h-screen w-full flex relative overflow-hidden ${alignClasses[data.align || "center"]}`}
    >
      <div className="max-w-xl">
        {data.isFinal ? (
          <div className="flex flex-col items-center gap-12">
            <div className="overflow-hidden">
              <motion.h3 
                initial={{ letterSpacing: "1.5em", opacity: 0 }}
                animate={isInView ? { letterSpacing: "0.5em", opacity: 1 } : {}}
                transition={{ duration: 4, ease: [0.22, 1, 0.36, 1] }}
                className="text-3xl md:text-5xl font-display text-white"
              >
                {data.text}
              </motion.h3>
            </div>
            {data.subText && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 0.3 } : {}}
                transition={{ delay: 2, duration: 2 }}
                className="text-[8px] uppercase tracking-[1em] text-white font-light"
              >
                {data.subText}
              </motion.p>
            )}
            <motion.button
               initial={{ opacity: 0 }}
               animate={isInView ? { opacity: 0.4 } : {}}
               transition={{ delay: 3, duration: 1.5 }}
               onClick={onReturn}
               className="mt-12 text-[9px] uppercase tracking-[0.6em] text-muted-foreground hover:text-white transition-all cursor-pointer group"
             >
               <span className="block transition-transform duration-500 group-hover:-translate-y-1">Return</span>
             </motion.button>
          </div>
        ) : (
          <div className={`flex flex-col ${data.align?.includes('right') ? 'items-end text-right' : 'items-start text-left'}`}>
            <div className="overflow-hidden py-1">
              {data.text.split("\n").map((line: string, i: number) => (
                <motion.p 
                  key={i}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
                  transition={{ 
                    duration: 1.5, 
                    delay: i * 0.2, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  className={`${data.align === 'center' ? 'text-base md:text-lg' : 'text-[11px] md:text-xs'} font-sans font-light text-white/90 leading-relaxed tracking-[0.2em] uppercase mb-4`}
                >
                  {line}
                </motion.p>
              ))}
            </div>
            
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className={`h-[1px] bg-white/10 w-8 mt-4 origin-left ${data.align?.includes('right') ? 'origin-right' : 'origin-left'}`}
            />
          </div>
        )}
      </div>
    </motion.section>
  );
}

export default function Philosophy() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 5000], [0, -500]);
  const backgroundOpacity = useTransform(scrollY, [0, 1000, 4000, 5000], [0.03, 0.01, 0.01, 0.03]);

  useEffect(() => {
    document.body.style.backgroundColor = "#000000";
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      document.body.style.backgroundColor = "";
      lenis.destroy();
    };
  }, []);

  return (
    <div className="bg-black min-h-screen text-[#f5f5f5] font-sans selection:bg-white selection:text-black antialiased overflow-x-hidden">
      <NoiseBackground />
      <Spotlight />
      <FloatingParticles />
      
      {/* Background Parallax Layer */}
      <motion.div 
        style={{ y: backgroundY, opacity: backgroundOpacity }}
        className="fixed inset-0 pointer-events-none z-[1]"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute text-[25vw] font-display font-medium text-white whitespace-nowrap"
            style={{ 
              top: `${i * 25}%`, 
              left: `${(i % 2 === 0 ? -10 : 20)}%`,
              transform: `rotate(${(i % 2 === 0 ? 5 : -5)}deg)`
            }}
          >
            NISHABDHA
          </div>
        ))}
      </motion.div>

      <div className="relative z-10">
        {sectionData.map((section) => (
          <Section 
            key={section.id} 
            data={section} 
            onReturn={() => navigate(-1)}
          />
        ))}
      </div>

    </div>
  );
}
