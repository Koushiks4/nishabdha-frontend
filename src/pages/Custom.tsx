import React, { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Palette, Ruler, CheckCircle, ArrowRight, X, Image as ImageIcon, FileText, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "../context/CartContext";
import { Separator } from "@/components/ui/separator";
import SEO from "@/components/SEO";

interface FilePreview {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: string;
  type: string;
}

export default function Custom() {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [activeFile, setActiveFile] = useState<FilePreview | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedSize, setSelectedSize] = useState("18x24");
  const [isFramed, setIsFramed] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  
  const { addToCart } = useCart();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizes = [
    { label: "12 x 18", value: "12x18", price: 120 },
    { label: "18 x 24", value: "18x24", price: 180 },
    { label: "24 x 36", value: "24x36", price: 250 },
  ];

  const currentPrice = useMemo(() => {
    const base = sizes.find(s => s.value === selectedSize)?.price || 180;
    return isFramed ? base + 100 : base;
  }, [selectedSize, isFramed]);

  const handleAddToCart = () => {
    if (!activeFile) return;
    
    addToCart({
      id: parseInt(activeFile.id, 36),
      name: `Custom: ${activeFile.name}`,
      price: `$${currentPrice}`,
      image: activeFile.preview || "",
      quantity: 1,
      size: `${selectedSize} (${isFramed ? "Framed" : "Unframed"})`
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/tiff", "application/pdf"];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!validTypes.includes(file.type)) {
      alert(`Invalid file type: ${file.name}. Please upload JPG, PNG, TIFF, or PDF.`);
      return false;
    }

    if (file.size > maxSize) {
      alert(`File too large: ${file.name}. Maximum size is 100MB.`);
      return false;
    }

    return true;
  };

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;

    const fileList = Array.from(newFiles);
    const validFiles = fileList.filter(validateFile);

    const mappedFiles = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      name: file.name,
      size: formatSize(file.size),
      type: file.type
    }));

    setFiles(prev => [...prev, ...mappedFiles]);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) URL.revokeObjectURL(fileToRemove.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const triggerSearch = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-background min-h-screen">
      <SEO 
        title="Custom Acoustic Art | Bespoke Framing"
        description="Transform your personal vision into a premium acoustic art piece. Handcrafted custom framing for your designs and photographs with sound-absorbing benefits."
        keywords="custom acoustic art, bespoke framing Bangalore, personalized wall art, acoustic photo prints"
      />
      {/* Custom Hero */}
      <section className="relative pt-48 pb-24 px-6 md:px-12 border-b border-border">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12">
            <div className="space-y-8">
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary">Bespoke Production</p>
              <h1 className="text-7xl md:text-[12vw] font-display uppercase tracking-tighter leading-[0.8]">
                Your <br /> <span className="text-outline">Vision</span>
              </h1>
            </div>
            <div className="max-w-md space-y-8">
              <p className="text-xl font-light text-muted-foreground leading-relaxed">
                We bridge the gap between digital memory and physical art. Gallery-grade materials, handcrafted for your unique story.
              </p>
              <div className="flex items-center gap-4 text-primary">
                <div className="w-12 h-[1px] bg-primary" />
                <span className="text-[10px] uppercase tracking-[0.3em]">Scroll to begin</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process - Geez Grid */}
      <section className="py-24 md:py-48 px-6 md:px-12">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border">
          {[
            { icon: Upload, title: "Upload", desc: "Send us your high-resolution image or design file. We support all major formats up to 100MB." },
            { icon: Palette, title: "Curate", desc: "Choose from our museum-grade paper stocks and handcrafted solid wood frames." },
            { icon: CheckCircle, title: "Craft", desc: "Our master framers inspect and assemble your piece with surgical precision." },
          ].map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-background p-12 md:p-24 space-y-12 group"
            >
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                  <step.icon className="w-6 h-6 group-hover:text-background transition-colors" />
                </div>
                <span className="text-6xl font-display text-white/5">0{i + 1}</span>
              </div>
              <div className="space-y-6">
                <h3 className="text-4xl font-display uppercase tracking-tighter">{step.title}</h3>
                <p className="text-muted-foreground font-light leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Upload Area - Brutalist */}
      <section id="upload-section" className="py-24 md:py-48 px-6 md:px-12 bg-secondary/20">
        <div className="max-w-4xl mx-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            multiple
            accept=".jpg,.jpeg,.png,.tiff,.pdf"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={triggerSearch}
            className={`border-2 border-dashed p-12 md:p-32 text-center space-y-12 transition-all cursor-pointer group rounded-sm ${
              isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary"
            }`}
          >
            <div className="relative inline-block">
              <Upload className={`w-16 h-16 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-display uppercase tracking-tighter">Initialize Upload</h2>
              <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground">Drop files or click to browse</p>
            </div>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                triggerSearch();
              }}
              className="rounded-none px-12 py-8 bg-primary text-background hover:bg-white transition-all duration-500 uppercase tracking-[0.3em] text-xs font-bold"
            >
              Select Assets
            </Button>
          </motion.div>
          
          {/* File Previews */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-12 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-xs uppercase tracking-[0.3em] font-medium">Ready for Curation ({files.length})</h3>
                  <button 
                    onClick={() => setFiles([])}
                    className="text-[10px] uppercase tracking-widest text-primary hover:text-white transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {files.map((file) => (
                    <motion.div
                      key={file.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`group relative flex flex-col gap-4 bg-background/40 p-6 border transition-all rounded-sm overflow-hidden ${
                        activeFile?.id === file.id ? "border-primary" : "border-white/5 hover:border-primary/20"
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className="relative w-24 h-24 bg-secondary/50 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-sm">
                          {file.preview ? (
                            <img 
                              src={file.preview} 
                              alt={file.name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <FileText className="w-8 h-8 text-muted-foreground" />
                          )}
                          <div className="absolute inset-0 bg-background/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-xs font-medium truncate pr-8">{file.name}</p>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase tracking-widest">
                            <span>{file.size}</span>
                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                            <span>{file.type.split('/')[1]}</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                            if (activeFile?.id === file.id) setActiveFile(null);
                          }}
                          className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveFile(file);
                          const element = document.getElementById('customization-panel');
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        variant="outline"
                        className="w-full rounded-none border-primary/20 text-primary hover:bg-primary hover:text-background transition-all uppercase tracking-widest text-[10px] py-4"
                      >
                        {activeFile?.id === file.id ? "Editing Configuration" : "Start Customizing"}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Customization Panel */}
          <AnimatePresence>
            {activeFile && (
              <motion.div
                id="customization-panel"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="mt-32 pt-32 border-t border-white/5 space-y-16"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  {/* Visual Preview */}
                  <div className="space-y-8">
                    <div className="aspect-[4/5] bg-secondary/50 relative overflow-hidden group">
                      {activeFile.preview ? (
                        <div className="absolute inset-0 p-12">
                          <div className={`w-full h-full transition-all duration-700 ${isFramed ? "p-8 bg-[#f5f5f5] shadow-2xl border-[12px] border-[#1a1a1a]" : "shadow-xl"}`}>
                            <img 
                              src={activeFile.preview} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-24 h-24 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground italic">Simulation: Museum Grade Archival Print</p>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-12">
                    <div className="space-y-4">
                      <p className="text-[10px] uppercase tracking-[0.5em] text-primary">Configuration</p>
                      <h3 className="text-4xl font-display uppercase tracking-tighter">Refine Your Piece</h3>
                    </div>

                    <div className="space-y-8">
                      {/* Dimensions */}
                      <div className="space-y-6">
                        <label className="text-[10px] uppercase tracking-[0.3em] font-medium block">Dimensions (inches)</label>
                        <div className="grid grid-cols-3 gap-2">
                          {sizes.map((size) => (
                            <button
                              key={size.value}
                              onClick={() => setSelectedSize(size.value)}
                              className={`py-4 text-[10px] uppercase tracking-widest transition-all border ${
                                selectedSize === size.value 
                                  ? "bg-primary text-background border-primary" 
                                  : "border-white/10 hover:border-white/30"
                              }`}
                            >
                              {size.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Presentation */}
                      <div className="space-y-6">
                        <label className="text-[10px] uppercase tracking-[0.3em] font-medium block">Presentation</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: "Unframed", value: false },
                            { label: "Handcrafted Frame", value: true },
                          ].map((opt) => (
                            <button
                              key={opt.label}
                              onClick={() => setIsFramed(opt.value)}
                              className={`py-4 text-[10px] uppercase tracking-widest transition-all border ${
                                isFramed === opt.value 
                                  ? "bg-primary text-background border-primary" 
                                  : "border-white/10 hover:border-white/30"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Separator className="bg-white/5" />

                      {/* Subtotal */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Estimated Investment</p>
                          <p className="text-3xl font-medium text-white">${currentPrice}</p>
                        </div>
                        <Button
                          onClick={handleAddToCart}
                          className="rounded-none px-8 py-8 bg-white text-background hover:bg-primary transition-all duration-500 uppercase tracking-[0.3em] text-xs font-bold min-w-[200px]"
                        >
                          {isAdded ? (
                            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" /> Added
                            </motion.div>
                          ) : (
                            <span className="flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Add to Bag</span>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="bg-secondary/30 p-6 rounded-sm border border-white/5">
                      <p className="text-[10px] uppercase tracking-[0.3em] leading-relaxed text-muted-foreground pr-8">
                        Our master framers use solid ash wood and anti-reflective glass for every bespoke production. Standard lead time: 14 business days.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h4 className="text-xs uppercase tracking-[0.3em] text-primary">Technical Requirements</h4>
              <ul className="space-y-4 text-sm text-muted-foreground font-light">
                <li className="flex items-center gap-4"><div className="w-1 h-1 bg-primary" /> Minimum resolution: 3000px</li>
                <li className="flex items-center gap-4"><div className="w-1 h-1 bg-primary" /> Formats: .JPG, .PNG, .TIFF, .PDF</li>
                <li className="flex items-center gap-4"><div className="w-1 h-1 bg-primary" /> Color Profile: Adobe RGB or sRGB</li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-xs uppercase tracking-[0.3em] text-primary">Need Assistance?</h4>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Our design team is available for file consultation and resolution checks. Contact us for high-volume or complex projects.
              </p>
              <button className="flex items-center gap-4 group">
                <span className="text-xs uppercase tracking-[0.3em] group-hover:text-primary transition-colors">Contact Design Desk</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
