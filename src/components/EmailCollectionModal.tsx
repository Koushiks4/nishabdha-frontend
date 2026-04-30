import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EmailCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
  title?: string;
  subtitle?: string;
}

export function EmailCollectionModal({
  isOpen,
  onClose,
  onSubmit,
  title = 'Continue to Checkout',
  subtitle = "We'll send you a code to verify your email"
}: EmailCollectionModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setError('');
      setIsFocused(false);
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(email);
    } catch (err: any) {
      setError(err.message || 'Failed to submit email');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
                opacity: { duration: 0.3 }
              }}
              className="relative w-full max-w-md pointer-events-auto"
            >
              {/* Decorative gradient glow */}
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-2xl" />

              {/* Main Card */}
              <div className="relative bg-card border border-border overflow-hidden">
                {/* Header */}
                <div className="relative px-8 pt-8 pb-6 border-b border-border/50">
                  {/* Close button */}
                  <motion.button
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-none border border-border hover:border-primary/50 transition-colors group"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.button>

                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.2,
                      duration: 0.6,
                      type: "spring",
                      stiffness: 200,
                      damping: 15
                    }}
                    className="w-12 h-12 mb-6 border border-border flex items-center justify-center relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Mail className="w-5 h-5 text-primary relative z-10" />
                    <Sparkles className="w-3 h-3 text-primary/40 absolute top-1 right-1 animate-pulse" />
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="text-2xl font-display uppercase tracking-tighter text-foreground mb-2"
                  >
                    {title}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="text-sm text-muted-foreground"
                  >
                    {subtitle}
                  </motion.p>
                </div>

                {/* Form */}
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  onSubmit={handleSubmit}
                  className="p-8 space-y-6"
                >
                  {/* Email Input */}
                  <div className="space-y-3">
                    <label htmlFor="email" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Email Address
                    </label>

                    <div className="relative">
                      {/* Animated border effect */}
                      <motion.div
                        initial={false}
                        animate={{
                          opacity: isFocused ? 1 : 0,
                          scale: isFocused ? 1 : 0.98
                        }}
                        transition={{ duration: 0.2 }}
                        className="absolute -inset-[1px] bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-none"
                      />

                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        disabled={isSubmitting}
                        className="relative bg-secondary/50 border-border h-12 px-4 text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 transition-colors"
                        autoComplete="email"
                        autoFocus
                      />
                    </div>

                    {/* Error message */}
                    <AnimatePresence mode="wait">
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                          className="text-xs text-destructive flex items-center gap-1.5"
                        >
                          <span className="w-1 h-1 rounded-full bg-destructive" />
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || !email.trim()}
                    className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    <span className="relative flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-medium">
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          Continue
                          <motion.div
                            whileHover={{ x: 3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        </>
                      )}
                    </span>
                  </Button>

                  {/* Privacy notice */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="text-[10px] text-center text-muted-foreground uppercase tracking-[0.15em] leading-relaxed"
                  >
                    Your email is secure. We'll only use it for order updates.
                  </motion.p>
                </motion.form>

                {/* Bottom decorative line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.7, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent origin-center"
                />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
