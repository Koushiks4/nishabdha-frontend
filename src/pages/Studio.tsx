import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SEO from "@/components/SEO";
import { studioBookingApi } from "../lib/api";
import {
  MessageCircle,
  Calendar,
  Camera,
  Mic,
  Layout,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  Cpu,
  Video,
  Check,
  Smartphone,
  Globe,
  Settings,
  Shield,
  Lightbulb,
  User,
  Phone,
  Mail,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DateTimePicker } from "@/components/ui/date-time-picker";

const studioSpaces = [
  {
    id: "podcast",
    title: "Podcast Studio",
    description: "Acoustically treated space with professional-grade microphones and multi-camera setup for high-fidelity audio and video recording.",
    features: ["Professional Mics", "Multi-cam setup", "Studio Lighting"],
    image: "https://picsum.photos/seed/studio-podcast/1200/800?grayscale",
    icon: Mic,
  },
  {
    id: "green-screen",
    title: "Green Screen Studio",
    description: "Full-height cyclorama green screen with uniform lighting, perfect for high-end VFX, virtual backgrounds, and commercial shoots.",
    features: ["Cyclorama Wall", "VFX Ready", "Uniform Lighting"],
    image: "https://picsum.photos/seed/studio-vfx/1200/800?grayscale",
    icon: Layout,
  },
  {
    id: "photoshoot",
    title: "Photoshoot Room",
    description: "Versatile space with multiple backdrops, professional lighting rigs, and ample natural light for fashion, product, and portrait photography.",
    features: ["Multiple Backdrops", "Natural Light", "Lighting Rigs"],
    image: "https://picsum.photos/seed/studio-photo/1200/800?grayscale",
    icon: Camera,
  },
];

const productionPackages = [
  {
    title: "Basic",
    description: "3 hr shoot, clean background replacement, basic edit.",
    price: "₹15,000",
  },
  {
    title: "Pro",
    description: "Advanced compositing, motion graphics, sound design.",
    price: "₹35,000",
  },
  {
    title: "Ad / Explainer",
    description: "Concept, script, full compositing, final edit.",
    price: "₹75,000+",
  },
];

const podcastPackages = [
  { title: "Basic Episode", details: "Audio Only Recording + Edit" },
  { title: "Pro Episode", details: "Multi-cam Video + Audio Edit" },
  { title: "Premium Episode", details: "Visual Podcasts with Reels" },
  { title: "4 Episode Bundle", details: "Monthly Consistency Plan" },
];

