import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ShoppingBag, Check, ChevronLeft, ChevronRight, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productApi, type Product } from "../lib/api";
import { useCart } from "../context/CartContext";
import SEO from "@/components/SEO";
import SchemaOrg from "@/components/SchemaOrg";

const sizes = ["S", "M", "L", "XL"];

export default function MerchDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("M");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productApi.getAll({ type: 'MERCHANDISE' });
        const found = data.find(p => p.slug === slug);
        setProduct(found || null);
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-48 pb-24 text-center">
        <h2 className="text-4xl font-display uppercase">Product Not Found</h2>
        <Link to="/merchandise" className="inline-flex items-center gap-2 mt-8 text-primary hover:translate-x-[-10px] transition-transform">
          <ArrowLeft className="w-4 h-4" /> Back to Merchandise
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Find the variant that matches the selected size
    const variant = product.variants?.find(v => v.size === selectedSize || v.name === selectedSize);

    if (!variant || !variant.id) {
      console.error('Variant not found for size:', selectedSize, 'Available variants:', product.variants);
      setShowErrorModal(true);
      return;
    }

    addToCart({
      id: product.id,
      variantId: variant.id,
      name: product.name,
      price: `₹${(variant.price || product.basePrice).toLocaleString()}`,
      size: selectedSize,
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
    "sku": `MERCH-${product.id}`,
    "brand": {
      "@type": "Brand",
      "name": "Nishabdha"
    },
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "url": `https://nishabdha.com/merchandise/${product.slug}`,
      "priceCurrency": "INR",
      "price": String(product.basePrice),
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24 min-h-screen bg-background"
    >
      <SEO 
        title={`${product.name} | Premium Merchandise`}
        description={product.description}
        keywords={`Nishabdha ${product.name}, premium apparel, ${product.category} clothing`}
        image={product.images[0]?.url || 'https://picsum.photos/seed/placeholder/800/1000'}
      />
      <SchemaOrg type="Product" data={productSchema} />
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <Link to="/merchandise" className="inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors mb-12 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
          Back to Collections
        </Link>

        <div className="flex flex-col md:flex-row items-start gap-[60px]">
          {/* Left Side: Interactive Gallery */}
          <div className="w-full md:w-[55%] space-y-6 md:space-y-8 order-1 lg:order-1">
            {/* Main Image */}
            <div className="w-full h-[60vh] max-h-[520px] bg-[#0a0a0a] p-3 md:p-4 overflow-hidden rounded-none group relative shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
              <motion.img
                key={activeImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                src={product.images[activeImageIndex]?.url || 'https://picsum.photos/seed/placeholder/800/1000'}
                alt={`Premium Nishabdha Apparel - ${product.name} - Study View ${activeImageIndex + 1}`}
                className="w-full h-full object-cover object-center transition-transform duration-1000 lg:group-hover:scale-103"
                loading="eager"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent opacity-40 pointer-events-none" />

              {/* Desktop Arrow Navigation */}
              <div className="absolute inset-0 hidden lg:flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1));
                  }}
                  className="w-10 h-10 bg-background/80 backdrop-blur-md flex items-center justify-center text-primary hover:bg-primary hover:text-background transition-all pointer-events-auto"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveImageIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0));
                  }}
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
          <div className="w-full md:w-[45%] space-y-10 md:space-y-12 lg:sticky lg:top-32 order-2 lg:order-2">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.5em] text-primary/60">{product.category}</p>
                <h1 className="text-5xl md:text-7xl font-display uppercase tracking-tighter leading-none">{product.name}</h1>
              </div>
              <p className="text-2xl font-heading italic text-primary">₹{product.basePrice.toLocaleString()}</p>
            </div>

            {/* Size Selector - Compact for mobile */}
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Select Size</p>
              <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 md:w-14 md:h-14 flex-shrink-0 flex items-center justify-center text-xs tracking-widest border transition-all duration-300 ${
                      selectedSize === size 
                        ? "bg-primary text-background border-primary" 
                        : "border-white/10 hover:border-primary/40 text-muted-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Add to Bag - Hidden on mobile */}
            <div className="hidden lg:block pt-4">
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
                  <span className="flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Add to Bag ₹{product.basePrice.toLocaleString()}</span>
                )}
              </Button>
            </div>

            {/* Information Sections */}
            <div className="space-y-8">
                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Description</p>
                  <p className="text-lg font-light text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                    <div className="space-y-2">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Fabric</p>
                        <p className="text-sm font-light">100% Organic Cotton</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Shipping</p>
                        <p className="text-sm font-light">Express: 3-5 Days</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden p-4 bg-background/90 backdrop-blur-xl border-t border-white/5 safe-bottom">
        <div className="flex gap-4 items-center">
          <div className="flex-1 space-y-0.5">
            <p className="text-[8px] uppercase tracking-widest text-muted-foreground leading-none">Total Price</p>
            <p className="text-xl font-display uppercase tracking-tight text-primary leading-none">₹{product.basePrice.toLocaleString()}</p>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`flex-[2] py-6 text-[10px] uppercase tracking-[0.3em] transition-all duration-500 rounded-none ${
                isAdded ? "bg-green-600 hover:bg-green-600" : "bg-primary text-background hover:bg-white"
            }`}
          >
            {isAdded ? (
              <span className="flex items-center gap-2 justify-center w-full"><Check className="w-4 h-4" /> Added</span>
            ) : (
              <span className="flex items-center gap-2 justify-center w-full">Add To Bag</span>
            )}
          </Button>
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
                      Size option
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  This size is currently unavailable. Please try another size or contact us for more information.
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
