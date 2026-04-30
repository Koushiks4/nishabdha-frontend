import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Check, ChevronLeft, ChevronRight, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productApi, type Product } from "../lib/api";
import { useCart } from "../context/CartContext";
import SEO from "@/components/SEO";
import SchemaOrg from "@/components/SchemaOrg";

const materials = ["Wood Wool Board", "PET Board"];

export default function CreatorKit() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState("Wood Wool Board");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCreatorKit = async () => {
      try {
        const data = await productApi.getAll({ type: 'CREATOR_KIT' });
        setProduct(data[0] || null);
      } catch (err) {
        console.error('Failed to fetch creator kit:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCreatorKit();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Creator Kit not available</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Find the variant that matches the selected material
    const variant = product.variants?.find(v => v.name === selectedMaterial || v.size === selectedMaterial);

    if (!variant || !variant.id) {
      console.error('Variant not found for material:', selectedMaterial, 'Available variants:', product.variants);
      setShowErrorModal(true);
      return;
    }

    addToCart({
      id: product.id,
      variantId: variant.id,
      name: product.name,
      price: `₹${(variant.price || product.basePrice).toLocaleString('en-IN')}`,
      size: selectedMaterial, // Reusing size field for material
      image: product.images[0]?.url || product.images[0],
      quantity: 1
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const productSchema = {
    "name": product.name,
    "image": product.images,
    "description": product.description,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Nishabdha"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://nishabdha.com/creator-kit`,
      "priceCurrency": "INR",
      "price": "35000",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-40 pb-24 min-h-screen bg-background"
    >
      <SEO 
        title="Creator Kit - Premium Acoustic Setup"
        description="The ultimate acoustic setup for creators. Includes Wood Wool boards and diffusers designed for maximum sound absorption and aesthetic clarity."
        keywords="creator kit, acoustic setup, wood wool boards, sound diffusers, studio acoustics, creator workspace"
      />
      <SchemaOrg type="Product" data={productSchema} />
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start gap-[60px]">
          {/* Left Side: Interactive Gallery */}
          <div className="w-full md:w-[55%] space-y-6 md:space-y-8">
            {/* Main Image */}
            <div className="w-full h-[60vh] max-h-[520px] bg-[#0a0a0a] p-3 md:p-4 overflow-hidden rounded-none group relative shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
              <motion.img
                key={activeImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                src={product.images[activeImageIndex]?.url || 'https://picsum.photos/seed/placeholder/800/1000'}
                alt={`Nishabdha Creator Kit - Acoustic Setup View ${activeImageIndex + 1}`}
                className="w-full h-full object-cover object-center transition-transform duration-1000 lg:group-hover:scale-103"
                loading="eager"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent opacity-40 pointer-events-none" />

              {/* Arrow Navigation */}
              <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <button 
                  onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))}
                  className="w-10 h-10 bg-background/80 backdrop-blur-md flex items-center justify-center text-primary hover:bg-primary hover:text-background transition-all pointer-events-auto"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveImageIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))}
                  className="w-10 h-10 bg-background/80 backdrop-blur-md flex items-center justify-center text-primary hover:bg-primary hover:text-background transition-all pointer-events-auto"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto lg:overflow-visible pb-4 scrollbar-hide lg:grid lg:grid-cols-6 xl:grid-cols-8 lg:gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative flex-shrink-0 h-[55px] aspect-square overflow-hidden rounded-none transition-all duration-300 border ${
                    activeImageIndex === idx 
                      ? "border-primary brightness-100 scale-100" 
                      : "border-white/5 brightness-50 hover:brightness-100 hover:scale-[1.02]"
                  }`}
                >
                  <img
                    src={img?.url || 'https://picsum.photos/seed/placeholder/100/100'}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Details */}
          <div className="w-full md:w-[45%] space-y-10 md:space-y-12 lg:sticky lg:top-40">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.5em] text-primary/60">{product.category}</p>
                <h1 className="text-5xl md:text-7xl font-display uppercase tracking-tighter leading-none">{product.name}</h1>
              </div>
              <p className="text-2xl font-heading italic text-primary">₹{product.basePrice.toLocaleString('en-IN')}</p>
            </div>

            <div className="space-y-6">
              <p className="text-lg font-light text-muted-foreground leading-relaxed">
                {product.description}
              </p>
              
              <div className="space-y-3 pt-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Product Includes</p>
                <ul className="space-y-2">
                  <li className="text-[11px] uppercase tracking-widest text-foreground font-light flex items-center gap-3">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    4 Wood Wool Acoustic Boards
                  </li>
                  <li className="text-[11px] uppercase tracking-widest text-foreground font-light flex items-center gap-3">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    2 Diffusers
                  </li>
                  <li className="text-[11px] uppercase tracking-widest text-foreground font-light flex items-center gap-3">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    Designed for sound absorption and echo reduction
                  </li>
                </ul>
              </div>
            </div>

            {/* Material Selector */}
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Select Material</p>
              <div className="flex flex-wrap gap-4">
                {materials.map(material => (
                  <button
                    key={material}
                    onClick={() => setSelectedMaterial(material)}
                    className={`px-8 py-4 flex-shrink-0 flex items-center justify-center text-[10px] uppercase tracking-widest border transition-all duration-300 ${
                      selectedMaterial === material 
                        ? "bg-primary text-background border-primary" 
                        : "border-white/10 hover:border-primary/40 text-muted-foreground"
                    }`}
                  >
                    [ {material} ]
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`w-full py-8 text-[11px] uppercase tracking-[0.4em] transition-all duration-500 rounded-none ${
                    isAdded ? "bg-green-600 hover:bg-green-600" : "bg-primary text-background hover:bg-white"
                }`}
              >
                {isAdded ? (
                  <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Added to Bag</span>
                ) : (
                  <span className="flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Add to Bag | ₹{product.basePrice.toLocaleString('en-IN')}</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <AnimatePresence>
        {showErrorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/95 backdrop-blur-sm"
            onClick={() => setShowErrorModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md border border-border bg-card p-8 shadow-2xl"
            >
              <button
                onClick={() => setShowErrorModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 border border-destructive/20 bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display uppercase tracking-tight">
                      Unavailable
                    </h3>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                      Material option
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  This material option is currently unavailable. Please try another material or contact us for more information.
                </p>

                <Button
                  onClick={() => setShowErrorModal(false)}
                  className="w-full uppercase tracking-wider text-xs"
                >
                  Understood
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
