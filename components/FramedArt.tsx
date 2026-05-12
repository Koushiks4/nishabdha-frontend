import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FramedArtProps {
  src: string | string[];
  alt: string;
  className?: string;
  aspectRatio?: string;
  variant?: "black" | "white" | "wood";
  orientation?: "portrait" | "landscape";
  showControls?: boolean;
  mediaTypes?: ("image" | "video")[]; // Optional explicit media type specification
}

export function FramedArt({
  src,
  alt,
  className = "",
  aspectRatio = "aspect-square",
  variant = "black",
  orientation = "portrait",
  showControls = true,
  mediaTypes
}: FramedArtProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = Array.isArray(src) ? src : [src];
  const hasMultipleImages = images.length > 1;

  // Helper function to detect if media is a video
  const isVideo = (url: string, index: number): boolean => {
    // If mediaTypes is provided, use it
    if (mediaTypes && mediaTypes[index]) {
      return mediaTypes[index] === 'video';
    }
    // Otherwise, detect by file extension
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  const nextImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const frameColors = {
    black: "bg-[#0B0B0B] border-white/10",
    white: "bg-[#FDFDFD] border-black/5",
    wood: "bg-[#3D2B1F] border-white/5",
  };

  // Refined values for architectural realism
  const frameThickness = 12; // Slighter outer frame
  const matteWidth = 32; // Narrower gallery matte to focus more on art
  const imageRevealGap = 2; // Micro-spacing to show the matte cut edge
  
  const totalInset = frameThickness + matteWidth + imageRevealGap;

  return (
    <div className={`relative ${aspectRatio} ${className} flex items-center justify-center`}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`relative group/frame shadow-[0_15px_40px_rgba(0,0,0,0.2)] group-hover/frame:shadow-[0_25px_60px_rgba(0,0,0,0.3)] transition-all duration-700 w-full h-full`}
      >
        {/* Layer 1: Outer Frame */}
        <div 
          className={`absolute inset-0 ${frameColors[variant]} border-[1px] border-white/5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.4)] transition-colors duration-500`} 
        />
        
        {/* Layer 2: Gallery Matte */}
        <div 
          className="absolute bg-[#FDFDFB] shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] ring-1 ring-black/5 transition-all duration-500" 
          style={{ 
            top: `${frameThickness}px`, 
            left: `${frameThickness}px`, 
            right: `${frameThickness}px`, 
            bottom: `${frameThickness}px` 
          }}
        >
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
        </div>
        
        {/* Layer 3: Artwork Container */}
        <div 
          className="absolute overflow-hidden bg-[#E8E8E3] shadow-[0_0_10px_rgba(0,0,0,0.05)]"
          style={{ 
            top: `${frameThickness + matteWidth}px`, 
            left: `${frameThickness + matteWidth}px`, 
            right: `${frameThickness + matteWidth}px`, 
            bottom: `${frameThickness + matteWidth}px` 
          }}
        >
          <AnimatePresence mode="wait">
            {isVideo(images[currentIndex], currentIndex) ? (
              <motion.video
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                src={images[currentIndex]}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover/frame:scale-110"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <motion.img
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                src={images[currentIndex]}
                alt={`${alt} - view ${currentIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover/frame:scale-110"
                referrerPolicy="no-referrer"
              />
            )}
          </AnimatePresence>
          
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 via-transparent to-white/5 opacity-20 group-hover/frame:opacity-10 transition-opacity duration-1000" />
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_2px_8px_rgba(0,0,0,0.15)]" />
        </div>

        {/* Interaction Controls */}
        {hasMultipleImages && showControls && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-between px-6 opacity-100 md:opacity-0 md:group-hover/frame:opacity-100 transition-opacity">
              <button 
                onClick={prevImage}
                className="w-10 h-10 bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black transition-all pointer-events-auto rounded-full shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextImage}
                className="w-10 h-10 bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black transition-all pointer-events-auto rounded-full shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 opacity-100 md:opacity-0 md:group-hover/frame:opacity-100 transition-opacity">
              {images.map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                    idx === currentIndex ? "bg-white scale-125 shadow-md" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