export default function Studio() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isTechSpecsOpen, setIsTechSpecsOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookedSpace, setBookedSpace] = useState("Studio Space");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Booking dialog form
  const [bookingSpace, setBookingSpace] = useState("Podcast Studio");
  const [bookingDuration, setBookingDuration] = useState("1 Hour");
  const [bookingDateTime, setBookingDateTime] = useState<Date | null>(null);
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingDay, setBookingDay] = useState<Date | null>(null);
  const [bookingBookedTimes, setBookingBookedTimes] = useState<string[]>([]);

  // Footer enquiry form
  const [enquiryService, setEnquiryService] = useState("Podcast Studio");
  const [enquiryDateTime, setEnquiryDateTime] = useState<Date | null>(null);
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryEmail, setEnquiryEmail] = useState("");
  const [enquiryDay, setEnquiryDay] = useState<Date | null>(null);
  const [enquiryBookedTimes, setEnquiryBookedTimes] = useState<string[]>([]);

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsTechSpecsOpen(false);
    };

    if (isTechSpecsOpen) {
      document.body.style.overflow = 'hidden';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isTechSpecsOpen]);

  const formatTime = (d: Date) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  // Local calendar day as YYYY-MM-DD (no timezone drift)
  const toDateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // Fetch booked slots for the booking dialog whenever space/day changes
  const bookingDayKey = bookingDay ? toDateKey(bookingDay) : null;
  useEffect(() => {
    if (!bookingDayKey) {
      setBookingBookedTimes([]);
      return;
    }
    let active = true;
    studioBookingApi
      .getAvailability(bookingSpace, bookingDayKey)
      .then((times) => active && setBookingBookedTimes(times));
    return () => {
      active = false;
    };
  }, [bookingSpace, bookingDayKey]);

  // Fetch booked slots for the footer enquiry form whenever space/day changes
  const enquiryDayKey = enquiryDay ? toDateKey(enquiryDay) : null;
  useEffect(() => {
    if (!enquiryDayKey) {
      setEnquiryBookedTimes([]);
      return;
    }
    let active = true;
    studioBookingApi
      .getAvailability(enquiryService, enquiryDayKey)
      .then((times) => active && setEnquiryBookedTimes(times));
    return () => {
      active = false;
    };
  }, [enquiryService, enquiryDayKey]);

  const submitBooking = async (
    payload: {
      studioType: string;
      duration: string;
      fullName: string;
      phone: string;
      email: string;
      dateTime: Date | null;
    }
  ) => {
    if (!payload.dateTime) {
      setSubmitError("Please select a date and time.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await studioBookingApi.create({
        studioType: payload.studioType,
        duration: payload.duration,
        preferredDate: toDateKey(payload.dateTime),
        preferredTime: formatTime(payload.dateTime),
        fullName: payload.fullName,
        phone: payload.phone,
        email: payload.email,
      });
      setIsBookingOpen(false);
      setBookedSpace(payload.studioType);
      setBookingSuccess(true);
      // Reset both forms
      setBookingName("");
      setBookingPhone("");
      setBookingEmail("");
      setBookingDateTime(null);
      setBookingDay(null);
      setEnquiryName("");
      setEnquiryPhone("");
      setEnquiryEmail("");
      setEnquiryDateTime(null);
      setEnquiryDay(null);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit booking. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitBooking({
      studioType: bookingSpace,
      duration: bookingDuration,
      fullName: bookingName,
      phone: bookingPhone,
      email: bookingEmail,
      dateTime: bookingDateTime,
    });
  };

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitBooking({
      studioType: enquiryService,
      duration: "Flexible",
      fullName: enquiryName,
      phone: enquiryPhone,
      email: enquiryEmail,
      dateTime: enquiryDateTime,
    });
  };

  return (
    <div className="bg-background text-foreground selection:bg-primary/30">
      <SEO
        title="Creative Studio & Podcast Facility"
        description="Book Nishabdha's professional creative studio in Bangalore. High-fidelity audio recording, green screen facilities, and cinematic photography spaces."
        keywords="podcast studio Bangalore, green screen studio, photoshoot space, audio recording studio, creative atelier"
      />
      {/* Studio Hero */}
      <section className="relative h-screen flex flex-col justify-center px-6 md:px-12 overflow-hidden border-b border-border">
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/studio-vision/1920/1080?grayscale"
            alt="Nishabdha Professional Creative Studio Sanctuary Hero"
            className="w-full h-full object-cover opacity-30"
            loading="eager"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1800px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            <p className="text-[10px] uppercase tracking-[0.5em] text-primary">Creative Sanctuary</p>
            <h1 className="text-7xl md:text-[15vw] font-display uppercase tracking-tighter leading-[0.8]">
              The <br /> <span className="text-outline">Atelier</span>
            </h1>
            <p className="max-w-xl text-lg md:text-xl font-light text-muted-foreground leading-relaxed">
              A professional ecosystem designed for the modern creator. From high-fidelity audio to cinematic visual production.
            </p>
            <div className="pt-12">
              <Dialog open={isBookingOpen} onOpenChange={(o) => { setIsBookingOpen(o); if (o) setSubmitError(null); }}>
                <DialogTrigger
                  render={
                    <button className="rounded-none px-12 py-8 uppercase tracking-[0.3em] text-xs bg-primary text-background hover:bg-white transition-all duration-500 cursor-pointer">
                      Book A Session
                    </button>
                  }
                />
                <DialogContent className="sm:max-w-[500px] bg-background border-border p-0 overflow-hidden">
                  <div className="p-8 space-y-8">
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-display uppercase tracking-tighter">Reserve Your Session</DialogTitle>
                      <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">FACILITATING GLOBAL CREATIVES</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleDialogSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Space</label>
                            <select
                              value={bookingSpace}
                              onChange={(e) => setBookingSpace(e.target.value)}
                              className="flex h-10 w-full bg-secondary/50 border-none px-3 py-2 text-sm outline-none cursor-pointer"
                            >
                              <option>Podcast Studio</option>
                              <option>Green Screen</option>
                              <option>Photoshoot Room</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Duration</label>
                            <select
                              value={bookingDuration}
                              onChange={(e) => setBookingDuration(e.target.value)}
                              className="flex h-10 w-full bg-secondary/50 border-none px-3 py-2 text-sm outline-none cursor-pointer"
                            >
                              <option>1 Hour</option>
                              <option>2 Hours</option>
                              <option>4 Hours</option>
                              <option>Full Day</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Date &amp; Time</label>
                          <div className="bg-secondary/50 px-3 py-2.5">
                            <DateTimePicker
                              value={bookingDateTime}
                              onChange={setBookingDateTime}
                              onSelectedDayChange={setBookingDay}
                              bookedTimes={bookingBookedTimes}
                              name="datetime"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Full Name</label>
                          <Input
                            value={bookingName}
                            onChange={(e) => setBookingName(e.target.value)}
                            placeholder="Enter your name"
                            className="bg-secondary/50 border-none rounded-none"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Phone</label>
                            <Input
                              type="tel"
                              inputMode="numeric"
                              pattern="[0-9]{10}"
                              maxLength={10}
                              minLength={10}
                              title="Enter a 10-digit phone number"
                              value={bookingPhone}
                              onChange={(e) => setBookingPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                              placeholder="10-digit number"
                              className="bg-secondary/50 border-none rounded-none"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Email</label>
                            <Input
                              type="email"
                              value={bookingEmail}
                              onChange={(e) => setBookingEmail(e.target.value)}
                              placeholder="Email"
                              className="bg-secondary/50 border-none rounded-none"
                              required
                            />
                          </div>
                        </div>
                        {submitError && (
                          <p className="text-xs text-red-400 tracking-wide">{submitError}</p>
                        )}
                        <Button type="submit" disabled={submitting} className="w-full rounded-none py-8 bg-primary text-background hover:bg-white transition-all duration-500 uppercase tracking-[0.4em] text-xs font-bold disabled:opacity-50">
                          {submitting ? "Submitting..." : "Confirm Booking"}
                        </Button>
                      </form>
                  </div>

                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        </div>

        {/* Vertical Grid Lines */}
        <div className="absolute inset-0 pointer-events-none flex justify-between px-6 md:px-12 opacity-10">
          <div className="w-[1px] h-full bg-white" />
          <div className="hidden md:block w-[1px] h-full bg-white" />
          <div className="w-[1px] h-full bg-white" />
        </div>
      </section>

      {/* Studio Spaces */}
      <section className="py-24 md:py-48 px-6 md:px-12 border-b border-border">
        <div className="max-w-[1800px] mx-auto space-y-48">
          {studioSpaces.map((space, i) => (
            <motion.div
              key={space.id}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-24 items-center`}
            >
              <div className="flex-1 w-full">
                <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                  <img
                    src={space.image}
                    alt={space.title}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-0 left-0 p-8">
                    <span className="text-8xl font-display text-white/10">0{i + 1}</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-[1px] bg-primary" />
                  <p className="text-[10px] uppercase tracking-[0.5em] text-primary">Space 0{i + 1}</p>
                </div>
                <h2 className="text-6xl md:text-8xl font-display uppercase tracking-tighter leading-none">
                  {space.title}
                </h2>
                <p className="text-xl font-light text-muted-foreground leading-relaxed">
                  {space.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  {space.features.map((feature) => (
                    <span key={feature} className="text-[9px] uppercase tracking-widest border border-border px-3 py-1 text-muted-foreground">{feature}</span>
                  ))}
                </div>
                <div className="pt-6 flex gap-8 items-center">
                  <Button
                    onClick={() => setIsBookingOpen(true)}
                    variant="link"
                    className="p-0 h-auto text-xs uppercase tracking-[0.3em] text-primary hover:text-white transition-colors"
                  >
                    Book Now
                  </Button>

                  <button
                    onClick={() => setIsTechSpecsOpen(true)}
                    className="flex items-center gap-4 group cursor-pointer outline-none bg-transparent border-none"
                  >
                    <span className="text-xs uppercase tracking-[0.3em] group-hover:text-primary transition-colors">Technical Specs</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Technical Specs Modal Overlay */}
      <AnimatePresence>
        {isTechSpecsOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTechSpecsOpen(false)}
              className="absolute inset-0 bg-background/85 backdrop-blur-md cursor-pointer"
              onWheel={(e) => e.stopPropagation()}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[1000px] max-h-[85vh] bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-y-auto z-[10001] overscroll-contain"
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsTechSpecsOpen(false)}
                className="absolute top-8 right-8 text-muted-foreground hover:text-primary transition-colors z-[10002]"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="p-10 md:p-16 space-y-16">
                <header className="space-y-4">
                  <p className="text-[10px] uppercase tracking-[0.5em] text-primary">Technical Precision</p>
                  <h2 className="text-4xl md:text-6xl font-display uppercase tracking-tighter leading-none">Technical <br /> <span className="text-outline">Specifications</span></h2>
                  <div className="w-24 h-[1px] bg-primary" />
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                  <div className="space-y-6">
                    <h4 className="text-sm uppercase tracking-[0.3em] text-primary border-b border-white/5 pb-4">Podcast Room</h4>
                    <ul className="space-y-3 text-[11px] font-light text-muted-foreground uppercase tracking-[0.2em] leading-relaxed">
                      <li>• Professional mics (Scarlett / Syskonic)</li>
                      <li>• Multi-cam setup (Sony A7M4 / ZV-E10 II)</li>
                      <li>• Studio lighting / Simpex RGB</li>
                      <li>• Raw footage included</li>
                    </ul>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-sm uppercase tracking-[0.3em] text-primary border-b border-white/5 pb-4">Photoshoot Area</h4>
                    <ul className="space-y-3 text-[11px] font-light text-muted-foreground uppercase tracking-[0.2em] leading-relaxed">
                      <li>• Professional Lighting Rigs (500W Dim)</li>
                      <li>• Clean architectural backdrops</li>
                      <li>• Multiple textures available</li>
                    </ul>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-sm uppercase tracking-[0.3em] text-primary border-b border-white/5 pb-4">Green Screen Studio</h4>
                    <ul className="space-y-3 text-[11px] font-light text-muted-foreground uppercase tracking-[0.2em] leading-relaxed">
                      <li>• Full green cyclorama</li>
                      <li>• 3-4 light cinematic setup</li>
                      <li>• Sound treatment</li>
                      <li>• AC + power backup</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-10">
                  <h4 className="text-[10px] uppercase tracking-[0.4em] text-primary font-medium">In-House Inventory</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-[10px] text-muted-foreground font-light uppercase tracking-widest leading-loose">
                    <div className="space-y-2">
                      <p className="text-white font-medium mb-2">Visuals</p>
                      <p>Sony Alpha 7M4</p>
                      <p>Sony ZV-E10 II</p>
                      <p>DJI Air 3S Drone</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-white font-medium mb-2">Audio</p>
                      <p>Scarlett Dynamic</p>
                      <p>Syskonic Podcast (2)</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-white font-medium mb-2">Light</p>
                      <p>Simpex M-400 RGB</p>
                      <p>Pramatt 500W (2)</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-white font-medium mb-2">Support</p>
                      <p>DJI RS4 Gimbal</p>
                      <p>Pro Tripod Systems</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setIsTechSpecsOpen(false);
                    setIsBookingOpen(true);
                  }}
                  className="w-full h-16 rounded-none bg-primary text-background hover:bg-white transition-all duration-500 uppercase tracking-[0.4em] text-xs font-bold"
                >
                  Reserve This Setup
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Success Modal */}
      <Dialog open={bookingSuccess} onOpenChange={setBookingSuccess}>
        <DialogContent className="sm:max-w-[460px] bg-background border-border p-0 overflow-hidden">
          <div className="p-10 md:p-12 text-center space-y-8">
            <div className="mx-auto w-16 h-16 rounded-full border border-primary/40 flex items-center justify-center">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-3xl md:text-4xl font-display uppercase tracking-tighter leading-none">
                Space Booked
              </DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {bookedSpace} · Reservation Confirmed
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              Your studio space is booked. Our technical director will reach out shortly to confirm the finer details of your session.
            </p>
            <Button
              onClick={() => setBookingSuccess(false)}
              className="w-full rounded-none py-8 bg-primary text-background hover:bg-white transition-all duration-500 uppercase tracking-[0.4em] text-xs font-bold"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Production Packages */}
      <section className="py-24 md:py-48 px-6 md:px-12 bg-secondary/5 border-b border-border">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-24">
          <div className="lg:col-span-4 space-y-8">
            <p className="text-[10px] uppercase tracking-[0.5em] text-primary">Service Models</p>
            <h2 className="text-5xl md:text-7xl font-display uppercase tracking-tighter leading-none">
              Production <br /> <span className="text-outline">Packages</span>
            </h2>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {productionPackages.map((pkg) => (
              <div key={pkg.title} className="p-10 border border-white/5 bg-background flex flex-col justify-between group hover:border-primary transition-all duration-500">
                <div className="space-y-6">
                  <h3 className="text-2xl font-display uppercase tracking-tight">{pkg.title}</h3>
                  <p className="text-sm font-light text-muted-foreground leading-relaxed">{pkg.description}</p>
                </div>
                <div className="pt-12 text-right">
                  <p className="text-xl font-heading italic text-primary">{pkg.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Podcast Packages */}
      <section className="py-24 md:py-48 px-6 md:px-12 border-b border-border">
        <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row gap-24">
          <div className="flex-1 space-y-8">
            <p className="text-[10px] uppercase tracking-[0.5em] text-primary">Content Creation</p>
            <h2 className="text-5xl md:text-7xl font-display uppercase tracking-tighter leading-none">
              Podcast <br /> <span className="text-outline">Tiers</span>
            </h2>
            <p className="max-w-md text-lg font-light text-muted-foreground leading-relaxed">
              Standardized production workflows for modern distribution. From single episodes to dedicated series runs.
            </p>
          </div>
          <div className="flex-[2] grid grid-cols-1 sm:grid-cols-2 gap-px bg-border border border-border">
            {podcastPackages.map((pkg) => (
              <div key={pkg.title} className="bg-background p-12 hover:bg-secondary/10 transition-colors">
                <h4 className="text-xl font-display uppercase tracking-tight mb-4">{pkg.title}</h4>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-8">{pkg.details}</p>
                <div className="flex items-center gap-2 text-primary cursor-pointer border-t border-white/5 pt-6 group">
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold">Select Tier</span>
                  <Plus className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* In-house Production Grid */}
      <section className="py-24 md:py-48 px-6 md:px-12 border-b border-border bg-black/20 overflow-hidden">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-24">
          <div className="space-y-16">
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary">In-house</p>
              <h2 className="text-5xl md:text-8xl font-display uppercase tracking-tighter">Photography</h2>
            </div>
            <div className="space-y-8">
              {[
                "Basic Shoot",
                "Portfolio Shoot",
                "Product Shoot",
                "Event Photography"
              ].map((service) => (
                <div key={service} className="flex justify-between items-center group cursor-pointer">
                  <span className="text-2xl font-display uppercase tracking-tight group-hover:text-primary transition-colors">{service}</span>
                  <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-4 transition-all" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-16">
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary">Motion</p>
              <h2 className="text-5xl md:text-8xl font-display uppercase tracking-tighter">Videography</h2>
            </div>
            <div className="space-y-8">
              {[
                "Ad Film Production",
                "Corporate Film",
                "Music Video",
                "Documentary / Short Film"
              ].map((service) => (
                <div key={service} className="flex justify-between items-center group cursor-pointer">
                  <span className="text-2xl font-display uppercase tracking-tight group-hover:text-primary transition-colors">{service}</span>
                  <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Creative Direction Section */}
      <section className="py-24 md:py-48 px-6 md:px-12">
        <div className="max-w-[1800px] mx-auto text-center space-y-16">
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.5em] text-primary">Strategic Execution</p>
            <h2 className="text-6xl md:text-[10vw] font-display uppercase tracking-tighter leading-none">
              Creative <span className="text-outline">Direction</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             {[
               { title: "Concept Development", icon: Lightbulb },
               { title: "Visual Strategy", icon: Settings },
               { title: "Campaign Planning", icon: Calendar }
             ].map((item) => (
               <div key={item.title} className="p-12 border border-white/5 space-y-8 flex flex-col items-center group hover:bg-primary/5 transition-colors">
                 <item.icon className="w-10 h-10 text-primary mb-2" />
                 <h3 className="text-2xl font-display uppercase tracking-tight">{item.title}</h3>
                 <div className="w-8 h-[1px] bg-primary group-hover:w-24 transition-all duration-700" />
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Booking Form Footer */}
      <section className="py-24 md:py-48 px-6 md:px-12 border-t border-border bg-secondary/5">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-24">
          <div className="md:col-span-5 space-y-12">
            <h2 className="text-6xl md:text-8xl font-display uppercase tracking-tighter leading-none">
              Reserve <br /> <span className="text-outline">Space</span>
            </h2>
            <div className="space-y-6">
              <p className="text-lg font-light text-muted-foreground leading-relaxed">
                Our studio operates on a curated booking basis. Tell us about your project, and our technical director will reach out to facilitate your requirements.
              </p>
              <div className="pt-8 space-y-4">
                <div className="flex items-center gap-6">
                   <Calendar className="w-5 h-5 text-primary" />
                   <span className="text-xs uppercase tracking-[0.3em]">Mon - Sat: 10:00 - 19:00</span>
                </div>
                <div className="flex items-center gap-6">
                   <MessageCircle className="w-5 h-5 text-primary" />
                   <span className="text-xs uppercase tracking-[0.3em]">Instant Connect: +91 87625 57954</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <form onSubmit={handleEnquirySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border">
              <div className="bg-background p-8">
                <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground block mb-4">Full Name</label>
                <input
                  required
                  value={enquiryName}
                  onChange={(e) => setEnquiryName(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-lg font-heading italic focus:text-primary transition-colors"
                  placeholder="Full Name"
                />
              </div>
              <div className="bg-background p-8">
                <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground block mb-4">Email Address</label>
                <input
                  required
                  type="email"
                  value={enquiryEmail}
                  onChange={(e) => setEnquiryEmail(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-lg font-heading italic focus:text-primary transition-colors"
                  placeholder="Email Address"
                />
              </div>
              <div className="bg-background p-8">
                <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground block mb-4">Phone</label>
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  minLength={10}
                  title="Enter a 10-digit phone number"
                  value={enquiryPhone}
                  onChange={(e) => setEnquiryPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="bg-transparent border-none outline-none w-full text-lg font-heading italic focus:text-primary transition-colors"
                  placeholder="10-digit number"
                />
              </div>
              <div className="bg-background p-8">
                <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground block mb-4">Space</label>
                <select
                  value={enquiryService}
                  onChange={(e) => setEnquiryService(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-lg font-heading italic focus:text-primary transition-colors appearance-none cursor-pointer"
                >
                  <option className="bg-background">Podcast Studio</option>
                  <option className="bg-background">Green Screen</option>
                  <option className="bg-background">Photoshoot Room</option>
                </select>
              </div>
              <div className="bg-background p-8 md:col-span-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground block mb-4">Preferred Date &amp; Time</label>
                <DateTimePicker
                  value={enquiryDateTime}
                  onChange={setEnquiryDateTime}
                  onSelectedDayChange={setEnquiryDay}
                  bookedTimes={enquiryBookedTimes}
                  name="preferredDateTime"
                />
              </div>
              <div className="bg-background p-8 md:col-span-2 text-center py-20 border-t border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mb-4">Initial Enquiry</p>
                {submitError && (
                  <p className="text-xs text-red-400 tracking-wide mb-4">{submitError}</p>
                )}
                <Button type="submit" disabled={submitting} className="rounded-none px-12 py-8 bg-primary text-background hover:bg-white transition-all duration-500 uppercase tracking-[0.5em] text-xs font-bold w-full md:w-auto disabled:opacity-50">
                  {submitting ? "Dispatching..." : "Dispatch Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

const Plus = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
