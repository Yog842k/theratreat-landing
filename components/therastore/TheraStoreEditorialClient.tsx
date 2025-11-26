'use client';

import { useRef } from 'react';
import { 
  motion, 
  useScroll, 
  useTransform, 
} from 'framer-motion';
import { ArrowRight, ShieldCheck, Star, Globe } from 'lucide-react';

// --- MOCK DATA ---
const categories = [
  { name: 'Physiotherapy', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', count: 42, desc: "Muscle Recovery" },
  { name: 'Neuro-Rehab', img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80', count: 18, desc: "Brain & Stroke" },
  { name: 'Pediatrics', img: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80', count: 35, desc: "Sensory Play" },
  { name: 'Orthopedics', img: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80', count: 22, desc: "Bone & Joint" },
  { name: 'Wellness', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80', count: 15, desc: "Yoga & Relax" },
];

// --- COMPONENTS ---

// 1. HORIZONTAL SCROLL SECTION (Fixed Logic)
const HorizontalScroll = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    
    // This tells Framer Motion: 
    // "Start animation when the TOP of the section hits the TOP of the viewport"
    // "End animation when the BOTTOM of the section hits the BOTTOM of the viewport"
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"] 
    });

    // Translate horizontally from 0% to -80% (adjust based on number of cards)
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

    return (
        // 1. The Track: High enough (400vh) to allow time for scrolling
        <section ref={targetRef} className="relative h-[400vh] bg-[#f4f4f0]">
            
            {/* 2. The Sticky Frame: Locks to the viewport */}
            <div className="sticky top-0 h-screen flex items-center overflow-hidden">
                
                {/* 3. The Moving Train: Slides left as you scroll down */}
                <motion.div style={{ x }} className="flex gap-12 px-12 md:px-24 w-max">
                    
                    {/* Header Card */}
                    <div className="w-[400px] md:w-[600px] flex flex-col justify-center shrink-0">
                        <span className="text-lime-600 font-mono text-xs uppercase tracking-widest mb-4">The Collection</span>
                        <h2 className="text-5xl md:text-8xl font-medium tracking-tighter leading-none mb-6 text-[#1a1a1a]">
                            Shop by <br/> Category
                        </h2>
                        <div className="h-[1px] w-24 bg-black mb-8"></div>
                        <p className="text-lg text-gray-500 max-w-sm leading-relaxed">
                            Keep scrolling down to move sideways through our specialized departments.
                        </p>
                    </div>

                    {/* Cards */}
                    {categories.map((cat, i) => (
                        <div key={i} className="relative h-[70vh] w-[50vh] shrink-0 group overflow-hidden cursor-pointer bg-white border border-black/5">
                            <img 
                                src={cat.img} 
                                alt={cat.name} 
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0" 
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                            <div className="absolute top-0 left-0 p-6 w-full flex justify-between text-white mix-blend-difference">
                                <span className="font-mono text-xs">0{i+1}</span>
                                <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform" />
                            </div>
                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <span className="text-lime-400 font-mono text-xs uppercase tracking-widest block mb-2">{cat.desc}</span>
                                <h3 className="text-4xl font-medium text-white">{cat.name}</h3>
                            </div>
                        </div>
                    ))}

                    {/* End Card */}
                    <div className="w-[400px] h-[70vh] shrink-0 flex items-center justify-center bg-[#e5e5e5]">
                        <div className="text-center">
                            <h3 className="text-4xl font-medium mb-4">View All</h3>
                            <button className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto hover:bg-lime-400 hover:text-black transition-colors">
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                </motion.div>
            </div>
        </section>
    );
};

// --- MAIN PAGE ---

export default function TheraStoreFinal() {
  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 1000], [1, 1.2]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0.5]);

  return (
    // CRITICAL FIX: Removed "overflow-x-hidden" from here. 
    // It's applied to specific sections if needed, but not the parent.
    <div className="bg-[#f4f4f0] text-[#1a1a1a] font-sans selection:bg-lime-200 selection:text-black min-h-screen">
      {/* Hero */}
      <header className="relative h-screen w-full overflow-hidden flex items-center justify-center pt-24">
        <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="absolute inset-0 z-0">
           <img 
             src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2000&auto=format&fit=crop" 
             className="w-full h-full object-cover brightness-[0.7]"
             alt="Hero"
           />
        </motion.div>
        <div className="relative z-10 text-center text-white max-w-4xl px-4 mt-20">
           <h1 className="text-[10vw] leading-[0.85] font-medium tracking-tighter mb-8">
             MOTION IS <br/> <span className="italic text-lime-300">MEDICINE.</span>
           </h1>
           <button className="px-8 py-4 bg-lime-400 text-black font-bold uppercase tracking-widest hover:bg-white transition-colors">
                Start Recovery
           </button>
        </div>
      </header>

      {/* Intro Text */}
      <section className="py-32 px-6 md:px-24 bg-[#f4f4f0]">
         <div className="max-w-4xl">
            <p className="font-mono text-sm text-gray-500 uppercase tracking-widest mb-8">( 01 — The Concept )</p>
            <p className="text-3xl md:text-5xl leading-[1.2] font-medium text-[#1a1a1a]">
                We curate clinical tools that bridge the gap between the hospital and your home sanctuary.
            </p>
         </div>
      </section>

      {/* --- HORIZONTAL SCROLL (Implementation) --- */}
      <HorizontalScroll />

      {/* Features Grid */}
      <section className="py-32 px-6 md:px-24 bg-[#1a1a1a] text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border-t border-white/20 pt-8">
                  <ShieldCheck className="w-8 h-8 mb-4 text-lime-400" />
                  <h3 className="text-xl font-bold mb-2">Vetted Inventory</h3>
                  <p className="text-gray-400 text-sm">Every product reviewed by licensed therapists.</p>
              </div>
              <div className="border-t border-white/20 pt-8">
                  <Globe className="w-8 h-8 mb-4 text-lime-400" />
                  <h3 className="text-xl font-bold mb-2">Global Shipping</h3>
                  <p className="text-gray-400 text-sm">Express delivery to 120+ countries.</p>
              </div>
              <div className="border-t border-white/20 pt-8">
                  <Star className="w-8 h-8 mb-4 text-lime-400" />
                  <h3 className="text-xl font-bold mb-2">Expert Support</h3>
                  <p className="text-gray-400 text-sm">24/7 access to product specialists.</p>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f4f4f0] text-[#1a1a1a] py-12 px-6 md:px-24 border-t border-black/10 text-center">
          <h2 className="text-[12vw] font-medium tracking-tighter leading-none opacity-10 select-none">THERASTORE</h2>
          <div className="flex justify-between mt-8 text-xs font-mono uppercase tracking-widest">
              <p>&copy; 2025</p>
              <p>Designed for Healing</p>
          </div>
      </footer>

    </div>
  );
}