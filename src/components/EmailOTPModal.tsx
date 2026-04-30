import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, ArrowRight, Sparkles, ShieldCheck, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '../context/AuthContext';

interface EmailOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EmailOTPModal({ isOpen, onClose, onSuccess }: EmailOTPModalProps) {
  const { login, verifyOTP } = useAuth();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('email');
        setEmail('');
        setOtp('');
        setError('');
        setIsFocused(false);
      }, 300);
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

  const handleSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await verifyOTP(email, otp);
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleResendOTP = async () => {
    setError('');
    setIsLoading(true);

    try {
      await login(email);
      setOtp('');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setStep('email');
    setOtp('');
    setError('');
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
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
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
                      onClick={handleClose}
                      className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center border border-border hover:border-primary/50 transition-colors group"
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
                      {step === 'email' ? (
                        <Mail className="w-5 h-5 text-primary relative z-10" />
                      ) : (
                        <ShieldCheck className="w-5 h-5 text-primary relative z-10" />
                      )}
                      <Sparkles className="w-3 h-3 text-primary/40 absolute top-1 right-1 animate-pulse" />
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="text-2xl font-display uppercase tracking-tighter text-foreground mb-2"
                    >
                      {step === 'email' ? 'Continue to Checkout' : 'Verify Your Email'}
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                      className="text-sm text-muted-foreground"
                    >
                      {step === 'email'
                        ? "We'll send you a code to verify your email"
                        : `Enter the 6-digit code sent to ${email}`}
                    </motion.p>
                  </div>

                  {/* Form Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="p-8"
                  >
                    {step === 'email' ? (
                      <form onSubmit={handleSendOTP} className="space-y-6">
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
                              className="absolute -inset-[1px] bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20"
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
                              disabled={isLoading}
                              className="relative bg-secondary/50 border-border h-12 px-4 text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 transition-colors"
                              autoComplete="email"
                              required
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
                          disabled={isLoading || !email.trim()}
                          className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                          <span className="relative flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-medium">
                            {isLoading ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                                />
                                Sending...
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
                        <p className="text-[10px] text-center text-muted-foreground uppercase tracking-[0.15em] leading-relaxed">
                          Your email is secure. We'll only use it for order updates.
                        </p>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOTP} className="space-y-6">
                        {/* OTP Input */}
                        <div className="space-y-3">
                          <label htmlFor="otp" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Verification Code
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
                              className="absolute -inset-[1px] bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20"
                            />

                            <Input
                              id="otp"
                              type="text"
                              inputMode="numeric"
                              placeholder="00000000"
                              value={otp}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                                setOtp(value);
                                setError('');
                              }}
                              onFocus={() => setIsFocused(true)}
                              onBlur={() => setIsFocused(false)}
                              disabled={isLoading}
                              className="relative bg-secondary/50 border-border h-14 px-4 text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 transition-colors text-center text-2xl tracking-[0.5em] font-display"
                              maxLength={8}
                              required
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

                        {/* Verify Button */}
                        <Button
                          type="submit"
                          disabled={isLoading || otp.length !== 8}
                          className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                          <span className="relative flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-medium">
                            {isLoading ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                                />
                                Verifying...
                              </>
                            ) : (
                              <>
                                Verify & Continue
                                <motion.div
                                  whileHover={{ x: 3 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ShieldCheck className="w-4 h-4" />
                                </motion.div>
                              </>
                            )}
                          </span>
                        </Button>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-2 pt-2">
                          <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={isLoading}
                            className="text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 flex items-center justify-center gap-2 group"
                          >
                            <RotateCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                            Resend Code
                          </button>

                          <button
                            type="button"
                            onClick={handleChangeEmail}
                            disabled={isLoading}
                            className="text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                          >
                            Change Email
                          </button>
                        </div>
                      </form>
                    )}
                  </motion.div>

                  {/* Bottom decorative line */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.7, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent origin-center"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
