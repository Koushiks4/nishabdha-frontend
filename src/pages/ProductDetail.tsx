import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ShoppingCart, Heart, Share2, ChevronRight, Star, Minus, Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { FramedArt } from "@/components/FramedArt";
import { productApi, type Product, type ProductVariant } from "../lib/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { EmailOTPModal } from "../components/EmailOTPModal";
import SEO from "@/components/SEO";
import SchemaOrg from "@/components/SchemaOrg";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isAdded, setIsAdded] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { addToCart, syncWithBackend } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await productApi.getById(id);
        setProduct(data);
        // Auto-select first active variant if available
        if (data.variants && data.variants.length > 0) {
          const firstActive = data.variants.find(v => v.isActive && v.stockQuantity > 0);
          setSelectedVariant(firstActive || data.variants[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error || 'Product not found'}</p>
        <Link to="/shop">
          <Button variant="outline">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    const price = selectedVariant.price || product.basePrice;
    addToCart({
      id: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      price: `₹${price.toLocaleString('en-IN')}`,
      size: selectedVariant.name,
      image: product.images[0]?.url || product.images[0] || 'https://picsum.photos/seed/placeholder/800/1000',
      quantity: quantity
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;

    // Add to cart first
    const price = selectedVariant.price || product.basePrice;
    addToCart({
      id: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      price: `₹${price.toLocaleString('en-IN')}`,
      size: selectedVariant.name,
      image: product.images[0]?.url || product.images[0] || 'https://picsum.photos/seed/placeholder/800/1000',
      quantity: quantity
    });

    // If not authenticated, show OTP modal
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      // Navigate to checkout
      navigate('/checkout');
    }
  };

  const productSchema = {
    "name": product.name,
    "image": product.images,
    "description": product.description,
    "sku": selectedVariant?.sku || `PROD-${product.id}`,
    "brand": {
      "@type": "Brand",
      "name": "Nishabdha"
    },
    "category": product.category.replace('_', ' '),
    "offers": {
      "@type": "Offer",
      "url": `https://nishabdha.com/product/${product.id}`,
      "priceCurrency": "INR",
      "price": (selectedVariant?.price || product.basePrice).toString(),
      "availability": product.stockStatus === 'IN_STOCK'
        ? "https://schema.org/InStock"
        : product.stockStatus === 'PREORDER'
        ? "https://schema.org/PreOrder"
        : "https://schema.org/OutOfStock"
    }
  };

  const currentPrice = selectedVariant?.price || product.basePrice;
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  return (
    <div className="pt-32 pb-24 px-6 bg-background min-h-screen">
      <SEO 
        title={`${product.name} - Acoustic Art Frame`}
        description={`Buy ${product.name} premium acoustic art frame from Nishabdha. Handcrafted minimalist sound-absorbing wall art for modern spaces.`}
        keywords={`${product.name}, acoustic frame, sound absorbing wall art, Nishabdha ${product.category}`}
        image={product.images[0]?.url || 'https://picsum.photos/seed/placeholder/800/1000'}
      />
      <SchemaOrg type="Product" data={productSchema} />
      <div className="max-w-[1200px] mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs uppercase tracking-widest text-muted-foreground mb-12">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row items-start gap-[60px]">
          {/* Gallery */}
          <div className="w-full md:w-[55%] space-y-6 md:space-y-8">
            <div className="w-full h-[60vh] max-h-[520px] bg-[#0a0a0a] p-3 md:p-4 overflow-hidden rounded-none group relative shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
              <FramedArt
                src={product.images[activeImageIndex]?.url || 'https://picsum.photos/seed/placeholder/800/1000'}
                alt={`Premium Acoustic Art Frame - ${product.name} - View ${activeImageIndex + 1}`}
                aspectRatio="h-full w-full"
                orientation="portrait"
              />
            </div>
            {/* Thumbnails - Only show if images array exists */}
            {(product.images && product.images.length > 1) && (
              <div className="flex gap-3 overflow-x-auto lg:overflow-visible pb-4 scrollbar-hide lg:grid lg:grid-cols-6 xl:grid-cols-8 lg:gap-4">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`bg-secondary h-[55px] aspect-square cursor-pointer transition-all overflow-hidden border ${
                      activeImageIndex === i
                        ? 'opacity-100 border-primary scale-105'
                        : 'opacity-60 hover:opacity-100 border-border hover:border-primary'
                    }`}
                  >
                    <img
                      src={img?.url || 'https://picsum.photos/seed/placeholder/100/100'}
                      alt={`${product.name} Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="w-full md:w-[45%] space-y-8 lg:sticky lg:top-40">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="rounded-none uppercase tracking-widest text-[10px] px-3 py-1 border-primary text-primary">
                  Fine Art Print
                </Badge>
                <div className="flex items-center space-x-1 text-primary">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-2 uppercase tracking-widest">(24 Reviews)</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-heading uppercase tracking-widest mb-4">{product.name}</h1>
              <p className="text-2xl font-medium text-primary">{formatPrice(currentPrice)}</p>
            </div>

            <p className="text-muted-foreground font-light leading-relaxed">
              {product.description}
            </p>

            <div className="space-y-4 pt-4">
              <p className="text-sm font-light text-foreground leading-relaxed italic">
                "Crafted using wood wool acoustic boards, each frame is designed not only for visual minimalism but also to subtly absorb sound enhancing the calm of your space."
              </p>
              
              <div className="bg-secondary/30 p-6 border-l border-primary space-y-3">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Acoustic Benefit</p>
                <ul className="text-[10px] uppercase tracking-widest text-muted-foreground space-y-1">
                  <li>• Noise absorbing material</li>
                  <li>• Improves room acoustics</li>
                  <li>• Reduces echo in minimal interiors</li>
                </ul>
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Options */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs uppercase tracking-widest mb-4 font-medium">Select Variant</h4>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={!variant.isActive || variant.stockQuantity === 0}
                        className={`px-6 py-3 text-xs uppercase tracking-widest border transition-all ${
                          selectedVariant?.id === variant.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : variant.isActive && variant.stockQuantity > 0
                            ? "border-border hover:border-primary"
                            : "border-border opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <div className="text-left">
                          <div>{variant.name}</div>
                          {variant.size && <div className="text-[8px] text-muted-foreground mt-1">{variant.size}</div>}
                          {variant.stockQuantity === 0 && (
                            <div className="text-[8px] text-destructive mt-1">Out of Stock</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <div className="flex items-center border border-border h-14 w-full sm:w-auto">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 hover:text-primary transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 hover:text-primary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <Button 
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`flex-1 h-14 rounded-none uppercase tracking-widest text-sm font-bold w-full transition-all duration-500 ${
                  isAdded ? "bg-green-600 hover:bg-green-600 text-white" : "bg-primary text-primary-foreground hover:bg-white"
                }`}
              >
                {isAdded ? (
                  <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Added</span>
                ) : (
                  <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Add to Bag</span>
                )}
              </Button>
            </div>
            <Button
              onClick={handleBuyNow}
              disabled={!selectedVariant || selectedVariant.stockQuantity === 0}
              className="w-full h-14 bg-white text-black hover:bg-primary rounded-none uppercase tracking-widest text-sm font-bold"
            >
              Buy Now
            </Button>

            <Tabs defaultValue="description" className="pt-8">
              <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none p-0 h-auto">
                <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent uppercase tracking-widest text-[10px] px-6 py-4">Description</TabsTrigger>
                <TabsTrigger value="materials" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent uppercase tracking-widest text-[10px] px-6 py-4">Materials</TabsTrigger>
                <TabsTrigger value="shipping" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent uppercase tracking-widest text-[10px] px-6 py-4">Delivery</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="pt-6 text-sm text-muted-foreground font-light leading-relaxed">
                Nishabdha's "{product.name}" is a curated fine art print designed to bring a sense of calm and sophistication to any room. Each print is inspected for color accuracy and detail before being shipped.
              </TabsContent>
              <TabsContent value="materials" className="pt-6 text-sm text-muted-foreground font-light leading-relaxed">
                <ul className="space-y-4">
                  <li className="space-y-1">
                    <p className="text-foreground uppercase tracking-[0.2em] text-[10px] font-medium">Core Material</p>
                    <p>Wood wool acoustic boards | naturally sound-absorbent, sustainable, and rigid.</p>
                  </li>
                  <li className="space-y-1">
                    <p className="text-foreground uppercase tracking-[0.2em] text-[10px] font-medium">Fine Art Print</p>
                    <p>Premium 310gsm Archival Matte Paper with Giclée museum-quality printing.</p>
                  </li>
                  <li className="space-y-1">
                    <p className="text-foreground uppercase tracking-[0.2em] text-[10px] font-medium">Frame & Protection</p>
                    <p>Solid wood frames with shatterproof premium acrylic glass.</p>
                  </li>
                </ul>
              </TabsContent>
              <TabsContent value="shipping" className="pt-6 text-sm text-muted-foreground font-light leading-relaxed">
                Free shipping across India. Orders are processed within 48 hours and typically delivered within 5-7 business days.
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Email OTP Modal */}
      <EmailOTPModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={async () => {
          await syncWithBackend();
          navigate('/checkout');
        }}
      />
    </div>
  );
}
