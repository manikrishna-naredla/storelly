import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAppLogo, getAppName } from '../../utils/branding';

import { FaWhatsapp, FaTelegram, FaYoutube, FaInstagram } from 'react-icons/fa';
import { SiGooglepay, SiPhonepe, SiPaytm, SiGoogleforms } from 'react-icons/si';
import { 
  Store, CheckCircle2, Star, FileText, Calendar, Link2, 
  MessageCircle, TrendingUp, ChevronDown, Check, QrCode, 
  ArrowRight, ShieldCheck, Sparkles,
  Menu, X, Globe, PackagePlus, FileDown, CalendarCheck, LineChart, Wand2, Palette, IndianRupee, Clock, Video, Lock,
  ShoppingBag, CheckCheck, Copy, ExternalLink, Smartphone, BadgePercent, Coins, Share2, Send, MapPin
} from 'lucide-react';
import { PlatformPricingPlan, PlatformPricingCMS } from '../../types/admin';
import { 
  adminGetPricingPlans, 
  adminGetPricingCMS, 
  DEFAULT_PRICING_PLANS, 
  DEFAULT_PRICING_CMS 
} from '../../services/adminService';
import { HappyClientsMarquee } from './HappyClientsMarquee';
import { 
  UpiLogo, 
  ZeroCodingIcon, 
  GoogleMeetIcon, 
  WhatsAppBadge 
} from './LandingIcons';

interface MasterLandingViewProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenMasterAdmin?: () => void;
}

