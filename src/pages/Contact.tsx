import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Instagram, Twitter, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import SchemaOrg from "@/components/SchemaOrg";

export default function Contact() {
  const localBusinessSchema = {
    "name": "Nishabdha",
    "image": "https://nishabdha.com/logo.png",
    "@id": "https://nishabdha.com",
    "url": "https://nishabdha.com",
    "telephone": "+91 87625 57954",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "6, 4th Main Road, Arehalli, Uttarahalli Hobli",
      "addressLocality": "Bengaluru",
      "postalCode": "560061",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 12.904899587404491,
      "longitude": 77.5306637759086
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <SEO 
        title="Contact Us | Nishabdha Bangalore"
        description="Connect with Nishabdha in Bangalore. Contact us for custom acoustic art projects, studio bookings, or premium products. Your dialogue with silence starts here."
        keywords="contact Nishabdha, acoustic art Bangalore, studio booking India, sound solution consultation"
      />
      <SchemaOrg type="Organization" data={localBusinessSchema} />
      {/* Contact Hero */}
      <section className="relative pt-48 pb-24 px-6 md:px-12 border-b border-border">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12">
            <div className="space-y-8">
              <p className="text-[10px] uppercase tracking-[0.5em] text-primary">Get In Touch</p>
              <h1 className="text-7xl md:text-[12vw] font-display uppercase tracking-tighter leading-[0.8]">
                Start A <br /> <span className="text-outline">Dialogue</span>
              </h1>
            </div>
            <div className="max-w-md space-y-8">
              <p className="text-xl font-light text-muted-foreground leading-relaxed">
                Whether you're looking for a custom piece, studio booking, or just want to discuss the philosophy of silence, we're here.
              </p>
              <div className="flex items-center gap-4 text-primary">
                <div className="w-12 h-[1px] bg-primary" />
                <span className="text-[10px] uppercase tracking-[0.3em]">Response within 24h</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-24 md:py-48 px-6 md:px-12">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-24">
          <div className="md:col-span-5 space-y-24">
            <div className="space-y-12">
              <h3 className="text-xs uppercase tracking-[0.5em] text-primary">Direct Lines</h3>
              <div className="space-y-8">
                <a href="mailto:info@nishabdha.com" className="block group">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Email</p>
                  <p className="text-2xl md:text-3xl font-display uppercase tracking-tighter group-hover:text-primary transition-colors">info@nishabdha.com</p>
                </a>
                <a href="tel:+918762557954" className="block group">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Phone</p>
                  <p className="text-2xl md:text-3xl font-display uppercase tracking-tighter group-hover:text-primary transition-colors">+91 87625 57954</p>
                </a>
              </div>
            </div>

            <div className="space-y-12">
              <h3 className="text-xs uppercase tracking-[0.5em] text-primary">Physical Presence</h3>
              <div className="space-y-8">
                <div className="block">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Studio Address</p>
                  <p className="text-2xl md:text-3xl font-display uppercase tracking-tighter leading-tight">
                    6, 4TH MAIN ROAD, <br />
                    AREHALLI, UTTERAHALLI HOBLI, <br />
                    BENGALURU, KA 560061
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <h3 className="text-xs uppercase tracking-[0.5em] text-primary">Digital Footprint</h3>
              <div className="flex gap-12">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border">
              <div className="bg-background p-8">
                <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground block mb-4">Full Name</label>
                <input className="bg-transparent border-none outline-none w-full text-lg font-heading italic focus:text-primary transition-colors" placeholder="Full Name" />
              </div>
              <div className="bg-background p-8">
                <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground block mb-4">Email Address</label>
                <input className="bg-transparent border-none outline-none w-full text-lg font-heading italic focus:text-primary transition-colors" placeholder="Email Address" />
              </div>
              <div className="bg-background p-8 md:col-span-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground block mb-4">Subject</label>
                <input className="bg-transparent border-none outline-none w-full text-lg font-heading italic focus:text-primary transition-colors" placeholder="Subject" />
              </div>
              <div className="bg-background p-8 md:col-span-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground block mb-4">Message</label>
                <textarea className="bg-transparent border-none outline-none w-full text-lg font-heading italic focus:text-primary transition-colors min-h-[200px] resize-none" placeholder="Message" />
              </div>
              <div className="md:col-span-2">
                <Button className="w-full rounded-none py-12 bg-primary text-background hover:bg-white transition-all duration-500 uppercase tracking-[0.5em] text-xs font-bold">
                  Dispatch Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Studio Location Map - Refined Embedded Interaction */}
      <section className="relative h-[60vh] border-t border-border overflow-hidden bg-background">
        {/* Label - Top Left Minimal */}
        <div className="absolute top-12 left-6 md:left-12 z-20 pointer-events-none">
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">Studio Location</p>
        </div>

        {/* Embedded Map with Dark Monochrome Filter */}
        <div className="absolute inset-0 z-0">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.043743513689!2d77.5306637759086!3d12.904899587404491!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3f7063d898a3%3A0xe541c944d184764b!2sNishabdha%20Studio!5e0!3m2!1sen!2sin!4v1713858428421!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'grayscale(1) invert(0.92) contrast(1.2) brightness(0.8)' }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Studio Location Map"
          />
        </div>

        {/* Subtle Matte Overlay */}
        <div className="absolute inset-0 bg-black/35 pointer-events-none z-10" />

        {/* CTA - Bottom Right Minimal */}
        <div className="absolute bottom-12 right-6 md:right-12 z-20">
          <a 
            href="https://maps.app.goo.gl/nh1bRckHA4SkvoQUA" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] text-white hover:text-primary transition-all duration-500"
          >
            <span className="border-b border-white/20 group-hover:border-primary pb-1 transition-colors">View on Google Maps</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500" />
          </a>
        </div>
      </section>
    </div>
  );
}
