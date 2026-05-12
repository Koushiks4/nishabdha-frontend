import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const POLICIES: Record<string, { title: string; content: React.ReactNode }> = {
  privacy: {
    title: "Privacy Policy",
    content: (
      <div className="space-y-8">
        <p>
          At <span className="text-white">Nishabd Studio</span>, based in Bengaluru, Karnataka, India, we respect your privacy and are committed to protecting your personal information in accordance with applicable Indian laws.
        </p>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">1. Information We Collect</h4>
          <p>We may collect personal information such as your name, email address, phone number, and any details you provide while placing orders, booking studio sessions, or contacting us.</p>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">2. How We Use Your Information</h4>
          <div className="space-y-3">
            <p>Your information is used to:</p>
            <ul className="space-y-2 pl-4">
              <li className="flex gap-3"><span>•</span> Process orders and studio bookings</li>
              <li className="flex gap-3"><span>•</span> Communicate confirmations, updates, and support</li>
              <li className="flex gap-3"><span>•</span> Improve our services and website experience</li>
              <li className="flex gap-3"><span>•</span> Send important service-related information</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">3. Legal Basis and Compliance</h4>
          <p>We handle personal data in compliance with applicable Indian regulations, including reasonable security practices under the Information Technology Act, 2000.</p>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">4. Data Protection and Security</h4>
          <p>We implement appropriate security measures to protect your personal information from unauthorized access, disclosure, or misuse. However, no method of transmission over the internet is completely secure.</p>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">5. Sharing of Information</h4>
          <p>We do not sell or rent your personal data. Information may be shared only with trusted third-party service providers such as payment gateways, logistics partners, or service providers, strictly for operational purposes.</p>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">6. Cookies and Tracking</h4>
          <p>Our website may use cookies and similar technologies to enhance your browsing experience and understand user behavior.</p>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">7. Third-Party Services</h4>
          <p>We may use third-party services such as payment processors, analytics tools, or hosting providers. These services operate under their own privacy policies.</p>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">8. Your Rights</h4>
          <p>You may request access to, correction of, or deletion of your personal information by contacting us.</p>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">9. Data Retention</h4>
          <p>We retain your information only for as long as necessary to fulfill the purposes outlined in this policy or to comply with legal obligations.</p>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">10. Updates to This Policy</h4>
          <p>We may update this Privacy Policy from time to time. Any changes will be reflected on this page.</p>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">11. Contact Information</h4>
          <div className="space-y-1">
            <p className="text-white">Nishabd Studio</p>
            <p>Bengaluru, Karnataka, India</p>
            <p>Email: <a href="mailto:info@nishabdha.com" className="text-primary hover:underline">info@nishabdha.com</a></p>
          </div>
        </section>
      </div>
    )
  },
  terms: {
    title: "Terms & Conditions",
    content: (
      <div className="space-y-8">
        <p>
          These Terms & Conditions govern your use of the <span className="text-white">Nishabd Studio</span> website and services. By accessing or using our website, you agree to these terms.
        </p>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">1. General</h4>
          <p>Nishabd Studio operates from Bengaluru, Karnataka, India. By using our services, you agree to comply with all applicable laws and regulations.</p>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">2. Products and Services</h4>
          <div className="space-y-3">
            <p>We offer:</p>
            <ul className="space-y-2 pl-4">
              <li className="flex gap-3"><span>•</span> Framed artworks and merchandise</li>
              <li className="flex gap-3"><span>•</span> Creator Kits</li>
              <li className="flex gap-3"><span>•</span> Studio bookings and production services</li>
            </ul>
            <p>All products and services are subject to availability and may be modified or discontinued without prior notice.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">3. Pricing and Payments</h4>
          <ul className="space-y-2 pl-4">
            <li className="flex gap-3"><span>•</span> All prices are listed in INR (₹)</li>
            <li className="flex gap-3"><span>•</span> Prices are subject to change without prior notice</li>
            <li className="flex gap-3"><span>•</span> Payments must be completed at the time of purchase or booking</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">4. Orders and Bookings</h4>
          <ul className="space-y-2 pl-4">
            <li className="flex gap-3"><span>•</span> Orders are confirmed only after successful payment</li>
            <li className="flex gap-3"><span>•</span> Studio bookings are subject to availability</li>
            <li className="flex gap-3"><span>•</span> We reserve the right to refuse or cancel orders if necessary</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">5. Intellectual Property</h4>
          <p>All content on this website, including images, designs, text, and branding, is the property of Nishabd Studio and may not be copied, reproduced, or used without permission.</p>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">6. User Responsibilities</h4>
          <div className="space-y-3">
            <p>You agree not to:</p>
            <ul className="space-y-2 pl-4">
              <li className="flex gap-3"><span>•</span> Misuse the website</li>
              <li className="flex gap-3"><span>•</span> Attempt unauthorized access</li>
              <li className="flex gap-3"><span>•</span> Use the platform for unlawful activities</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">7. Limitation of Liability</h4>
          <div className="space-y-3">
            <p>Nishabd Studio shall not be liable for:</p>
            <ul className="space-y-2 pl-4">
              <li className="flex gap-3"><span>•</span> Any indirect or incidental damages</li>
              <li className="flex gap-3"><span>•</span> Loss arising from misuse of products or services</li>
              <li className="flex gap-3"><span>•</span> Delays caused by third-party providers</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">8. Third-Party Services</h4>
          <p>We may use third-party providers such as payment gateways and logistics partners. We are not responsible for their independent operations.</p>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">9. Modifications</h4>
          <p>We reserve the right to update or modify these Terms at any time. Continued use of the website implies acceptance of updated terms.</p>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">10. Governing Law</h4>
          <p>These Terms shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Bengaluru, Karnataka.</p>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">11. Contact Information</h4>
          <div className="space-y-1">
            <p className="text-white">Nishabd Studio</p>
            <p>Bengaluru, Karnataka, India</p>
            <p>Email: <a href="mailto:info@nishabdha.com" className="text-primary hover:underline">info@nishabdha.com</a></p>
          </div>
        </section>
      </div>
    )
  },
  cancellation: {
    title: "Cancellation Policy",
    content: (
      <div className="space-y-8">
        <p>
          At <span className="text-white">Nishabd Studio</span>, we strive to provide a smooth and transparent experience for all orders and bookings. This Cancellation Policy outlines the conditions under which cancellations are accepted.
        </p>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">1. Product Orders (Frames, Merchandise, Creator Kit)</h4>
          <ul className="space-y-2 pl-4">
            <li className="flex gap-3"><span>•</span> Orders can be cancelled within 24 hours of purchase.</li>
            <li className="flex gap-3"><span>•</span> Once an order is processed or production has begun, cancellations are not permitted.</li>
            <li className="flex gap-3"><span>•</span> Custom or made-to-order items cannot be cancelled once confirmed.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">2. Studio Bookings</h4>
          <ul className="space-y-2 pl-4">
            <li className="flex gap-3"><span>•</span> Studio bookings may be cancelled up to 24 hours before the scheduled session.</li>
            <li className="flex gap-3"><span>•</span> Cancellations made within 24 hours of the booking time may not be eligible for refund or rescheduling.</li>
            <li className="flex gap-3"><span>•</span> In case of unavoidable circumstances, rescheduling may be considered at our discretion.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">3. Refund Eligibility</h4>
          <ul className="space-y-2 pl-4">
            <li className="flex gap-3"><span>•</span> Approved cancellations will be processed as per our Refund Policy.</li>
            <li className="flex gap-3"><span>•</span> Refund timelines may vary depending on the payment method.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">4. Cancellation Process</h4>
          <div className="space-y-3">
            <p>To request a cancellation, please contact us with your order or booking details:</p>
            <div className="space-y-1">
              <p className="text-white">Nishabd Studio</p>
              <p>Bengaluru, Karnataka, India</p>
              <p>Email: <a href="mailto:info@nishabdha.com" className="text-primary hover:underline">info@nishabdha.com</a></p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">5. Exceptions</h4>
          <p>Nishabd Studio reserves the right to refuse cancellation requests that do not meet the above conditions.</p>
        </section>
      </div>
    )
  },
  refund: {
    title: "Refund Policy",
    content: (
      <div className="space-y-8">
        <p>
          At <span className="text-white">Nishabd Studio</span>, we maintain a strict quality standard across all our products and services. This Refund Policy outlines the conditions under which refunds may be issued.
        </p>
        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">1. Product Orders (Frames, Merchandise, Creator Kit)</h4>
          <ul className="space-y-2 pl-4">
            <li className="flex gap-3"><span>•</span> All products are carefully inspected before dispatch.</li>
            <li className="flex gap-3"><span>•</span> Refunds are not applicable for custom or made-to-order items.</li>
            <li className="flex gap-3 text-white/90"><span>•</span> Refunds will only be considered in the following cases:</li>
            <li className="pl-6 space-y-1">
              <p className="text-[11px] uppercase tracking-wider">• Product received is damaged</p>
              <p className="text-[11px] uppercase tracking-wider">• Incorrect item delivered</p>
            </li>
            <li className="flex gap-3"><span>•</span> Any such issue must be reported within 48 hours of delivery with clear photographic evidence.</li>
          </ul>
        </section>
        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">2. Studio Bookings</h4>
          <ul className="space-y-2 pl-4">
            <li className="flex gap-3"><span>•</span> Refunds for studio bookings are subject to the Cancellation Policy.</li>
            <li className="flex gap-3"><span>•</span> Eligible cancellations (made within the allowed timeframe) may be refunded.</li>
            <li className="flex gap-3"><span>•</span> No refunds will be issued for no-shows or last-minute cancellations.</li>
          </ul>
        </section>
        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">3. Refund Process</h4>
          <ul className="space-y-2 pl-4">
            <li className="flex gap-3"><span>•</span> Once approved, refunds will be processed to the original payment method.</li>
            <li className="flex gap-3"><span>•</span> Processing time may take 5–10 business days depending on the payment provider.</li>
          </ul>
        </section>
        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">4. Non-Refundable Cases</h4>
          <div className="space-y-3">
            <p>Refunds will not be provided in the following cases:</p>
            <ul className="space-y-2 pl-4">
              <li className="flex gap-3"><span>•</span> Change of mind after purchase</li>
              <li className="flex gap-3"><span>•</span> Delay caused by external logistics partners</li>
              <li className="flex gap-3"><span>•</span> Minor variations in product appearance (color, texture, finish)</li>
            </ul>
          </div>
        </section>
        <section className="space-y-4">
          <h4 className="text-white font-medium uppercase tracking-widest text-xs">5. Contact for Refund Requests</h4>
          <div className="space-y-3">
            <p>To initiate a refund request, contact:</p>
            <div className="space-y-1">
              <p className="text-white">Nishabd Studio</p>
              <p>Bengaluru, Karnataka, India</p>
              <p>Email: <a href="mailto:info@nishabdha.com" className="text-primary hover:underline">info@nishabdha.com</a></p>
            </div>
          </div>
        </section>
      </div>
    )
  }
};

