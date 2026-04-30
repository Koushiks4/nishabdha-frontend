import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FramedArt } from "@/components/FramedArt";
import { productApi, type Product } from "../lib/api";
import SEO from "@/components/SEO";
import SchemaOrg from "@/components/SchemaOrg";

export default function Home() {
  const [allGalleryItems, setAllGalleryItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const data = await productApi.getAll({ type: 'ARTWORK' });
        setAllGalleryItems(data);
      } catch (err) {
        console.error('Failed to fetch artwork:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtwork();
  }, []);

  const landscapePool = allGalleryItems.filter(p => p.orientation === "landscape");
  const portraitPool = allGalleryItems.filter(p => p.orientation === "portrait");

  const featuredLandscapes = landscapePool.slice(0, 5);

  const organizationSchema = {
    "name": "Nishabdha",
    "url": "https://nishabdha.com",
    "logo": "https://nishabdha.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-000-000-0000",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": "en"
    }
  };

  return (
    <div className="bg-background">
      <SEO 
        title="Premium Acoustic Art & Sound Solutions"
        description="Transform your space with Nishabdha's premium acoustic art. Handcrafted sound-absorbing frames that bring silence and aesthetic elegance."
        keywords="acoustic art, sound absorbing panels, studio acoustics, minimalist decor"
      />
      <SchemaOrg type="Organization" data={organizationSchema} />
      {/* Hero Section - Geez Style */}
      <section className="relative min-h-screen flex flex-col justify-end px-6 md:px-12 pb-12 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-90"
            style={{ filter: 'brightness(1.2)' }}
          >
            <source src="/website-video.webm" type="video/webm" />
            <source src="/website-video.mp4" type="video/mp4" />
            {/* Fallback for browsers without video support */}
            <img
              src="/website video.gif"
              alt="Nishabdha Premium Acoustic Art Hero Background"
              className="w-full h-full object-cover"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1800px] mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4"></div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center gap-6"
            >
              <Link to="/shop" className="group flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                  <ArrowRight className="w-6 h-6 group-hover:text-background transition-colors" />
                </div>
                <span className="text-xs uppercase tracking-[0.3em]">Explore Collection</span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Vertical Grid Lines */}
        <div className="absolute inset-0 pointer-events-none flex justify-between px-6 md:px-12 opacity-10">
          <div className="w-[1px] h-full bg-white" />
          <div className="hidden md:block w-[1px] h-full bg-white" />
          <div className="hidden md:block w-[1px] h-full bg-white" />
          <div className="w-[1px] h-full bg-white" />
        </div>
      </section>

      {/* Featured Section - Horizontal Showcase - Landscape Only */}
      <section className="py-24 md:py-48 border-t border-border overflow-hidden">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4">
              <p className="text-[9px] uppercase tracking-[0.4em] text-primary/60">Selected Works</p>
              <h2 className="text-4xl md:text-8xl font-display leading-none uppercase tracking-tighter">
                Featured <span className="text-outline font-light italic">Art</span>
              </h2>
            </div>
            <p className="max-w-sm text-xs text-muted-foreground font-light leading-relaxed">
              A curated selection of our most profound pieces. Each frame is a testament to the power of minimalism.
            </p>
          </div>
        </div>

        {/* Featured Gallery Grid */}
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
          {featuredLandscapes.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="group"
            >
              <Link to={`/product/${product.id}`} title={`View details for ${product.name}`} className="block space-y-8">
                <div className="relative transform transition-transform duration-700 group-hover:scale-[1.02]">
                  <FramedArt 
                    src={product.images[0]?.url || 'https://picsum.photos/seed/placeholder/800/1000'} 
                    alt={`Acoustic Art Piece - ${product.name}`} 
                    aspectRatio="aspect-[16/9]"
                    orientation="landscape"
                    className="w-full h-full"
                    showControls={false}
                  />
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 leading-none">
                      <p className="text-[10px] uppercase tracking-[0.4em] text-primary/40 leading-none">{product.category}</p>
                      <span className="w-1 h-1 rounded-full bg-primary/20" />
                      <p className="text-[8px] uppercase tracking-[0.3em] text-primary/60 leading-none">Acoustic Frame</p>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-display uppercase tracking-tighter leading-none group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-heading italic text-muted-foreground mb-1">{product.price}</p>
                    <div className="flex items-center justify-end gap-2 text-[8px] uppercase tracking-[0.2em] text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      View Details <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 md:py-48 bg-secondary/5 border-t border-border">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-[10px] uppercase tracking-[0.5em] text-primary">The Nishabdha Material</p>
            <h2 className="text-5xl md:text-8xl font-display uppercase tracking-tighter leading-[0.9]">Designed <br /> <span className="text-outline">For Silence</span></h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto text-lg md:text-xl font-light text-muted-foreground leading-relaxed"
          >
            Every Nishabdha frame is built on wood wool acoustic boards | a material known for its sound-absorbing properties. 
            Beyond art, these pieces shape the atmosphere of a space, reducing noise and enhancing stillness.
          </motion.p>
        </div>
      </section>

      {/* Curated Gallery - Horizontal Carousels */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-background border-t border-border overflow-hidden">
        <div className="max-w-[1800px] mx-auto space-y-32">
          <div className="text-center space-y-4 mb-20">
            <p className="text-[9px] uppercase tracking-[0.5em] text-primary/60">The Portfolio</p>
            <h2 className="text-5xl md:text-8xl font-display uppercase tracking-tighter leading-none">
              Curated <br /> <span className="text-outline">Gallery</span>
            </h2>
          </div>

          {/* Landscape Series Carousel */}
          <div className="space-y-12 relative group/carousel">
            <div className="flex items-center gap-6">
              <div className="h-[1px] flex-1 bg-border" />
              <h3 className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground whitespace-nowrap">
                Landscape Series
              </h3>
              <div className="h-[1px] flex-1 bg-border" />
            </div>

            <div className="relative">
              <div 
                className="relative w-full flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-8 md:gap-16 pb-12 cursor-grab active:cursor-grabbing"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {landscapePool.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex-shrink-0 w-[80vw] md:w-[45vw] lg:w-[32vw] snap-center group"
                  >
                    <Link to={`/product/${product.id}`} title={`View details for ${product.name}`} className="block space-y-6">
                      <FramedArt
                        src={product.images[0]?.url || 'https://picsum.photos/seed/placeholder/800/600'}
                        alt={`Nishabdha Landscape Acoustic Frame - ${product.name}`}
                        aspectRatio="aspect-[4/3]"
                        orientation="landscape"
                      />
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-3 leading-none opacity-60">
                          <p className="text-[8px] uppercase tracking-[0.2em] text-primary/40 leading-none">{product.category}</p>
                          <span className="w-1 h-1 rounded-full bg-primary/20" />
                          <p className="text-[7px] uppercase tracking-[0.2em] text-primary/60 leading-none">Acoustic Frame</p>
                        </div>
                        <h3 className="text-xl font-display uppercase tracking-tight group-hover:text-primary transition-colors leading-none tracking-tighter">{product.name}</h3>
                        <p className="text-xs font-heading italic text-muted-foreground">{product.price}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
                {/* Snap Padding Spacer */}
                <div className="flex-shrink-0 w-[10vw]" />
              </div>
              
              {/* Fade Edges */}
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity" />
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity" />
            </div>
            
            {/* Subtle Progress Indicator Container */}
            <div className="w-full max-w-[200px] mx-auto h-[1px] bg-white/10 relative overflow-hidden">
               <motion.div 
                 className="absolute inset-0 bg-primary/40 origin-left"
                 initial={{ scaleX: 0 }}
                 whileInView={{ scaleX: 0.3 }}
                 transition={{ duration: 1, delay: 0.5 }}
               />
            </div>
          </div>

          {/* Portrait Series Carousel */}
          <div className="space-y-12 relative group/carousel">
            <div className="flex items-center gap-6">
              <div className="h-[1px] flex-1 bg-border" />
              <h3 className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground whitespace-nowrap">
                Portrait Series
              </h3>
              <div className="h-[1px] flex-1 bg-border" />
            </div>

            <div className="relative">
              <div 
                className="relative w-full flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-8 md:gap-12 pb-12 cursor-grab active:cursor-grabbing"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {portraitPool.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex-shrink-0 w-[65vw] md:w-[35vw] lg:w-[23vw] snap-center group"
                  >
                    <Link to={`/product/${product.id}`} title={`View details for ${product.name}`} className="block space-y-6">
                      <FramedArt 
                        src={product.images[0]?.url || 'https://picsum.photos/seed/placeholder/800/1000'} 
                        alt={`Nishabdha Portrait Acoustic Frame - ${product.name}`} 
                        aspectRatio="aspect-[3/4]"
                        orientation="portrait"
                      />
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-3 leading-none opacity-60">
                          <p className="text-[8px] uppercase tracking-[0.2em] text-primary/40 leading-none">{product.category}</p>
                          <span className="w-1 h-1 rounded-full bg-primary/20" />
                          <p className="text-[7px] uppercase tracking-[0.2em] text-primary/60 leading-none">Acoustic Frame</p>
                        </div>
                        <h3 className="text-xl font-display uppercase tracking-tight group-hover:text-primary transition-colors leading-none tracking-tighter">{product.name}</h3>
                        <p className="text-xs font-heading italic text-muted-foreground">{product.price}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
                {/* Snap Padding Spacer */}
                <div className="flex-shrink-0 w-[10vw]" />
              </div>

              {/* Fade Edges */}
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity" />
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity" />
            </div>

            {/* Subtle Progress Indicator Container */}
            <div className="w-full max-w-[200px] mx-auto h-[1px] bg-white/10 relative overflow-hidden">
               <motion.div 
                 className="absolute inset-0 bg-primary/40 origin-left"
                 initial={{ scaleX: 0 }}
                 whileInView={{ scaleX: 0.2 }}
                 transition={{ duration: 1, delay: 0.5 }}
               />
            </div>
          </div>
        </div>
      </section>

      {/* Studio Teaser - Compact Feature Block */}
      <section className="relative py-20 md:py-32 overflow-hidden border-y border-border bg-black/40">
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/studio-teaser/1920/1080?grayscale&blur=20"
            alt="Nishabdha Creative Studio Facility Background"
            className="w-full h-full object-cover opacity-10"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 max-w-[1800px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <p className="text-[9px] uppercase tracking-[0.5em] text-primary/60">Creative Space</p>
                <h2 className="text-4xl md:text-6xl font-display leading-[0.9] uppercase tracking-tighter">
                  The <span className="text-outline font-light italic">Studio</span>
                </h2>
              </div>
              <p className="max-w-md text-base md:text-lg font-light text-muted-foreground leading-relaxed">
                Beyond the frame. A professional ecosystem for creators. Explore our high-fidelity audio and cinematic visual facilities.
              </p>
              <div className="pt-4">
                <Button 
                  render={<Link to="/studio" />} 
                  nativeButton={false} 
                  variant="outline" 
                  className="rounded-none px-8 py-6 uppercase tracking-[0.3em] text-[10px] border-white/20 hover:bg-white hover:text-background transition-all duration-500"
                >
                  Enter The Studio
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[16/9] overflow-hidden rounded-sm border border-white/5 shadow-2xl"
            >
              <img
                src="https://picsum.photos/seed/studio-interior/1200/800?grayscale"
                alt="Interior View of Nishabdha Professional Audio Studio"
                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Custom CTA - Compact Feature Block */}
      <section className="py-16 md:py-24 px-6 md:px-12 border-t border-border bg-secondary/5">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-24">
          <div className="w-full md:w-[45%] order-2 md:order-1">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-[4/3] overflow-hidden bg-secondary rounded-sm shadow-xl"
            >
              <img
                src="https://picsum.photos/seed/custom-cta/1200/1200?grayscale"
                alt="Handcrafted Custom Acoustic Art Mockup Illustration"
                className="w-full h-full object-cover opacity-80"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />
            </motion.div>
          </div>
          <div className="flex-1 space-y-8 order-1 md:order-2">
            <div className="space-y-3">
              <p className="text-[9px] uppercase tracking-[0.5em] text-primary/60">Bespoke Art</p>
              <h2 className="text-4xl md:text-6xl font-display leading-[0.9] uppercase tracking-tighter">
                Your <br /> Vision <br /> <span className="text-outline font-light italic">Realized</span>
              </h2>
            </div>
            <p className="text-lg font-light text-muted-foreground leading-relaxed max-w-lg">
              Transform your personal moments into gallery-grade masterpieces. Our custom framing service brings your digital memories into the physical realm.
            </p>
            <div className="pt-4">
              <Button 
                render={<Link to="/custom" />} 
                nativeButton={false} 
                className="rounded-none px-8 py-6 uppercase tracking-[0.3em] text-[10px] bg-primary text-background hover:bg-white transition-all duration-500"
              >
                Start Custom Project
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Visit Our Studio - Location Section */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-t border-border bg-black/20">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-[9px] uppercase tracking-[0.5em] text-primary/60">Physical Presence</p>
                <h2 className="text-4xl md:text-6xl font-display leading-[0.9] uppercase tracking-tighter">
                  Visit Our <br /> <span className="text-outline font-light italic">Sanctuary</span>
                </h2>
              </div>
              <p className="max-w-md text-base md:text-lg font-light text-muted-foreground leading-relaxed">
                Experience the silence in person. Our studio is more than a location; it's a curated environment designed for creative clarity.
              </p>
              <div className="space-y-6 pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Plus className="w-4 h-4 text-primary rotate-45" />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.3em] mb-2">Location</h4>
                    <p className="text-sm text-muted-foreground font-light">
                      6, 4th main road, Arehalli, <br />
                      Uttarahalli Hobli, Bengaluru, <br />
                      Karnataka 560061
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Plus className="w-4 h-4 text-primary rotate-45" />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.3em] mb-2">Hours</h4>
                    <p className="text-sm text-muted-foreground font-light">
                      Mon | Sat: 10:00 | 19:00 <br />
                      Sun: By Appointment Only
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-8">
                <a 
                  href="https://maps.app.goo.gl/nh1bRckHA4SkvoQUA" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-full border border-primary flex items-center justify-center group-hover:bg-primary transition-all duration-500">
                    <ArrowRight className="w-5 h-5 group-hover:text-background transition-colors" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.4em] font-medium">Get Directions</span>
                </a>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square lg:aspect-auto lg:h-[600px] overflow-hidden rounded-sm border border-white/5 shadow-2xl group"
            >
              <img
                src="https://picsum.photos/seed/studio-map/1200/1200?grayscale"
                alt="Map showing Nishabdha Studio location in Bangalore"
                className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-1000"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-transparent to-background/60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border border-primary/20 flex items-center justify-center animate-pulse">
                  <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_20px_rgba(var(--primary),0.5)]" />
                </div>
              </div>
              {/* Decorative Map Lines */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-0 w-full h-[1px] bg-white/20 rotate-12" />
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/20 -rotate-6" />
                <div className="absolute left-1/3 top-0 w-[1px] h-full bg-white/20 rotate-3" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter - Minimalist */}
      <section className="py-24 border-t border-border px-6 md:px-12">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <h3 className="text-3xl font-display uppercase tracking-tighter">Join The Silence</h3>
          <div className="flex w-full md:w-auto max-w-md border-b border-white/20 focus-within:border-primary transition-colors">
            <input
              type="email"
              placeholder="Email Address"
              className="bg-transparent border-none outline-none py-4 text-xs tracking-[0.3em] w-full"
            />
            <button className="px-4 text-primary hover:translate-x-2 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
