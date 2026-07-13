import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import { FramedArt } from "@/components/FramedArt";
import { productApi, settingsApi, type Product, type ShopCategory } from "../lib/api";
import SEO from "@/components/SEO";

const ALL_TAB = "All";

export default function Shop() {
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(ALL_TAB);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load configurable categories from the backend once.
  useEffect(() => {
    settingsApi.getShopCategories().then(setCategories);
  }, []);

  // Tabs shown to the visitor: an implicit "All" plus the configured categories.
  const tabs = [ALL_TAB, ...categories.map((c) => c.label)];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const categoryFilter =
          activeCategory === ALL_TAB
            ? undefined
            : categories.find((c) => c.label === activeCategory)?.category;
        const data = await productApi.getAll({
          type: 'ARTWORK',
          category: categoryFilter,
        });
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory, categories]);

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  return (
    <div className="pt-32 pb-24 bg-background min-h-screen">
      <SEO 
        title="Acoustic Art Collections"
        description="Explore our curated gallery of acoustic frames. Handcrafted sound-absorbing art pieces available in minimal, abstract, and sports collections."
        keywords="acoustic art gallery, sound absorbing wall art, minimal art collection, sports acoustic panels"
      />
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.5em] text-primary">Curated Collections</p>
            <h1 className="text-7xl md:text-9xl font-display uppercase tracking-tighter leading-none">
              The <br /> <span className="text-outline">Gallery</span>
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-x-12 gap-y-6 border-b border-border pb-4 w-full md:w-auto">
            {tabs.map((cat) => (
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

        {loading && (
          <div className="py-48 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="py-48 text-center border border-destructive/50 bg-destructive/5 rounded-lg">
            <p className="text-sm text-destructive mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-[10px] uppercase tracking-[0.3em] text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-px gap-y-12 bg-border border-y border-border">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  className="bg-background p-8 md:p-12 group flex flex-col h-full"
                >
                  <Link to={`/product/${product.id}`} className="flex-1 flex flex-col space-y-12">
                    <div className="flex-1">
                      <FramedArt
                        src={product.images[0]?.url || 'https://picsum.photos/seed/placeholder/800/1000'}
                        alt={`${product.name} - ${product.category}`}
                        aspectRatio="aspect-[4/5]"
                        showControls={false}
                      />
                    </div>
                    <div className="space-y-6">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="text-2xl font-display uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-sm font-medium whitespace-nowrap">{formatPrice(product.basePrice)}</p>
                      </div>
                      <div className="flex justify-between items-center pt-6 border-t border-border">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground leading-none">
                            {product.category.replace('_', ' ')}
                          </p>
                          <p className="text-[8px] uppercase tracking-[0.3em] text-primary/60">
                            {product.stockStatus === 'IN_STOCK' ? 'In Stock' : product.stockStatus === 'PREORDER' ? 'Pre-order' : 'Out of Stock'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                          <span className="text-[9px] uppercase tracking-[0.3em] font-bold">Curate</span>
                          <Plus className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="py-48 text-center border border-border">
                <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground">No works found in this collection.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