export default function Footer() {
  const [activePolicy, setActivePolicy] = useState<keyof typeof POLICIES | null>(null);

  const closePolicy = useCallback(() => setActivePolicy(null), []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePolicy();
    };

    if (activePolicy) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [activePolicy, closePolicy]);

  return (
    <footer className="bg-background border-t border-border py-20 px-6">
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
        {/* Column 1: NISHABDHA */}
        <div className="space-y-6 lg:col-span-1">
          <Link to="/" className="block">
            <img
              src="/logopng.png"
              alt="Nishabdha Logo"
              className="h-12 w-auto brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
            />
          </Link>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
            Where silence becomes art. Premium wall art, acoustic solutions, and studio spaces for modern creators.
          </p>
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-relaxed">
              6, 4th Main Road, Arehalli, Uttarahalli Hobli,<br />
              Bengaluru, KA 560061
            </p>
            <a href="mailto:info@nishabdha.com" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors block">
              info@nishabdha.com
            </a>
            <a href="tel:+918762557954" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors block">
              +91 87625 57954
            </a>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Column 2: SHOP */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.3em] mb-8 font-semibold text-foreground/90">Shop</h4>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li><Link to="/shop" title="Browse all acoustic art collections" className="hover:text-primary transition-colors">Collections</Link></li>
            <li><Link to="/merchandise" title="Shop Premium Merchandise" className="hover:text-primary transition-colors">Merchandise</Link></li>
            <li><Link to="/creator-kit" title="Shop Creator Acoustic Kits" className="hover:text-primary transition-colors">Creator Kit</Link></li>
          </ul>
        </div>

        {/* Column 3: STUDIO */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.3em] mb-8 font-semibold text-foreground/90">Studio</h4>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li><Link to="/studio" title="Book our creative studio spaces" className="hover:text-primary transition-colors">Book a Session</Link></li>
            <li><Link to="/studio#podcast" title="Book Podcast Room" className="hover:text-primary transition-colors">Podcast Room</Link></li>
            <li><Link to="/studio#photoshoot" title="Book Photoshoot Area" className="hover:text-primary transition-colors">Photoshoot Room</Link></li>
            <li><Link to="/studio#green-screen" title="Book Green Screen Facility" className="hover:text-primary transition-colors">Green Screen Studio</Link></li>
          </ul>
        </div>

        {/* Column 4: POLICIES */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.3em] mb-8 font-semibold text-foreground/90">Policies</h4>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li><button onClick={() => setActivePolicy("privacy")} className="hover:text-primary transition-colors cursor-pointer text-left">Privacy Policy</button></li>
            <li><button onClick={() => setActivePolicy("terms")} className="hover:text-primary transition-colors cursor-pointer text-left">Terms & Conditions</button></li>
            <li><button onClick={() => setActivePolicy("cancellation")} className="hover:text-primary transition-colors cursor-pointer text-left">Cancellation Policy</button></li>
            <li><button onClick={() => setActivePolicy("refund")} className="hover:text-primary transition-colors cursor-pointer text-left">Refund Policy</button></li>
          </ul>
        </div>

        {/* Column 5: NEWSLETTER */}
        <div className="lg:col-span-1">
          <h4 className="text-xs uppercase tracking-[0.3em] mb-8 font-semibold text-foreground/90">Newsletter</h4>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Join our inner circle for exclusive drops and studio updates.
          </p>
          <form
            className="flex space-x-2"
            action="https://api.staticforms.xyz/submit"
            method="POST"
          >
            <input type="hidden" name="accessKey" value={process.env.STATIC_FORMS_KEY} />
            <input type="hidden" name="subject" value="Nishabdha Newsletter Subscription" />
            <input type="hidden" name="replyTo" value="@" />
            <input type="hidden" name="redirectTo" value={window.location.href} />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              className="bg-secondary/30 border border-border/50 px-4 py-2 text-sm w-full focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/50"
            />
            <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 text-xs uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-all duration-300">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto mt-20 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
        <div className="flex items-center gap-4">
          <img
            src="/logopng.png"
            alt="Nishabdha"
            className="h-6 w-auto brightness-0 invert opacity-60"
          />
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
            © 2026 Nishabdha. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] text-muted-foreground tracking-[0.2em]">
          <button onClick={() => setActivePolicy("privacy")} className="hover:text-primary transition-colors cursor-pointer">Privacy</button>
          <span className="opacity-20 hidden md:inline">|</span>
          <button onClick={() => setActivePolicy("terms")} className="hover:text-primary transition-colors cursor-pointer">Terms</button>
          <span className="opacity-20 hidden md:inline">|</span>
          <button onClick={() => setActivePolicy("cancellation")} className="hover:text-primary transition-colors cursor-pointer">Cancellation</button>
          <span className="opacity-20 hidden md:inline">|</span>
          <button onClick={() => setActivePolicy("refund")} className="hover:text-primary transition-colors cursor-pointer">Refund</button>
          <span className="opacity-20 hidden md:inline">|</span>
          <Link to="/philosophy" className="hover:text-primary transition-colors cursor-pointer">Philosophy</Link>
          <span className="opacity-20 hidden md:inline">|</span>
          <Link to="/silence" className="hover:text-primary transition-colors cursor-pointer">Silence</Link>
        </div>
      </div>

      {/* Policy Modals */}
      <AnimatePresence>
        {activePolicy && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePolicy}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm cursor-pointer"
              onWheel={(e) => e.stopPropagation()}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[800px] bg-[#0B0B0B] border border-white/10 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="policy-title"
            >
              <div className="flex items-center justify-between p-8 border-b border-white/5">
                <h3 id="policy-title" className="text-2xl font-display uppercase tracking-tighter">
                  {POLICIES[activePolicy].title}
                </h3>
                <button 
                  onClick={closePolicy}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors group cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              </div>
              <div className="p-10 md:p-12 overflow-y-auto overscroll-contain text-muted-foreground/80 text-sm md:text-base leading-relaxed">
                {POLICIES[activePolicy].content}
                {/* Visual filler for high-end look */}
                <div className="pt-24 opacity-10">
                  <div className="h-[1px] bg-white w-full" />
                </div>
              </div>
              <div className="h-4 bg-[#0B0B0B]" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