export const MasterLandingView: React.FC<MasterLandingViewProps> = ({ onOpenAuth }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [pricingPlans, setPricingPlans] = useState<PlatformPricingPlan[]>(DEFAULT_PRICING_PLANS);
  const [pricingCMS, setPricingCMS] = useState<PlatformPricingCMS>(DEFAULT_PRICING_CMS);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const [loadedPlans, loadedCms] = await Promise.all([
          adminGetPricingPlans(),
          adminGetPricingCMS(),
        ]);
        if (loadedPlans && loadedPlans.length > 0) {
          setPricingPlans(loadedPlans.filter(p => p.isActive !== false));
        }
        if (loadedCms && loadedCms.title) {
          setPricingCMS(loadedCms);
        }
      } catch (err) {
        console.warn('Error loading dynamic pricing in MasterLandingView:', err);
      }
    };

    loadPricing();

    const handlePlansChange = (e: CustomEvent) => {
      if (e.detail?.plans) {
        setPricingPlans(e.detail.plans.filter((p: PlatformPricingPlan) => p.isActive !== false));
      }
    };

    const handleCmsChange = (e: CustomEvent) => {
      if (e.detail) {
        setPricingCMS(e.detail);
      }
    };

    window.addEventListener('storelly_pricing_changed' as any, handlePlansChange as EventListener);
    window.addEventListener('storelly_pricing_cms_changed' as any, handleCmsChange as EventListener);

    return () => {
      window.removeEventListener('storelly_pricing_changed' as any, handlePlansChange as EventListener);
      window.removeEventListener('storelly_pricing_cms_changed' as any, handleCmsChange as EventListener);
    };
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText('https://storelly.com/mayafashion');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const featuresData = [
    { 
      icon: <WhatsAppBadge size={34} />, 
      iconGradient: 'from-emerald-500 to-green-600', 
      shadow: 'shadow-emerald-500/25', 
      title: 'Instant WhatsApp Orders', 
      desc: 'Customers browse your interactive storefront and send complete orders with quantities, variant sizes, and delivery address directly to your WhatsApp.'
    },
    { 
      icon: (
        <div className="flex items-center justify-center p-1.5 bg-white rounded-xl shadow-xs">
          <img src="/images-1.png" alt="Direct UPI Payments" className="w-8 h-8 object-contain" />
        </div>
      ), 
      iconGradient: 'from-violet-600 to-indigo-700', 
      shadow: 'shadow-indigo-500/25', 
      title: 'Direct UPI Payments (0% Fee)', 
      desc: 'Accept payments through Google Pay, PhonePe, Paytm, BHIM, and Cred. 100% of your money deposits straight into your own bank account with zero cuts.'
    },
    { 
      icon: <ZeroCodingIcon size={34} className="text-white" />, 
      iconGradient: 'from-emerald-600 to-teal-700', 
      shadow: 'shadow-teal-500/25', 
      title: 'Zero Coding Required', 
      desc: 'No coding, no hosting, no technical setup. Create your product catalog and launch your custom branded storefront in under 2 minutes.'
    },
    { 
      icon: <Globe size={28} className="text-white" />, 
      iconGradient: 'from-blue-500 to-cyan-600', 
      shadow: 'shadow-blue-500/25', 
      title: 'Your Branded Store Link', 
      desc: 'Get an instant, clean address like storelly.com/mayafashion. Easy for customers to bookmark, share on Instagram bio, and save on WhatsApp.'
    },
    { 
      icon: <GoogleMeetIcon size={28} />, 
      iconGradient: 'from-pink-500 to-rose-600', 
      shadow: 'shadow-rose-500/25', 
      title: 'Book Paid 1:1 Consultations', 
      desc: 'Clients choose an available calendar time slot and pay upfront via UPI before automated Google Meet video consultation invitations.'
    },
    { 
      icon: (
        <div className="flex flex-wrap justify-center items-center gap-1.5 w-12 text-white">
          <FaInstagram size={14} color="white" />
          <FaYoutube size={14} color="white" />
          <FaWhatsapp size={14} color="white" />
          <FaTelegram size={14} color="white" />
        </div>
      ), 
      iconGradient: 'from-amber-500 to-orange-600', 
      shadow: 'shadow-amber-500/25', 
      title: 'Universal Bio Link & Socials', 
      desc: 'Unify Instagram bio, YouTube channels, WhatsApp communities, Telegram groups, and portfolios into one smart page.'
    },
    { 
      icon: <LineChart size={28} className="text-white" />, 
      iconGradient: 'from-sky-500 to-blue-600', 
      shadow: 'shadow-sky-500/25', 
      title: 'Real-Time Sales & Traffic', 
      desc: 'Track live page visitors, WhatsApp order clicks, top revenue items, and customer conversion rates in real time without analytics bloat.'
    },
    { 
      icon: <FileDown size={28} className="text-white" />, 
      iconGradient: 'from-red-500 to-rose-600', 
      shadow: 'shadow-red-500/25', 
      title: 'Digital Products Auto-Delivery', 
      desc: 'Sell study guides, e-books, templates, presets, and recordings with automated instant delivery via WhatsApp and secure direct links.'
    },
    { 
      icon: <Palette size={28} className="text-white" />, 
      iconGradient: 'from-purple-500 to-violet-600', 
      shadow: 'shadow-purple-500/25', 
      title: 'Custom Brand Themes', 
      desc: 'Choose from handcrafted color palettes, typography, and card styles to perfectly mirror your brand identity and creative tone.'
    }
  ];

  const howItWorksData = [
    { 
      step: 1, 
      icon: Globe, 
      title: 'Claim Your Free Link', 
      desc: 'Pick your unique brand address (storelly.com/yourshop) and set up your mobile storefront in under 30 seconds.' 
    },
    { 
      step: 2, 
      icon: PackagePlus, 
      title: 'Add Products & Offerings (Zero Code)', 
      desc: 'Upload photos, set prices, add digital files, consultation slots, or social channels effortlessly from your phone.' 
    },
    { 
      step: 3, 
      icon: Send, 
      title: 'Share & Get Paid 100% via UPI', 
      desc: 'Share your link on Instagram, WhatsApp, or display your counter QR standee. Receive instant orders and direct bank deposits.' 
    }
  ];

  const faqData = [
    { q: 'What is Storelly?', a: 'Storelly is a WhatsApp-first digital commerce platform for local retail merchants, home artisans, and creators across India. It gives you one single link to showcase products, sell digital downloads, book consultations, and accept direct UPI payments.' },
    { q: 'Do my customers need to install an app?', a: 'No! Customers simply open your Storelly link in any mobile browser (Chrome, Safari, Instagram in-app browser) to browse products and place instant orders via WhatsApp.' },
    { q: 'Can I accept direct UPI payments?', a: 'Yes! Storelly integrates directly with UPI so your customers can pay you using Google Pay, PhonePe, Paytm, BHIM, or Cred with instant direct bank deposit.' },
    { q: 'Will Storelly take a cut from my sales?', a: 'Zero percent! Storelly never takes a commission from your sales revenue. 100% of your customer payments arrive directly into your own bank account.' },
    { q: 'Can I sell digital products like PDFs?', a: 'Yes! You can upload study notes, ebooks, design presets, and guides with automated file delivery via WhatsApp upon payment.' },
    { q: 'Can I use Storelly for 1:1 bookings?', a: 'Yes! Customers can choose from your available calendar slots and pay upfront for 1:1 video consultations or appointments with automated Google Meet links.' },
    { q: 'Can I connect my WhatsApp, Instagram, and YouTube?', a: 'Yes! Storelly serves as your universal bio link hub connecting your WhatsApp community, Instagram handle, YouTube channel, and Telegram group in one place.' },
    { q: 'Can I print a physical QR code for my shop counter?', a: 'Yes! Every Storelly profile includes an instant high-resolution QR standee code that you can display on your shop counter, packaging, and visiting cards.' }
  ];

  const trustData = [
    { 
      title: 'No App Required', 
      desc: 'Your customers open your Storelly page instantly in any mobile browser without downloading an app.',
      icon: <Smartphone className="w-6 h-6 text-emerald-600" />
    },
    { 
      title: 'WhatsApp First', 
      desc: 'Keep conversations, repeat customer relationships, and order updates where your customers already are.',
      icon: <span className="text-[#25D366]"><FaWhatsapp size={24} /></span>
    },
    { 
      title: 'Direct UPI Bank Settlements', 
      desc: 'NPCI-compliant direct transfers. 100% of customer payments deposit straight into your bank account.',
      icon: <img src="/images-1.png" alt="Direct UPI Bank Settlements" className="w-8 h-8 object-contain" />
    },
    { 
      title: 'Zero Sales Commission', 
      desc: 'Keep 100% of every Rupee you earn. No platform cuts, no hidden transaction percentage deductions.',
      icon: <BadgePercent className="w-6 h-6 text-emerald-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] font-sans text-[var(--t1)] selection:bg-[var(--g100)] selection:text-[var(--g900)] overflow-x-hidden scroll-smooth">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--card)]/95 backdrop-blur-md border-b border-[var(--border)] py-3.5 shadow-[var(--shadow-sm)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
          <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-8 h-8 rounded-[var(--r8)] overflow-hidden border border-[var(--border)] shadow-[var(--shadow-xs)] flex items-center justify-center bg-[var(--card)]">
              <img src={getAppLogo()} alt={`${getAppName()} Logo`} className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-heading font-black text-[var(--t1)] tracking-tight whitespace-nowrap">{getAppName()}</span>
          </div>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <a href="#" className="text-sm font-semibold text-[var(--t1)] hover:text-[var(--g600)] transition whitespace-nowrap shrink-0">Home</a>
            <a href="#features" className="text-sm font-semibold text-[var(--t2)] hover:text-[var(--g600)] transition whitespace-nowrap shrink-0">Features</a>
            <a href="#vendors" className="text-sm font-semibold text-[var(--t2)] hover:text-[var(--g600)] transition whitespace-nowrap shrink-0">For Vendors</a>
            <a href="#creators" className="text-sm font-semibold text-[var(--t2)] hover:text-[var(--g600)] transition whitespace-nowrap shrink-0">For Creators</a>
            <a href="#pricing" className="text-sm font-semibold text-[var(--t2)] hover:text-[var(--g600)] transition whitespace-nowrap shrink-0">Pricing</a>
            <a href="#faq" className="text-sm font-semibold text-[var(--t2)] hover:text-[var(--g600)] transition whitespace-nowrap shrink-0">FAQ</a>
          </div>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <button 
              onClick={() => onOpenAuth('login')}
              className="text-sm font-bold text-[var(--t1)] hover:text-[var(--g600)] transition px-4 py-2 rounded-[var(--r8)] cursor-pointer whitespace-nowrap shrink-0"
            >
              Log In
            </button>
            <button 
              onClick={() => onOpenAuth('signup')}
              className="bg-[var(--g600)] hover:bg-[var(--g700)] text-white text-sm font-bold px-5 py-2.5 rounded-[var(--r8)] shadow-[var(--shadow-sm)] transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            >
              Get Started Free
            </button>
          </div>
          
          <div className="lg:hidden flex items-center gap-2">
             <button 
               onClick={() => onOpenAuth('login')}
               className="text-xs font-bold text-[var(--t1)] hover:text-[var(--g600)] px-3 py-1.5 rounded-[var(--r8)] border border-[var(--border)] cursor-pointer"
             >
               Log In
             </button>
             <button
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
               className="p-2 text-[var(--t2)] hover:text-[var(--t1)] rounded-[var(--r8)] cursor-pointer"
               aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
             >
               {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[var(--card)] pt-20 px-6 pb-8 flex flex-col justify-between overflow-y-auto"
          >
            <div className="flex flex-col gap-5 pt-4">
              <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-heading font-bold text-[var(--t1)]">Home</a>
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-heading font-bold text-[var(--t2)]">Features</a>
              <a href="#vendors" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-heading font-bold text-[var(--t2)]">For Vendors</a>
              <a href="#creators" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-heading font-bold text-[var(--t2)]">For Creators</a>
              <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-heading font-bold text-[var(--t2)]">Pricing</a>
              <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-heading font-bold text-[var(--t2)]">FAQ</a>
            </div>

            <div className="flex flex-col gap-3 pt-6 border-t border-[var(--border)] mt-6">
              <button 
                onClick={() => { setIsMobileMenuOpen(false); onOpenAuth('signup'); }}
                className="bg-[var(--g600)] hover:bg-[var(--g700)] text-white text-base font-bold px-6 py-3.5 rounded-[var(--r8)] w-full transition cursor-pointer shadow-md"
              >
                Get Started Free
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); onOpenAuth('login'); }}
                className="bg-[var(--bg)] hover:bg-[var(--g100)] text-[var(--t1)] text-base font-bold px-6 py-3.5 rounded-[var(--r8)] w-full transition cursor-pointer border border-[var(--border)]"
              >
                Log In to Your Store
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="pt-32 pb-16 lg:pt-36 lg:pb-24 bg-[var(--card)] relative overflow-hidden">
        {/* Soft Ambient Blend matching illustration's warm cream & pastel sky-blue palette */}
        <div className="absolute top-0 right-0 bottom-0 w-full lg:w-[65%] pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-[620px] h-[520px] bg-[#f9f2d8]/95 dark:bg-amber-950/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -right-10 w-[620px] h-[520px] bg-[#d7f2fd]/95 dark:bg-sky-950/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-100/40 dark:bg-emerald-950/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 sm:gap-16 lg:gap-16 xl:gap-20">
            
            {/* Left Headline & Pitch */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6 }}
              className="w-full lg:w-[46%] xl:w-[44%] space-y-7 z-10 text-center lg:text-left shrink-0"
            >

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-heading font-black text-[var(--t1)] tracking-tight leading-[1.12]">
                Your Business. <br />
                <span className="text-[var(--g600)]">One Smart Link.</span>
              </h1>

              {/* 0% Commission Big Bold Highlight */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4 py-1">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--t1)] tracking-tight">
                  Sell with
                </span>
                
                <div className="inline-flex items-center">
                  <div className="relative inline-flex items-center justify-center mx-2 px-1 py-0.5">
                    <span className="relative z-10 px-4 sm:px-5 py-1 text-emerald-600 dark:text-emerald-400 font-heading font-black text-6xl sm:text-7xl lg:text-8xl tracking-tighter select-none">
                      0
                    </span>
                    
                    {/* Big Stylized Hand-Drawn Pencil Circle SVG */}
                    <svg 
                      className="absolute -inset-4 sm:-inset-6 lg:-inset-7 w-[calc(100%+32px)] sm:w-[calc(100%+48px)] lg:w-[calc(100%+56px)] h-[calc(100%+32px)] sm:h-[calc(100%+48px)] lg:h-[calc(100%+56px)] pointer-events-none z-20 text-emerald-500 dark:text-emerald-400 overflow-visible"
                      viewBox="0 0 160 160"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M 80 12 C 122 9, 154 36, 150 82 C 146 126, 112 152, 68 154 C 24 156, 6 122, 8 80 C 10 38, 44 12, 92 10 C 136 8, 156 38, 152 82 C 147 120, 114 148, 76 150" 
                        stroke="currentColor" 
                        strokeWidth="4.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        style={{ filter: 'drop-shadow(0px 2px 5px rgba(16, 185, 129, 0.45))' }}
                      />
                      <path 
                        d="M 74 18 C 114 16, 144 42, 142 80 C 140 114, 108 142, 64 144 C 32 146, 14 116, 16 78 C 18 42, 50 18, 86 16 C 118 14, 146 34, 144 74" 
                        stroke="currentColor" 
                        strokeWidth="2.2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="opacity-70"
                      />
                    </svg>
                  </div>

                  <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-emerald-600 dark:text-emerald-400 font-heading">
                    %
                  </span>
                </div>

                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--t1)] tracking-tight">
                  Commission
                </span>
              </div>

              <p className="text-lg sm:text-xl text-[var(--t2)] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Create your Storelly page, showcase products or digital services, accept direct UPI payments, and receive structured orders on WhatsApp — with zero coding required.
              </p>



              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button 
                  onClick={() => onOpenAuth('signup')}
                  className="w-full sm:w-auto bg-[var(--g600)] hover:bg-[var(--g700)] text-white font-bold text-lg px-8 py-4 rounded-[var(--r8)] shadow-[var(--shadow-sm)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Create Your Free Store <ArrowRight className="w-5 h-5" />
                </button>
                <a 
                  href="#how-it-works"
                  className="w-full sm:w-auto bg-[var(--g100)] hover:bg-[var(--g200)] text-[var(--g800)] font-bold text-lg px-8 py-4 rounded-[var(--r8)] transition-all flex items-center justify-center gap-2 border border-[var(--g200)]"
                >
                  See How It Works
                </a>
              </div>
              
              <p className="text-sm text-[var(--t3)] font-medium flex items-center justify-center lg:justify-start gap-2 pt-1">
                <ShieldCheck className="w-4 h-4 text-[var(--g500)]" /> No app download required for customers. 100% money in your bank.
              </p>

              {/* Direct UPI Payments Badge */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[var(--r12)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-xs)] text-xs font-bold text-[var(--t1)]">
                  <img src="/images-1.png" alt="Direct UPI Payments" className="w-5 h-5 object-contain shrink-0" />
                  <span>Direct UPI Payments Accepted (Google Pay, PhonePe, Paytm, BHIM)</span>
                </div>
              </div>
            </motion.div>

            {/* Right Interactive Showcase with Enlarged Visuals & Device-Friendly Spacing */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full lg:w-[54%] xl:w-[56%] flex justify-center lg:justify-end relative mt-8 sm:mt-12 lg:mt-0"
            >
               <div className="relative w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-none mx-auto z-10 flex flex-col items-center px-1 sm:px-0">
                  {/* Clean Borderless Showcase with Enlarged Prominence & Seamless Blend */}
                  <div className="w-full relative overflow-hidden transition-transform duration-500 hover:scale-[1.01] flex items-center justify-center">
                    <img 
                      src="/landingpage.jpeg" 
                      alt="Storefront & Creator Studio Interface" 
                      className="w-full h-auto object-contain mix-blend-multiply dark:mix-blend-normal max-h-[600px] sm:max-h-[720px] lg:max-h-[820px] scale-100 sm:scale-[1.03] lg:scale-[1.05]" 
                      style={{ 
                        imageRendering: "high-quality",
                        WebkitMaskImage: 'radial-gradient(ellipse 99% 99% at 50% 50%, black 94%, transparent 100%)',
                        maskImage: 'radial-gradient(ellipse 99% 99% at 50% 50%, black 94%, transparent 100%)'
                      }} 
                    />
                  </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HAPPY CLIENTS & FAST-GROWING BRANDS SCROLLING MARQUEE */}
      <HappyClientsMarquee />

      {/* VENDOR SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6 }}
      >
        <section id="vendors" className="py-20 md:py-28 bg-[var(--g100)]/40 border-y border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              
              {/* Left: Image for Vendor */}
              <div className="lg:w-[52%] flex justify-center items-center relative w-full mx-auto">
                 <div className="w-full relative overflow-hidden flex items-center justify-center">
                    <img 
                      src="/storelly6.jpg" 
                      alt="Storelly for Local Stores & Retailers" 
                      className="w-full h-auto object-contain transition-transform duration-500 hover:scale-[1.01] mix-blend-multiply dark:mix-blend-normal"
                      style={{ 
                        imageRendering: "high-quality",
                        WebkitMaskImage: 'radial-gradient(ellipse 98% 98% at 50% 50%, black 86%, transparent 100%)',
                        maskImage: 'radial-gradient(ellipse 98% 98% at 50% 50%, black 86%, transparent 100%)'
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/storelly6.jpg.jpeg';
                      }}
                    />
                 </div>
              </div>

              {/* Right: Content & Real Products */}
              <div className="lg:w-[48%] space-y-7">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--g100)] text-[var(--g800)] text-xs font-bold uppercase tracking-wider mb-3">
                    <Store className="w-3.5 h-3.5 text-[var(--g600)]" /> For Local Retailers &amp; Stores
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-heading font-black text-[var(--t1)] tracking-tight leading-tight mb-4">
                    Take Your Local Business Online — Without the Complexity.
                  </h2>
                  <p className="text-lg text-[var(--t2)] font-medium">
                    Show your products, collect UPI payments with 0% commission, and receive ready-to-pack orders directly on WhatsApp.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-[var(--card)] rounded-[var(--r12)] p-5 shadow-[var(--shadow-sm)] border border-[var(--border)] flex items-start gap-4 hover:shadow-[var(--shadow)] transition">
                    <div className="w-12 h-12 rounded-[var(--r8)] bg-[var(--g100)] text-[var(--g700)] flex items-center justify-center shrink-0">
                      <ZeroCodingIcon size={26} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-[var(--t1)]">Launch in 2 Minutes (Zero Coding)</h3>
                      <p className="text-[var(--t2)] text-sm mt-1">Upload photos, prices, and categories from your smartphone. Your store URL is instantly live.</p>
                    </div>
                  </div>

                  <div className="bg-[var(--card)] rounded-[var(--r12)] p-5 shadow-[var(--shadow-sm)] border border-[var(--border)] flex items-start gap-4 hover:shadow-[var(--shadow)] transition">
                    <div className="w-12 h-12 rounded-[var(--r8)] bg-[var(--g100)] text-[#25D366] flex items-center justify-center shrink-0">
                      <FaWhatsapp size={24} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-[var(--t1)]">Orders Arrive on WhatsApp</h3>
                      <p className="text-[var(--t2)] text-sm mt-1">Customers send formatted orders with quantities, variant sizes, and delivery address straight to your WhatsApp.</p>
                    </div>
                  </div>

                  <div className="bg-[var(--card)] rounded-[var(--r12)] p-5 shadow-[var(--shadow-sm)] border border-[var(--border)] flex items-start gap-4 hover:shadow-[var(--shadow)] transition">
                    <div className="w-12 h-12 rounded-[var(--r8)] bg-white border border-[var(--border)] flex items-center justify-center shrink-0 p-1.5 shadow-xs">
                      <img src="/images-1.png" alt="Direct UPI Bank Settlement" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-[var(--t1)] flex items-center gap-2">
                        <span>Direct UPI Bank Settlement</span>
                        <img src="/images-1.png" alt="UPI" className="h-4 w-4 object-contain inline" />
                      </h3>
                      <p className="text-[var(--t2)] text-sm mt-1">Accept Google Pay, PhonePe, and Paytm. Keep 100% of every sale with 0% platform cuts.</p>
                    </div>
                  </div>
                </div>

                {/* Real Live Order Notification Mockups */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div className="bg-[var(--card)] rounded-[var(--r12)] p-3.5 shadow-sm border border-[var(--border)] flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-300 shrink-0 bg-amber-50">
                      <img 
                        src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=150&auto=format&fit=crop&q=80" 
                        alt="Pickle" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-500" /> WhatsApp Order
                      </div>
                      <div className="text-xs font-black text-[var(--t1)] truncate">Chicken Pickle (1kg)</div>
                      <div className="text-[11px] font-bold text-[var(--g600)]">₹249 • Paid via PhonePe</div>
                    </div>
                  </div>

                  <div className="bg-[var(--card)] rounded-[var(--r12)] p-3.5 shadow-sm border border-[var(--border)] flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-pink-300 shrink-0 bg-pink-50">
                      <img 
                        src="https://images.unsplash.com/photo-1601050690597-df0568f70950?w=150&auto=format&fit=crop&q=80" 
                        alt="Ghee Sweets" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-500" /> WhatsApp Order
                      </div>
                      <div className="text-xs font-black text-[var(--t1)] truncate">Ghee Sweets (500g)</div>
                      <div className="text-[11px] font-bold text-[var(--g600)]">₹399 • Paid via GPay</div>
                    </div>
                  </div>
                </div>

                <div>
                  <button 
                    onClick={() => onOpenAuth('signup')} 
                    className="bg-[var(--g600)] hover:bg-[var(--g700)] text-white font-bold text-lg px-8 py-4 rounded-[var(--r8)] shadow-[var(--shadow-sm)] transition-all active:scale-95 w-full sm:w-auto cursor-pointer"
                  >
                    Create Your Store
                  </button>
                </div>

              </div>
            </div>
          </div>
        </section>
      </motion.div>
      
      {/* CREATOR SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.6 }}
      >
        <section id="creators" className="py-20 md:py-28 bg-[var(--card)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
              
              {/* Left: Content */}
              <div className="lg:w-1/2 space-y-7">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" /> For Creators, Educators &amp; Freelancers
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-heading font-black text-[var(--t1)] tracking-tight leading-tight mb-4">
                    Sell What You Know.<br/>Share What You Create.
                  </h2>
                  <p className="text-lg text-[var(--t2)] font-medium">
                    Turn your Instagram &amp; YouTube audience into customers with one smart page for digital files, consultations, and your bio link.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-[var(--bg)] rounded-[var(--r12)] p-5 shadow-[var(--shadow-sm)] border border-[var(--border)] flex items-start gap-4 hover:shadow-[var(--shadow)] transition">
                    <div className="w-12 h-12 rounded-[var(--r8)] bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-[var(--t1)]">Sell Digital Files &amp; Notes</h3>
                      <p className="text-[var(--t2)] text-sm mt-1">Sell study guides, PDFs, presets, and ebooks with automated instant delivery via WhatsApp.</p>
                    </div>
                  </div>

                  <div className="bg-[var(--bg)] rounded-[var(--r12)] p-5 shadow-[var(--shadow-sm)] border border-[var(--border)] flex items-start gap-4 hover:shadow-[var(--shadow)] transition">
                    <div className="w-12 h-12 rounded-[var(--r8)] bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                      <GoogleMeetIcon size={24} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-[var(--t1)] flex items-center gap-2">
                        <span>Book Paid 1:1 Video Consultations</span>
                        <img src="/images-1.png" alt="UPI" className="h-4 w-4 object-contain inline" />
                      </h3>
                      <p className="text-[var(--t2)] text-sm mt-1">Clients pick an open time slot and pay upfront via UPI before automated Google Meet links are generated.</p>
                    </div>
                  </div>

                  <div className="bg-[var(--bg)] rounded-[var(--r12)] p-5 shadow-[var(--shadow-sm)] border border-[var(--border)] flex items-start gap-4 hover:shadow-[var(--shadow)] transition">
                    <div className="w-12 h-12 rounded-[var(--r8)] bg-[var(--g100)] text-[var(--g700)] flex items-center justify-center shrink-0">
                      <Link2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-[var(--t1)]">One Smart Link for All Channels</h3>
                      <p className="text-[var(--t2)] text-sm mt-1">Combine your Instagram, YouTube channel, WhatsApp community, Telegram group, and Google Forms into one page.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <button 
                    onClick={() => onOpenAuth('signup')} 
                    className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-lg px-8 py-4 rounded-[var(--r8)] shadow-lg shadow-purple-600/25 transition-all active:scale-95 w-full sm:w-auto cursor-pointer"
                  >
                    Create Your Creator Page
                  </button>
                </div>
              </div>

              {/* Right: Image for Creator */}
              <div className="lg:w-1/2 flex justify-center items-center relative w-full mx-auto">
                 <div className="w-full relative rounded-[var(--r20)] overflow-hidden border border-[var(--border)] bg-[var(--card)] p-2 sm:p-3 shadow-[var(--shadow-lg)]">
                    <img 
                      src="/cteatorlink.jpeg" 
                      alt="Storelly Universal Bio Link & Digital Store" 
                      className="w-full h-auto object-contain rounded-[var(--r16)] transition-transform duration-500 hover:scale-[1.01]" 
                      style={{ imageRendering: "high-quality" }} 
                    />
                 </div>
              </div>

            </div>
          </div>
        </section>
      </motion.div>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-[var(--card)] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Big Highlighted "0 Commission" */}
          <div className="mb-16 flex flex-col items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--g100)] border border-[var(--g200)] text-[var(--g800)] text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-5 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              Keep 100% of Your Sales Revenue
            </div>

            <div className="text-4xl sm:text-6xl lg:text-7xl font-heading font-black text-[var(--t1)] tracking-tight flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              <span className="relative inline-flex items-center justify-center px-4 py-2 mx-1 my-1">
                <svg
                  className="absolute -inset-x-5 sm:-inset-x-8 -inset-y-3 sm:-inset-y-4 w-[calc(100%+2.5rem)] sm:w-[calc(100%+4rem)] h-[calc(100%+1.5rem)] sm:h-[calc(100%+2rem)] -left-5 sm:-left-8 -top-1.5 sm:-top-2 -rotate-2 text-emerald-500 dark:text-emerald-400 pointer-events-none stroke-current overflow-visible drop-shadow-md"
                  viewBox="0 0 220 95"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 28,48 C 22,22 65,8 120,7 C 180,6 208,24 208,48 C 208,74 170,89 110,90 C 50,91 10,72 12,44 C 14,24 48,12 105,11 C 165,10 205,27 206,52 C 207,76 162,88 115,88"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-95"
                  />
                  <path
                    d="M 35,52 C 30,28 72,15 124,14 C 176,13 200,28 200,50 C 200,71 165,84 112,84 C 58,84 20,69 22,46 C 24,29 58,19 108,18"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-75 text-emerald-400"
                  />
                </svg>

                <span className="text-emerald-600 dark:text-emerald-400 relative z-10 font-black tracking-tight text-5xl sm:text-7xl lg:text-8xl">
                  0%
                </span>
              </span>
              <span className="text-[var(--t1)]">
                Commission
              </span>
              <span className="text-[var(--t1)]">Forever.</span>
            </div>

            <p className="text-base sm:text-xl text-[var(--t2)] font-medium max-w-2xl mx-auto mt-4 leading-relaxed">
              No middleman cuts, no surprise deductions. Your sales and UPI payments go <span className="font-bold text-[var(--t1)]">100% directly into your own bank account</span>.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-start justify-between relative max-w-5xl mx-auto mt-12">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-[var(--border)] -z-10"></div>

            {howItWorksData.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center w-full md:w-1/3 mb-16 md:mb-0 relative bg-[var(--card)] px-6">
                <div className="w-24 h-24 rounded-full bg-[var(--bg)] flex items-center justify-center border-2 border-[var(--border)] shadow-[var(--shadow-xs)] relative mb-6">
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[var(--g600)] text-white font-bold flex items-center justify-center text-sm shadow-[var(--shadow-sm)]">{step.step}</div>
                  <div className="w-12 h-12 bg-[var(--g900)] rounded-[var(--r12)] flex items-center justify-center shadow-inner text-white">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="font-heading font-bold text-[var(--t1)] text-xl mb-3 flex items-center justify-center gap-2 flex-wrap">
                  <span>{step.title}</span>
                  {step.title.includes('UPI') && (
                    <img src="/images-1.png" alt="UPI" className="w-5 h-5 object-contain inline shrink-0" />
                  )}
                </h3>
                <p className="text-[var(--t2)] font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-24 bg-[var(--bg)] border-y border-[var(--border)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--g200)] rounded-full blur-[100px] opacity-30 -z-10 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[var(--p100)] rounded-full blur-[120px] opacity-40 -z-10 pointer-events-none transform translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-heading font-black text-[var(--t1)] mb-6 tracking-tight">Everything You Need to Sell From <span className="text-[var(--g600)]">One Link</span></h2>
            <p className="text-lg text-[var(--t2)] font-medium max-w-2xl mx-auto">We've built all the tools you need to run your online business, right into your Storelly page.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {featuresData.map((feat, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -6, scale: 1.015 }} 
                className="bg-[var(--card)] rounded-[var(--r16)] p-8 shadow-[var(--shadow-sm)] border border-[var(--border)] hover:shadow-[var(--shadow-lg)] transition-all duration-300 group overflow-hidden relative"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feat.iconGradient} rounded-full blur-[60px] opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none transform translate-x-1/2 -translate-y-1/2`}></div>
                
                <div className={`w-16 h-16 rounded-[var(--r12)] bg-gradient-to-br ${feat.iconGradient} flex items-center justify-center shrink-0 mb-6 shadow-md ${feat.shadow} group-hover:scale-105 transition-transform duration-500 border-2 border-white relative z-10`}>
                  <div className="drop-shadow-md flex items-center justify-center w-full h-full">{feat.icon}</div>
                </div>
                <h3 className="font-heading font-bold text-[var(--t1)] text-xl mb-2 relative z-10">{feat.title}</h3>
                <p className="text-[var(--t2)] text-sm font-medium leading-relaxed relative z-10">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOP COUNTER QR STANDEE SECTION */}
      <section className="py-24 bg-[var(--card)] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[var(--g900)] rounded-[var(--r24)] p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-[var(--shadow-xl)]">
            
            <div className="lg:w-1/2 z-10 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[var(--g200)] text-xs font-bold uppercase tracking-wider mb-4 border border-white/15">
                <QrCode className="w-3.5 h-3.5 text-[var(--g400)]" /> Physical Counter Standee
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-white mb-6 leading-tight">
                Your Shop Has a <br/><span className="text-[var(--g400)]">Digital Address.</span>
              </h2>
              <p className="text-lg text-[var(--g200)] font-medium mb-8 max-w-lg mx-auto lg:mx-0">
                Display your official Storelly QR standee on your billing counter, product packaging, or visiting card. Customers scan, browse your menu or catalog, and order on WhatsApp.
              </p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8">
                <div className="bg-white/10 px-3.5 py-2 rounded-lg border border-white/10 text-white text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--g400)]" /> 1-Click Scan to Shop
                </div>
                <div className="bg-white/10 px-3.5 py-2 rounded-lg border border-white/10 text-white text-xs font-bold flex items-center gap-2">
                  <img src="/images-1.png" alt="UPI" className="w-4 h-4 object-contain" /> Direct UPI Payment
                </div>
              </div>

              <button 
                onClick={() => onOpenAuth('signup')} 
                className="bg-[var(--g500)] hover:bg-[var(--g600)] text-white font-bold text-lg px-8 py-4 rounded-[var(--r8)] shadow-[var(--shadow-sm)] transition-all active:scale-95 cursor-pointer"
              >
                Create My Store &amp; Download QR
              </button>
            </div>

            {/* Standee Mockup */}
            <div className="lg:w-1/2 relative flex justify-center z-10">
               <div className="relative w-72 sm:w-80 bg-white rounded-[var(--r24)] p-6 shadow-2xl flex flex-col items-center rotate-2 border-4 border-slate-100 text-slate-900">
                  <div className="flex items-center gap-2 mb-3">
                     <div className="w-7 h-7 rounded-lg bg-[var(--g600)] flex items-center justify-center text-white font-black text-sm">S</div>
                     <span className="font-heading font-black text-xl text-slate-900">Maya Fashion Studio</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 mb-3">Scan to View Catalog &amp; Order</div>
                  
                  {/* QR Code Container */}
                  <div className="p-3 bg-slate-50 rounded-2xl border-2 border-slate-200 shadow-inner mb-3">
                    <QrCode className="w-36 h-36 text-slate-900" />
                  </div>
                  
                  <div className="w-full bg-[var(--g600)] text-white font-bold text-xs py-2 rounded-[var(--r8)] text-center mb-2">
                    storelly.com/mayafashion
                  </div>

                  {/* UPI Supported row on Standee */}
                  <div className="flex items-center justify-center gap-2 py-1 px-3 bg-slate-50 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600">
                    <img src="/images-1.png" alt="UPI" className="w-4 h-4 object-contain shrink-0" />
                    <span>Instant UPI Payments (0% Fee)</span>
                  </div>


               </div>
               
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--g500)] opacity-20 blur-[100px] rounded-full -z-10"></div>
            </div>
            
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="py-24 bg-[var(--bg)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-[var(--t1)] mb-4">Built for the Way Indian Businesses Actually Sell</h2>
            <p className="text-base text-[var(--t2)] font-medium">Simple, reliable, and tailored to WhatsApp-first Indian consumers.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {trustData.map((item, index) => (
              <div key={index} className="bg-[var(--card)] rounded-[var(--r16)] p-8 border border-[var(--border)] shadow-[var(--shadow-xs)] text-center flex flex-col items-center hover:shadow-[var(--shadow-sm)] transition">
                <div className="w-14 h-14 rounded-[var(--r12)] bg-[var(--g100)] flex items-center justify-center mb-6 shadow-xs">
                  {item.icon}
                </div>
                <h3 className="font-heading font-bold text-[var(--t1)] text-lg mb-3">{item.title}</h3>
                <p className="text-[var(--t2)] font-medium text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-[var(--card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-[var(--t1)] mb-3">Loved by Merchants &amp; Creators Across India</h2>
            <p className="text-base text-[var(--t2)] font-medium">Real stories from entrepreneurs scaling their revenue with Storelly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Vendor Testimonial 1 */}
            <div className="bg-[var(--bg)] rounded-[var(--r20)] p-8 relative overflow-hidden border border-[var(--border)] shadow-[var(--shadow-xs)] flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-base font-semibold text-[var(--t1)] leading-relaxed mb-6">
                  "I used to spend 3 hours daily sending photos and prices one by one on WhatsApp. With Storelly, customers choose variants and send complete orders directly. My sales doubled!"
                </p>
              </div>
              <div className="flex items-center gap-3.5 pt-4 border-t border-[var(--border)]">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80" 
                  alt="Priya Sharma" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 shadow-sm"
                />
                <div>
                  <h4 className="font-heading font-bold text-sm text-[var(--t1)]">Priya Sharma</h4>
                  <p className="text-xs font-medium text-[var(--t2)]">Maya Artisanal Foods, Hyderabad</p>
                </div>
              </div>
            </div>

            {/* Creator Testimonial 2 */}
            <div className="bg-[var(--bg)] rounded-[var(--r20)] p-8 relative overflow-hidden border border-[var(--border)] shadow-[var(--shadow-xs)] flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-base font-semibold text-[var(--t1)] leading-relaxed mb-6">
                  "I sold over 2,400 digital study guides via direct UPI without paying 30% platform fees. Automated delivery via WhatsApp works seamlessly every single time."
                </p>
              </div>
              <div className="flex items-center gap-3.5 pt-4 border-t border-[var(--border)]">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80" 
                  alt="Rahul Verma" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-400 shadow-sm"
                />
                <div>
                  <h4 className="font-heading font-bold text-sm text-[var(--t1)]">Rahul Verma</h4>
                  <p className="text-xs font-medium text-[var(--t2)]">EdTech Educator &amp; YouTube Creator</p>
                </div>
              </div>
            </div>

            {/* Vendor Testimonial 3 */}
            <div className="bg-[var(--bg)] rounded-[var(--r20)] p-8 relative overflow-hidden border border-[var(--border)] shadow-[var(--shadow-xs)] flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-base font-semibold text-[var(--t1)] leading-relaxed mb-6">
                  "Our boutique customers scan the Storelly QR standee on our shop counter and browse newly arrived saree collections. It looks so modern and professional."
                </p>
              </div>
              <div className="flex items-center gap-3.5 pt-4 border-t border-[var(--border)]">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" 
                  alt="Ananya Rao" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-400 shadow-sm"
                />
                <div>
                  <h4 className="font-heading font-bold text-sm text-[var(--t1)]">Ananya Rao</h4>
                  <p className="text-xs font-medium text-[var(--t2)]">Vogue Handlooms, Bengaluru</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 bg-[var(--bg)] border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-2">
            {pricingCMS.badge && (
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--g700)] bg-[var(--g100)] px-3 py-1 rounded-[var(--r8)] border border-[var(--g200)]">
                {pricingCMS.badge}
              </span>
            )}
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-[var(--t1)] mt-2">
              {pricingCMS.title || 'Start Free. Upgrade When You Grow.'}
            </h2>
            {pricingCMS.subtitle && (
              <p className="text-[var(--t2)] font-medium max-w-xl mx-auto text-sm sm:text-base">
                {pricingCMS.subtitle}
              </p>
            )}
          </div>

          <div className={`grid grid-cols-1 ${pricingPlans.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' : pricingPlans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3 max-w-6xl mx-auto'} gap-8`}>
            {pricingPlans.map((plan) => {
              const isRecommended = plan.isRecommended || plan.badge === 'Recommended';
              return (
                <div
                  key={plan.id}
                  className={`bg-[var(--card)] rounded-[var(--r20)] p-8 sm:p-10 border flex flex-col relative transition-all duration-200 ${
                    isRecommended
                      ? 'border-2 border-[var(--g600)] shadow-[var(--shadow-lg)] md:-translate-y-3'
                      : 'border-[var(--border)] shadow-[var(--shadow-sm)]'
                  }`}
                >
                  {(plan.badge || isRecommended) && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--g600)] text-white text-xs font-black uppercase tracking-widest px-6 py-2 rounded-[var(--r8)] flex items-center gap-1.5 shadow-[var(--shadow-sm)]">
                      <Star className="w-4 h-4 fill-white" /> {plan.badge || 'Recommended'}
                    </div>
                  )}

                  <h3 className={`text-2xl font-heading font-black text-[var(--t1)] mb-2 ${isRecommended ? 'mt-2' : ''}`}>
                    {plan.name}
                  </h3>

                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-5xl font-black text-[var(--t1)]">
                      {plan.currency || '₹'}{plan.monthlyPrice}
                    </span>
                    {plan.billingCycle && (
                      <span className="text-[var(--t2)] font-medium mb-1">{plan.billingCycle}</span>
                    )}
                  </div>

                  <p className="text-[var(--t2)] font-medium mb-8 text-sm sm:text-base">{plan.tagline}</p>

                  <div className="space-y-4 mb-10 flex-1">
                    {plan.features?.map((feat, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-[var(--g100)]">
                          {feat.toLowerCase().includes('upi') ? (
                            <img src="/images-1.png" alt="UPI" className="w-4 h-4 object-contain" />
                          ) : (
                            <Check className="w-4 h-4 text-[var(--g600)] font-bold" />
                          )}
                        </div>
                        <span className={`text-sm sm:text-base ${isRecommended ? 'font-bold text-[var(--t1)]' : 'font-medium text-[var(--t2)]'} flex items-center gap-1.5`}>
                          <span>{feat}</span>
                          {feat.toLowerCase().includes('upi') && (
                            <img src="/images-1.png" alt="UPI" className="w-4 h-4 object-contain inline shrink-0" />
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (plan.ctaAction === 'login') onOpenAuth('login');
                      else onOpenAuth('signup');
                    }}
                    className={`w-full py-4 rounded-[var(--r8)] font-bold transition-all text-base sm:text-lg cursor-pointer active:scale-95 ${
                      isRecommended
                        ? 'bg-[var(--g600)] text-white hover:bg-[var(--g700)] shadow-[var(--shadow-sm)]'
                        : 'border-2 border-[var(--border)] text-[var(--g700)] bg-[var(--g100)] hover:bg-[var(--g200)]'
                    }`}
                  >
                    {plan.ctaText || (plan.monthlyPrice === 0 ? 'Start Free' : 'Get Started')}
                  </button>
                </div>
              );
            })}
          </div>

          {pricingCMS.footerNote && (
            <p className="text-center text-[var(--t3)] font-medium mt-10 text-sm sm:text-base">
              {pricingCMS.footerNote}
            </p>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-[var(--card)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-[var(--t1)] mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqData.map((item, i) => (
              <div key={i} className="border border-[var(--border)] rounded-[var(--r12)] overflow-hidden bg-[var(--card)] hover:border-[var(--g400)] transition-colors">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-5 flex items-center justify-between bg-[var(--card)] text-left focus:outline-none cursor-pointer"
                >
                  <span className="font-heading font-bold text-[var(--t1)] text-lg">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[var(--t3)] transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-[var(--g600)]' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      className="px-6 pb-5 text-[var(--t2)] font-medium leading-relaxed"
                    >
                      <div>{item.a}</div>
                      {(item.q.includes('UPI') || item.a.includes('UPI')) && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs font-bold text-[var(--t1)]">
                          <img src="/images-1.png" alt="UPI" className="w-5 h-5 object-contain shrink-0" />
                          <span>Direct UPI Settlements • Zero Fees • Instant Transfer</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-[var(--g700)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-heading font-black text-white mb-6 leading-tight">Ready to Give Your Business <br/>One Smart Link?</h2>
          <p className="text-xl text-white/90 font-medium mb-10 max-w-2xl mx-auto">
            Create your Storelly page, share it with your customers, and start receiving direct orders today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <button 
               onClick={() => onOpenAuth('signup')} 
               className="bg-white text-[var(--g800)] font-black text-lg px-10 py-5 rounded-[var(--r8)] shadow-[var(--shadow-xl)] transition-all hover:scale-105 active:scale-95 w-full sm:w-auto cursor-pointer"
             >
               Create Your Free Store
             </button>
             <a 
               href="#features" 
               className="bg-[var(--g800)] text-white font-bold text-lg px-10 py-5 rounded-[var(--r8)] transition-all hover:bg-[var(--g900)] border border-white/20 w-full sm:w-auto text-center"
             >
               Explore Features
             </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[var(--g900)] text-[var(--g200)] py-20 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            
            {/* Brand */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[var(--r8)] overflow-hidden border border-white/20 bg-white shadow-sm flex items-center justify-center shrink-0">
                  <img src={getAppLogo()} alt={`${getAppName()} Logo`} className="w-full h-full object-cover" />
                </div>
                <span className="text-2xl font-heading font-black text-white tracking-tight">{getAppName()}</span>
              </div>
              <p className="text-[var(--g300)] font-medium max-w-sm text-lg">One smart link for Indian stores &amp; creators.</p>
              <div className="flex gap-4 pt-4">
                 <a href="#" className="w-10 h-10 rounded-full bg-[var(--g800)] flex items-center justify-center hover:bg-[var(--g600)] transition text-white"><FaInstagram size={18} /></a>
                 <a href="#" className="w-10 h-10 rounded-full bg-[var(--g800)] flex items-center justify-center hover:bg-[var(--g600)] transition text-white"><FaYoutube size={18} /></a>
                 <a href="#" className="w-10 h-10 rounded-full bg-[var(--g800)] flex items-center justify-center hover:bg-[var(--g600)] transition text-white"><MessageCircle className="w-5 h-5" /></a>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-white font-heading font-bold tracking-wider uppercase text-sm">Product</h4>
              <ul className="space-y-4 text-[var(--g300)] font-medium">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#vendors" className="hover:text-white transition">For Vendors</a></li>
                <li><a href="#creators" className="hover:text-white transition">For Creators</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-white font-heading font-bold tracking-wider uppercase text-sm">Company</h4>
              <ul className="space-y-4 text-[var(--g300)] font-medium">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-white font-heading font-bold tracking-wider uppercase text-sm">Legal</h4>
              <ul className="space-y-4 text-[var(--g300)] font-medium">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-[var(--g800)] text-center text-[var(--g300)] font-medium flex flex-col md:flex-row justify-between items-center gap-4">
             <p>&copy; {new Date().getFullYear()} Storelly. All rights reserved.</p>
             <p className="flex items-center gap-1">Made with <span className="text-rose-400">♥</span> for Indian Businesses</p>
          </div>
        </div>
      </footer>

    </div>
  );
};
