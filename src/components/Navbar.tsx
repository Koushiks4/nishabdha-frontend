import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Menu, X, Trash2, Plus as PlusIcon, Minus as MinusIcon, ChevronRight, User, LogOut, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { EmailOTPModal } from "./EmailOTPModal";
// Removed static data import - search functionality would use API

const navLinks = [
  { name: "Collections", href: "/shop" },
  { name: "Merchandise", href: "/merchandise" },
  { name: "Creator Kit", href: "/creator-kit" },
  { name: "Studio", href: "/studio" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, totalItems, removeFromCart, updateQuantity, syncWithBackend, isGuest, isSyncing } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredResults = useMemo(() => {
    // Search functionality disabled - would need to fetch from API
    return [];
  }, [searchQuery]);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled ? "bg-background/90 backdrop-blur-md border-b border-border" : "bg-transparent"
        )}
      >
        <div className="max-w-[1800px] mx-auto flex items-center justify-between px-6 md:px-12 py-6">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center"
          >
            <img
              src="/logopng.png"
              alt="Nishabdha"
              className="h-8 md:h-10 w-auto"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-12">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                title={link.name}
                className={cn(
                  "text-[10px] uppercase tracking-[0.3em] hover:text-primary transition-all duration-300 relative group",
                  location.pathname === link.href ? "text-primary" : "text-foreground/60"
                )}
              >
                {link.name}
                <span className={cn(
                  "absolute -bottom-2 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full",
                  location.pathname === link.href && "w-full"
                )} />
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              title="Open Search"
              className="text-foreground/60 hover:text-primary transition-colors"
            >
              <Search className="w-5 h-5 stroke-[1.5px]" />
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-foreground/60 hover:text-primary transition-colors outline-none">
                  <User className="w-5 h-5 stroke-[1.5px]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      {user?.email}
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/account/orders')} className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger
              render={
                <button title="View Shopping Bag" className="text-foreground/60 hover:text-primary transition-colors relative cursor-pointer outline-none">
                  <ShoppingCart className="w-5 h-5 stroke-[1.5px]" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-background text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {totalItems}
                    </span>
                  )}
                </button>
              }
            />
              <SheetContent side="right" className="bg-background border-l border-border p-0 w-[90%] sm:w-[450px] shadow-2xl flex flex-col">
                <SheetHeader className="p-8 border-b border-border">
                  <SheetTitle className="text-xl uppercase tracking-[0.3em] font-display">Shopping Bag</SheetTitle>
                  {isAuthenticated && user?.email && (
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest pt-2">
                      Logged in as: {user.email}
                    </p>
                  )}
                  {isSyncing && (
                    <p className="text-[9px] text-primary uppercase tracking-widest pt-2 animate-pulse">
                      Syncing cart...
                    </p>
                  )}
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                      <ShoppingCart className="w-12 h-12 stroke-[1px]" />
                      <p className="text-[10px] uppercase tracking-[0.4em]">Your bag is empty</p>
                      <SheetTrigger
                        render={
                          <Button variant="ghost" className="text-[10px] uppercase tracking-[0.2em] cursor-pointer">
                            Explore Collections
                          </Button>
                        }
                      />
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={`${item.id}-${item.size}`} className="flex gap-6 group">
                        <div className="w-24 h-32 bg-secondary/10 relative overflow-hidden flex-shrink-0 rounded-sm">
                          <img 
                            src={item.image} 
                            alt={`Shopping Bag Item: ${item.name}`} 
                            className="w-full h-full object-cover" 
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <h4 className="text-[11px] uppercase tracking-wider font-medium">{item.name}</h4>
                              <button 
                                onClick={() => removeFromCart(item.id, item.size)}
                                className="text-muted-foreground hover:text-primary transition-colors p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-none">Size: {item.size}</p>
                            <p className="text-xs font-heading italic text-primary">{item.price}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-white/5 bg-white/[0.03]">
                              <button 
                                onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                                className="p-2 hover:text-primary transition-colors disabled:opacity-30"
                                disabled={item.quantity <= 1}
                              >
                                <MinusIcon className="w-2.5 h-2.5" />
                              </button>
                              <span className="w-8 text-center text-[10px] font-medium">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                className="p-2 hover:text-primary transition-colors"
                              >
                                <PlusIcon className="w-2.5 h-2.5" />
                              </button>
                            </div>
                            <span className="text-[10px] font-heading italic text-muted-foreground">Qty: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-8 bg-secondary/5 border-t border-border space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Subtotal</p>
                        <p className="text-lg font-display uppercase tracking-tight">
                          ₹{cart.reduce((sum, i) => sum + (parseInt(i.price.replace(/[^\d]/g, '')) * i.quantity), 0).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-[8px] text-muted-foreground uppercase tracking-widest text-right leading-none">Shipping & taxes calculated at checkout</p>
                    </div>
                    <SheetClose asChild>
                      <Button
                        onClick={() => {
                          if (isGuest) {
                            setIsCartOpen(false);
                            setIsAuthModalOpen(true);
                          } else {
                            navigate('/checkout');
                          }
                        }}
                        className="w-full py-8 text-[11px] uppercase tracking-[0.4em] rounded-none bg-primary text-background hover:bg-white transition-all duration-500"
                      >
                        Checkout Now
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger
                  render={
                    <button className="text-foreground hover:text-primary transition-colors cursor-pointer p-1 outline-none">
                      <Menu className="w-6 h-6" />
                    </button>
                  }
                />
                <SheetContent side="right" className="bg-background border-l border-border p-0 w-[80%] sm:w-[350px]">
                  <div className="flex flex-col h-full p-10 pt-24">
                    <div className="space-y-8 flex-1">
                      {navLinks.map((link, i) => (
                        <motion.div
                          key={link.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Link
                            to={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "block text-xl uppercase tracking-[0.2em] transition-all duration-300 relative group w-fit",
                              location.pathname === link.href ? "text-primary" : "text-foreground/80 hover:text-primary"
                            )}
                          >
                            {link.name}
                            <span className={cn(
                              "absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all duration-500 group-hover:w-full",
                              location.pathname === link.href && "w-full"
                            )} />
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                    
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="mt-auto pb-12 pt-8 border-t border-white/5 space-y-4"
                    >
                      <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">Inquiries</p>
                      <div className="space-y-1">
                        <p className="text-sm font-heading italic text-primary">info@nishabdha.com</p>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">+91 87625 57954</p>
                      </div>
                    </motion.div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Global Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl flex flex-col items-center pt-[20vh] px-6"
          >
            <div className="w-full max-w-2xl relative">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH NISHABDHA..."
                className="w-full bg-transparent border-b-2 border-white/10 py-6 text-4xl md:text-6xl font-display uppercase tracking-widest outline-none focus:border-primary transition-colors text-center"
              />
              <button 
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
                className="absolute -top-12 right-0 text-muted-foreground hover:text-primary transition-colors p-2"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="w-full max-w-2xl mt-16 space-y-8">
              {filteredResults.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {filteredResults.map((product) => (
                    <Link
                      key={product.id}
                      to={product.type === "merchandise" ? `/merchandise/${(product as any).slug}` : `/product/${product.id}`}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center gap-6 p-4 hover:bg-white/[0.03] transition-colors border border-white/5 group"
                    >
                      <div className="w-16 h-20 bg-secondary/10 flex-shrink-0 overflow-hidden">
                        <img 
                          src={product.images[0]} 
                          alt={`Search result: ${product.name}`} 
                          className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-xl font-display uppercase tracking-tighter">{product.name}</h4>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{product.category} | {product.price}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              ) : searchQuery.trim() !== "" ? (
                <div className="text-center py-20 opacity-30">
                  <p className="text-[10px] uppercase tracking-[0.5em]">No results for "{searchQuery}"</p>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email OTP Modal */}
      <EmailOTPModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={async () => {
          await syncWithBackend();
          navigate('/checkout');
        }}
      />
    </>
  );
}
