import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import { productApi, type Product } from "../lib/api";
import SEO from "@/components/SEO";

const categories = ["All", "Oversized", "Graphic", "Minimal"];

export default function Merch() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productApi.getAll({ type: 'MERCHANDISE' });
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch merchandise:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredItems = activeCategory === "All"
    ? products
    : products.filter(p => p.category === activeCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Loading merchandise...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-background">
      <SEO
        title="Premium Merchandise & Apparel"
        description="Shop Nishabdha's exclusive merchandise. Minimalist oversized tees and graphic apparel inspired by the silence of art."
        keywords="minimalist apparel, nishabdha merchandise, oversized t-shirts, graphic tees, designer streetwear"
      />
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Merchandise Hero */}
        <header className="mb-24 space-y-12">
          <div className="space-y-6">
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] uppercase tracking-[0.5em] text-primary"
            >
              Nishabdha Wearable
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-7xl md:text-9xl font-display uppercase tracking-tighter leading-none"
            >
              Wear The <br /> <span className="text-outline">Art</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="max-w-md text-lg font-light text-muted-foreground leading-relaxed"
            >
              Minimal designs. Maximum expression. Our apparel collection translates the silence of art into high-quality, wearable textures.
            </motion.p>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-6 border-b border-border pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] uppercase tracking-[0.3em] transition-all duration-300 relative group ${
                  activeCategory === cat ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
                <span className={`absolute -bottom-4 left-0 w-full h-[1px] bg-primary transition-transform duration-500 origin-left ${
                  activeCategory === cat ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`} />
              </button>
            ))}
          </div>
        </header>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-12 md:gap-y-16">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="group cursor-pointer"
              >
                <Link to={`/merchandise/${product.slug}`} className="block">
                  <div className="space-y-4 md:space-y-8">
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-secondary/10 rounded-sm">
                      <img
                        src={product.images[0]?.url || 'https://picsum.photos/seed/placeholder/800/1000'}
                        alt={`Nishabdha ${product.name} - ${product.category} Apparel`}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      {/* Hover Alternate Image - Hidden on mobile for performance/clarity if desired, but keeping as requested */}
                      {product.images.length > 1 && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 hidden md:block">
                          <img
                            src={product.images[1]?.url || 'https://picsum.photos/seed/placeholder/800/1000'}
                            alt={`Nishabdha ${product.name} alternate view`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      {/* Overlay Depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent opacity-40 pointer-events-none" />
                    </div>

                    {/* Info */}
                    <div className="space-y-2 md:space-y-4">
                      <div className="flex flex-col md:flex-row md:justify-between items-start pt-1">
                        <div className="space-y-0.5 md:space-y-1">
                          <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-primary/40 leading-none">{product.category}</p>
                          <h3 className="text-lg md:text-2xl font-display uppercase tracking-tight group-hover:text-primary transition-colors leading-none tracking-tighter">
                            {product.name}
                          </h3>
                        </div>
                        <p className="text-xs md:text-sm font-heading italic text-muted-foreground mt-1 md:mt-0">₹{product.basePrice.toLocaleString()}</p>
                      </div>
                      
                      <div className="hidden md:flex items-center justify-between pt-6 border-t border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                         <span className="text-[9px] uppercase tracking-[0.2em] font-medium">Limited Edition</span>
                         <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] transform translate-x-4 group-hover:translate-x-0 transition-all">
                           View Details <Plus className="w-3 h-3" />
                         </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredItems.length === 0 && (
          <div className="py-48 text-center border border-border mt-12">
            <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground font-light">Coming Soon to the Boutique.</p>
          </div>
        )}
      </div>
    </div>
  );
}
