import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Package,
  MapPin,
  Plus,
  X,
  Check,
  AlertCircle,
  ArrowRight,
  ShoppingBag,
  Truck,
  Shield,
  Pencil,
  Trash2
} from 'lucide-react';
import { addressApi, orderApi, type Address as ApiAddress } from '../lib/api';
import { load } from '@cashfreepayments/cashfree-js';

// Use Address type from API
type Address = ApiAddress & {
  postalCode?: string; // For backward compatibility, map to pincode
};

interface ValidationIssue {
  variantId: string;
  productName: string;
  variantName: string;
  issue: 'VARIANT_INACTIVE' | 'OUT_OF_STOCK' | 'CART_EMPTY';
  message: string;
  available?: number;
  requested?: number;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user, token, isAuthenticated } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [error, setError] = useState('');

  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (cart.length === 0) {
      navigate('/');
      return;
    }

    fetchAddresses();
  }, [isAuthenticated, cart, navigate]);

  const fetchAddresses = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data.data.addresses);

        const defaultAddr = data.data.addresses.find((a: Address) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const emptyAddressForm = {
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false,
  };

  const resetAddressForm = () => {
    setIsAddingNew(false);
    setEditingAddressId(null);
    setNewAddress(emptyAddressForm);
    setError('');
  };

  const startEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setIsAddingNew(true);
    setError('');
    setNewAddress({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.pincode || addr.postalCode || '',
      isDefault: addr.isDefault,
    });
  };

  const handleSaveAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Transform postalCode to pincode for API
      const addressData = {
        fullName: newAddress.fullName,
        phone: newAddress.phone,
        addressLine1: newAddress.addressLine1,
        addressLine2: newAddress.addressLine2,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.postalCode, // Map postalCode to pincode
        country: 'India',
        isDefault: newAddress.isDefault,
      };

      if (editingAddressId) {
        const updated = await addressApi.update(editingAddressId, addressData);
        setAddresses((prev) => prev.map((a) => (a.id === editingAddressId ? updated : a)));
        setSelectedAddressId(updated.id);
      } else {
        const createdAddress = await addressApi.create(addressData);
        setAddresses((prev) => [...prev, createdAddress]);
        setSelectedAddressId(createdAddress.id);
      }

      resetAddressForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async () => {
    if (!deletingAddress) return;
    setIsDeleting(true);
    setError('');
    try {
      await addressApi.delete(deletingAddress.id);
      setAddresses((prev) => prev.filter((a) => a.id !== deletingAddress.id));
      if (selectedAddressId === deletingAddress.id) {
        setSelectedAddressId('');
      }
      setDeletingAddress(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete address');
    } finally {
      setIsDeleting(false);
    }
  };

  const validateCart = async () => {
    setIsValidating(true);
    setValidationIssues([]);
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/orders/validate-cart`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to validate cart');
      }

      const data = await response.json();

      if (!data.data.valid) {
        setValidationIssues(data.data.issues);
        return false;
      }

      return true;
    } catch (err: any) {
      setError(err.message || 'Cart validation failed');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select a delivery address');
      return;
    }

    const isValid = await validateCart();
    if (!isValid) {
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create order');
      }

      const data = await response.json();
      const { orderNumber, cashfree } = data.data;

      const cashfreeInstance = await load({ mode: 'sandbox' });

      const checkoutOptions = {
        paymentSessionId: cashfree.paymentSessionId,
        redirectTarget: '_modal', // Open in modal popup
      };

      const result = await cashfreeInstance.checkout(checkoutOptions);

      if (result.error) {
        // User closed popup or payment error occurred
        console.error('Payment error:', result.error);
        setError('Payment was cancelled or failed. Please try again.');
        setIsProcessing(false);
        return;
      }

      if (result.paymentDetails) {
        // Payment completed - verify with backend
        try {
          const verificationResult = await orderApi.verifyPayment(orderNumber);

          if (verificationResult.paymentVerified) {
            // Payment verified successfully
            await clearCart();
            navigate(`/orders/${orderNumber}/confirmed`);
          } else {
            // Payment not verified yet - still redirect but show pending status
            setError('Payment verification pending. Please check your order status.');
            await clearCart();
            navigate(`/orders/${orderNumber}/confirmed`);
          }
        } catch (verifyError: any) {
          console.error('Payment verification error:', verifyError);
          // Even if verification fails, redirect to order page
          setError('Payment completed but verification failed. Please check your order status.');
          await clearCart();
          navigate(`/orders/${orderNumber}/confirmed`);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setIsProcessing(false);
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + parseInt(item.price.replace(/[^\d]/g, '')) * item.quantity,
    0
  );

  const shipping: number = 0;
  const tax: number = 0;
  const total = subtotal + shipping + tax;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Loading checkout...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-border flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display uppercase tracking-tighter">
                  Checkout
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Complete your order
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Total</p>
              <p className="text-2xl font-display tracking-tight">₹{total.toLocaleString()}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Validation Issues Alert */}
        <AnimatePresence>
          {validationIssues.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="mb-8 border border-destructive/20 bg-destructive/5 overflow-hidden"
            >
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <h3 className="text-sm uppercase tracking-wider font-display text-destructive">
                    Cart Issues Detected
                  </h3>
                </div>
                <div className="space-y-2 pl-8">
                  {validationIssues.map((issue, i) => (
                    <p key={i} className="text-xs text-destructive/80 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-destructive mt-1.5" />
                      <span>
                        <span className="font-medium">{issue.productName}</span> ({issue.variantName}): {issue.message}
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-[1fr,450px] gap-8 lg:gap-12">
          {/* Left Column - Address Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8"
          >
            {/* Delivery Address Section */}
            <div className="border border-border bg-card">
              <div className="p-6 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border border-border flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg uppercase tracking-wider font-display">
                      Delivery Address
                    </h2>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                      Where should we deliver?
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20"
                    >
                      <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-destructive">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isAddingNew && addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((addr, index) => (
                      <motion.div
                        key={addr.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedAddressId(addr.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedAddressId(addr.id);
                            }
                          }}
                          className={`relative w-full border transition-all duration-200 text-left cursor-pointer ${
                            selectedAddressId === addr.id
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border hover:border-primary/50 bg-secondary/10 hover:bg-secondary/20'
                          }`}
                        >
                          <div className="p-5 space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2.5">
                                  <p className="font-medium text-sm uppercase tracking-wide">{addr.fullName}</p>
                                  {addr.isDefault && (
                                    <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-[9px] uppercase tracking-wider text-primary">
                                      Default
                                    </span>
                                  )}
                                </div>
                              </div>
                              {selectedAddressId === addr.id && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  className="w-7 h-7 bg-primary flex items-center justify-center flex-shrink-0"
                                >
                                  <Check className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
                                </motion.div>
                              )}
                            </div>

                            {/* Address Details */}
                            <div className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                              <p>{addr.addressLine1}</p>
                              {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                              <p>{addr.city}, {addr.state} - {addr.pincode || addr.postalCode}</p>
                              <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/30 mt-2.5">
                                <span className="uppercase tracking-wider text-muted-foreground/70">Phone:</span>
                                <span className="font-medium text-foreground/80">{addr.phone}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 pt-3 border-t border-border/30">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditAddress(addr);
                                }}
                                className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingAddress(addr);
                                }}
                                className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>
                          </div>

                          {/* Selection Indicator */}
                          {selectedAddressId === addr.id && (
                            <motion.div
                              layoutId="addressSelection"
                              className="absolute inset-0 border-2 border-primary pointer-events-none"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : null}

                {isAddingNew ? (
                  <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSaveAddress}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                          Full Name *
                        </Label>
                        <Input
                          id="fullName"
                          value={newAddress.fullName}
                          onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                          className="bg-secondary/50 border-border h-11"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          className="bg-secondary/50 border-border h-11"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressLine1" className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                        Address Line 1 *
                      </Label>
                      <Input
                        id="addressLine1"
                        value={newAddress.addressLine1}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                        className="bg-secondary/50 border-border h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressLine2" className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                        Address Line 2
                      </Label>
                      <Input
                        id="addressLine2"
                        value={newAddress.addressLine2}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                        className="bg-secondary/50 border-border h-11"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                          City *
                        </Label>
                        <Input
                          id="city"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="bg-secondary/50 border-border h-11"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                          State *
                        </Label>
                        <Input
                          id="state"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="bg-secondary/50 border-border h-11"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode" className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                          PIN Code *
                        </Label>
                        <Input
                          id="postalCode"
                          value={newAddress.postalCode}
                          onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                          className="bg-secondary/50 border-border h-11"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border/50">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90 relative overflow-hidden group"
                      >
                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <span className="relative text-xs uppercase tracking-wider">
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                              Saving...
                            </>
                          ) : editingAddressId ? (
                            'Update Address'
                          ) : (
                            'Save Address'
                          )}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetAddressForm}
                        className="h-11 border-border text-xs uppercase tracking-wider"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.form>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingAddressId(null);
                      setNewAddress(emptyAddressForm);
                      setError('');
                      setIsAddingNew(true);
                    }}
                    className="w-full h-11 border-border border-dashed hover:border-primary/50 transition-colors group"
                  >
                    <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                    <span className="text-xs uppercase tracking-wider">Add New Address</span>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Order Summary (Sticky) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-24 h-fit space-y-6"
          >
            {/* Order Summary Card */}
            <div className="border border-border bg-card">
              <div className="p-6 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border border-border flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg uppercase tracking-wider font-display">
                      Order Summary
                    </h2>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                      {cart.length} {cart.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide">
                {cart.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${item.size}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4 group"
                  >
                    <div className="w-20 h-24 bg-secondary/20 border border-border flex-shrink-0 overflow-hidden relative group-hover:border-primary/30 transition-colors">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <h4 className="text-sm font-medium uppercase tracking-wide line-clamp-2">{item.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="uppercase tracking-wider">Size: {item.size}</span>
                        <span>•</span>
                        <span className="uppercase tracking-wider">Qty: {item.quantity}</span>
                      </div>
                      <p className="text-sm font-display text-primary">{item.price}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-6 border-t border-border/50 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground uppercase tracking-wider text-xs">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground uppercase tracking-wider text-xs flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5" />
                      Shipping
                    </span>
                    <span className="font-medium text-primary">{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground uppercase tracking-wider text-xs">Tax</span>
                    <span className="font-medium">₹{tax.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-sm uppercase tracking-wide font-display">Total</span>
                  <span className="text-2xl font-display tracking-tight">₹{total.toLocaleString()}</span>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || isValidating || !selectedAddressId}
                  className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <span className="relative flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-medium">
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : isValidating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        Place Order & Pay
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </Button>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-[9px] text-center text-muted-foreground uppercase tracking-[0.15em]">
                    Secure payment via Cashfree
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border border-border/50 bg-card/50 p-4"
            >
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="space-y-2">
                  <div className="w-8 h-8 mx-auto border border-border flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Secure Payment</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 mx-auto border border-border flex items-center justify-center">
                    <Truck className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Free Shipping</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 mx-auto border border-border flex items-center justify-center">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Safe Delivery</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Delete Address Confirmation Modal */}
      <AnimatePresence>
        {deletingAddress && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setDeletingAddress(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-md border border-border bg-card p-8 space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-destructive/30 bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-display uppercase tracking-wider">Delete Address</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Are you sure you want to delete the address for{' '}
                    <span className="text-foreground font-medium">{deletingAddress.fullName}</span>? This
                    action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeletingAddress(null)}
                  disabled={isDeleting}
                  className="flex-1 h-11 border-border text-xs uppercase tracking-wider"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleDeleteAddress}
                  disabled={isDeleting}
                  className="flex-1 h-11 bg-destructive text-white hover:bg-destructive/90 text-xs uppercase tracking-wider"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
