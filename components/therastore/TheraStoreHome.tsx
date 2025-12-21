"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, ShoppingCart, Heart, Star, Truck, Shield, Package, 
  Plus, Minus, CheckCircle, ArrowRight, ChevronLeft, ChevronRight, 
  ChevronDown, Filter, X, SlidersHorizontal, Sparkles, User, 
  Menu, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, 
  Play, Grid, List, Zap, Activity, Brain, Baby, Accessibility, 
  HeartPulse, HandMetal, Stethoscope, MoveRight, ShoppingBag
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// --- Types & Data ---

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  subcategory: string;
  condition: "New" | "Refurbished" | "Used";
  inStock: boolean;
  stockCount?: number;
  fastDelivery: boolean;
  description: string;
  features: string[];
  seller?: string;
  isBestSeller?: boolean;
  isTopRated?: boolean;
  isDeal?: boolean;
  dealEndsIn?: string;
  conditionUse?: string[];
  therapyType?: string[];
  ageGroup?: string[];
  deviceFunction?: string[];
  useLocation?: string[];
  availability?: string;
}

// Filters used in the catalog view
type Filters = {
  categories: string[];
  subcategories: string[];
  conditionUse: string[];
  therapyType: string[];
  ageGroup: string[];
  deviceFunction: string[];
  useLocation: string[];
  priceRange: [number, number];
  availability: string[];
  rating: number;
};

const products: Product[] = []
    availability: "In Stock"
 

const mainCategories = ["Physiotherapy", "Occupational Therapy", "Speech Therapy", "Pediatric", "Neuro Rehab", "Mobility Aids", "Wellness"];
const conditionUseOptions = ["Autism Spectrum Disorder (ASD)", "Stroke Recovery", "Chronic Pain", "Post-Surgery", "ADHD"];

// --- Animation Variants ---
const containerVar: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVar: any = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 50 } }
};

const floatVar: any = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// --- Main Application ---

export default function TheraStore() {
    const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<"home" | "products" | "cart" | "product-detail">("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState("featured");
  
  // Filter state
  const [filters, setFilters] = useState<Filters>({
    categories: [], subcategories: [], conditionUse: [], therapyType: [], ageGroup: [],
    deviceFunction: [], useLocation: [], priceRange: [0, 50000], availability: [], rating: 0
  });

  // Data Memos
  const bestSellingProducts = useMemo(() => products.filter(p => p.isBestSeller).slice(0, 4), []);
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filters.categories.length === 0 || filters.categories.includes(product.category);
      const matchesCondition = filters.conditionUse.length === 0 || (product.conditionUse && product.conditionUse.some(c => filters.conditionUse.includes(c)));
      return matchesSearch && matchesCategory && matchesCondition;
    });
  }, [searchQuery, filters]);

    // Helpers
    const getToken = () => (typeof window !== "undefined" ? window.localStorage.getItem("token") : null);
    const syncCartItem = async (productId: string, quantity: number) => {
        try {
            const token = getToken();
            if (!token) return; // skip server sync if not logged in
            const product = products.find(p => p.id === productId);
            if (!product) return;
            await fetch("/api/therastore/cart", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity,
                }),
            });
        } catch (e) {
            console.error("Failed to sync cart item", e);
        }
    };

    // Cart Actions (DB-backed sync)
    const addToCart = (productId: string, quantity: number = 1) => {
        setCart(prev => {
            const nextQty = (prev[productId] || 0) + quantity;
            const next = { ...prev, [productId]: nextQty };
            syncCartItem(productId, nextQty);
            return next;
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => {
            const next = { ...prev } as { [key: string]: number };
            delete next[productId];
            // send quantity 0 to remove on server
            syncCartItem(productId, 0);
            return next;
        });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) return removeFromCart(productId);
        setCart(prev => {
            const next = { ...prev, [productId]: quantity };
            syncCartItem(productId, quantity);
            return next;
        });
    };
  const toggleWishlist = (productId: string) => setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  
  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const cartTotal = Object.entries(cart).reduce((total, [id, qty]) => {
      const product = products.find(p => p.id === id);
      return total + (product ? product.price * qty : 0);
  }, 0);
  const cartItems = Object.entries(cart).map(([id, qty]) => ({ product: products.find(p => p.id === id)!, quantity: qty }));

  // --- Views ---

  if (currentView === "product-detail" && selectedProduct) {
    return <ProductDetail product={selectedProduct} onBack={() => setCurrentView("products")} onAddToCart={addToCart} isInWishlist={wishlist.includes(selectedProduct.id)} onToggleWishlist={toggleWishlist} cartCount={cartCount} onGoToCart={() => setCurrentView("cart")} />;
  }

    if (currentView === "cart") {
        return <ShoppingCartView cartItems={cartItems} onBack={() => setCurrentView("products")} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} total={cartTotal} onProceed={() => router.push("/therastore/checkout")} />;
  }

    return (
        <div className="w-full min-h-screen bg-slate-50/50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      


      {currentView === "home" ? (
        <main>
          {/* 2. Hero Section */}
          <section className="relative overflow-hidden pt-12 pb-24 lg:pt-24 lg:pb-32">
            {/* Soft Gradients */}
            <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-emerald-100/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 -z-10" />
            <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-blue-100/40 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4 -z-10" />

            <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="space-y-8"
                >
                  <div className="inline-flex items-center gap-2 bg-white border border-emerald-100 shadow-sm px-4 py-2 rounded-full text-sm font-semibold text-emerald-800">
                    <Sparkles className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                    <span>#1 Rated Therapy Marketplace</span>
                  </div>
                  
                  <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                    Recovery, <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Reimagined.</span>
                  </h1>
                  
                  <p className="text-xl text-slate-500 max-w-lg leading-relaxed font-medium">
                    Access 25,000+ certified rehabilitation tools trusted by top clinics. Delivered to your doorstep with care.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Button size="lg" onClick={() => setCurrentView("products")} className="h-14 px-8 text-lg rounded-full bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-transform hover:scale-105">
                      Start Shopping
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-slate-200 hover:bg-white hover:border-emerald-200 hover:text-emerald-700 bg-white/60 backdrop-blur-sm">
                      For Clinics
                    </Button>
                  </div>

                  <div className="flex items-center gap-8 pt-6 border-t border-slate-200/60">
                     <div><p className="text-2xl font-bold text-slate-900">10k+</p><p className="text-sm font-medium text-slate-500">Products</p></div>
                     <div className="w-px h-10 bg-slate-200"></div>
                     <div><p className="text-2xl font-bold text-slate-900">100%</p><p className="text-sm font-medium text-slate-500">Verified</p></div>
                     <div className="w-px h-10 bg-slate-200"></div>
                     <div><p className="text-2xl font-bold text-slate-900">24/7</p><p className="text-sm font-medium text-slate-500">Support</p></div>
                  </div>
                </motion.div>

                {/* Animated Hero Image */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative lg:h-[600px] w-full hidden lg:block"
                >
                   <motion.div variants={floatVar} animate="animate" className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-900/10 border-[6px] border-white h-full">
                      <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Therapy Session" />
                      
                      {/* Floating Info Card */}
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-lg border border-white/50 flex items-center gap-5"
                      >
                          <div className="h-14 w-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
                            <CheckCircle size={28} />
                          </div>
                          <div>
                              <p className="font-bold text-slate-900 text-lg">Therapist Approved</p>
                              <p className="text-sm text-slate-600 font-medium">Every product is vetted by certified professionals.</p>
                          </div>
                          <div className="ml-auto">
                            <ArrowRight className="text-slate-400" />
                          </div>
                      </motion.div>
                   </motion.div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* 3. Colorful Category Tabs */}
          <section className="py-24 bg-white">
             <div className="max-w-[1400px] mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                   <div>
                      <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Shop by Category</h2>
                      <p className="text-slate-500 mt-2 text-lg">Specialized equipment tailored to your needs.</p>
                   </div>
                   <Button variant="link" className="text-emerald-600 font-bold text-base" onClick={() => setCurrentView("products")}>View All <ArrowRight className="ml-2 w-5 h-5"/></Button>
                </div>

                <motion.div 
                  variants={containerVar}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5"
                >
                   {[
                      { icon: <Activity />, label: "Physio", gradient: "from-blue-50 to-blue-100", text: "text-blue-700", border: "border-blue-200" },
                      { icon: <HandMetal />, label: "Occupational", gradient: "from-orange-50 to-orange-100", text: "text-orange-700", border: "border-orange-200" },
                      { icon: <Brain />, label: "Neuro", gradient: "from-purple-50 to-purple-100", text: "text-purple-700", border: "border-purple-200" },
                      { icon: <Baby />, label: "Pediatric", gradient: "from-pink-50 to-pink-100", text: "text-pink-700", border: "border-pink-200" },
                      { icon: <Accessibility />, label: "Mobility", gradient: "from-emerald-50 to-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
                      { icon: <Stethoscope />, label: "Diagnostic", gradient: "from-cyan-50 to-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
                   ].map((cat, i) => (
                      <motion.div 
                        key={i}
                        variants={itemVar}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className={`flex flex-col items-center justify-center p-6 rounded-3xl border ${cat.border} bg-gradient-to-br ${cat.gradient} cursor-pointer h-48 gap-4 shadow-sm hover:shadow-xl transition-all duration-300`}
                        onClick={() => { setFilters(prev => ({...prev, categories: [cat.label + (cat.label === "Neuro" ? " Rehab" : " Therapy")]})); setCurrentView("products"); }}
                      >
                         <div className={`h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-sm ${cat.text}`}>
                            {cat.icon}
                         </div>
                         <span className={`font-bold text-lg ${cat.text}`}>{cat.label}</span>
                      </motion.div>
                   ))}
                </motion.div>
             </div>
          </section>

          {/* 4. Featured Product Carousel */}
          <section className="py-24 bg-slate-50/80">
             <div className="max-w-[1400px] mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <Badge className="bg-emerald-100 text-emerald-800 mb-4 border-none px-4 py-1">Editor's Choice</Badge>
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">Therapist-Approved Picks</h2>
                    <p className="text-slate-500 text-lg">Curated by certified professionals for safe and effective home recovery.</p>
                </div>

                <motion.div 
                  variants={containerVar}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {bestSellingProducts.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            onAddToCart={addToCart} 
                            onToggleWishlist={toggleWishlist} 
                            isInWishlist={wishlist.includes(product.id)}
                            onViewDetails={() => { setSelectedProduct(product); setCurrentView("product-detail"); }}
                        />
                    ))}
                </motion.div>
                
                <div className="mt-16 text-center">
                    <Button variant="outline" size="lg" className="rounded-full bg-white px-10 h-12 border-slate-300 hover:border-emerald-500 hover:text-emerald-600 font-semibold" onClick={() => setCurrentView("products")}>
                        View All Best Sellers
                    </Button>
                </div>
             </div>
          </section>

             {/* 6. Shop by Goal (Bento Grid) */}
             <section className="py-24 bg-emerald-700 text-white relative overflow-hidden">
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
             
             <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                 <div className="mb-16 text-center md:text-left">
                     <h2 className="text-3xl lg:text-4xl font-bold mb-4">Find What You Need Faster</h2>
                     <p className="text-slate-400 text-lg">Browse products tailored to specific recovery goals.</p>
                 </div>

                 <motion.div 
                    variants={containerVar}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                 >
                     {[
                         { title: "Recover from Injury", desc: "Orthopedic supports & aids", icon: "🩹", color: "from-white/10 to-white/10" },
                         { title: "Neuro Rehabilitation", desc: "Stroke & spinal recovery tools", icon: "🧠", color: "from-white/10 to-white/10" },
                         { title: "Child Development", desc: "Sensory & motor skills", icon: "🧸", color: "from-white/10 to-white/10" },
                         { title: "Pain Management", desc: "Relief for chronic conditions", icon: "⚡", color: "from-white/10 to-white/10" },
                         { title: "Improve Mobility", desc: "Walkers, canes & wheelchairs", icon: "🚶", color: "from-white/10 to-white/10" },
                         { title: "Daily Living Aids", desc: "Tools for independence", icon: "🏠", color: "from-white/10 to-white/10" },
                     ].map((goal, i) => (
                         <motion.div 
                            key={i}
                            variants={itemVar}
                            whileHover={{ scale: 1.03 }}
                            className={`p-8 rounded-3xl bg-gradient-to-br ${goal.color} border border-white/10 hover:border-white/30 transition-all cursor-pointer backdrop-blur-sm group`}
                            onClick={() => setCurrentView("products")}
                         >
                             <div className="text-4xl mb-6 bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-md group-hover:bg-white/20 transition-colors">{goal.icon}</div>
                             <h3 className="text-xl font-bold mb-2">{goal.title}</h3>
                             <p className="text-emerald-50 group-hover:text-white transition-colors">{goal.desc}</p>
                         </motion.div>
                     ))}
                 </motion.div>
             </div>
          </section>

          {/* 7. Why TheraStore */}
          <section className="py-24 bg-white">
             <div className="max-w-[1400px] mx-auto px-6">
                 <div className="grid lg:grid-cols-2 gap-20 items-center">
                     <div className="space-y-8">
                         <h2 className="text-4xl font-bold text-slate-900 leading-tight">Why leading clinics <br/> choose TheraStore.</h2>
                         <p className="text-lg text-slate-500 leading-relaxed">We streamline the procurement process for therapy equipment, offering a verified, secure, and fast marketplace experience.</p>
                         
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                             {[
                                 { title: "Verified Vendors", desc: "Strict vetting process for all sellers." },
                                 { title: "Fast Shipping", desc: "Priority delivery to clinics & homes." },
                                 { title: "Secure Payments", desc: "Bank-grade encryption." },
                                 { title: "Expert Support", desc: "Guidance from licensed therapists." },
                             ].map((item, i) => (
                                 <div key={i} className="flex gap-4">
                                     <div className="h-12 w-1 bg-gradient-to-b from-emerald-500 to-transparent rounded-full flex-shrink-0"></div>
                                     <div>
                                         <h4 className="font-bold text-slate-900 text-lg">{item.title}</h4>
                                         <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                     <div className="relative">
                         <div className="bg-slate-100 rounded-[3rem] h-[600px] w-full relative overflow-hidden">
                             <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800" className="object-cover w-full h-full" alt="Doctor" />
                             {/* Floating Review Card Animation */}
                             <motion.div 
                                animate={{ y: [0, -15, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                                className="absolute bottom-12 left-8 right-8 bg-white/95 backdrop-blur p-6 rounded-3xl shadow-xl border border-white/50"
                             >
                                 <div className="flex items-center gap-4 mb-3">
                                    <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                                    <div>
                                        <p className="font-bold text-slate-900">Dr. Meena Patel</p>
                                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Physiotherapist, Mumbai</p>
                                    </div>
                                 </div>
                                 <p className="text-slate-700 font-medium leading-relaxed">"TheraStore simplified our clinic supply process immensely. The quality of equipment is unmatched."</p>
                                 <div className="flex gap-1 text-amber-400 mt-3"><Star size={16} className="fill-current"/><Star size={16} className="fill-current"/><Star size={16} className="fill-current"/><Star size={16} className="fill-current"/><Star size={16} className="fill-current"/></div>
                             </motion.div>
                         </div>
                     </div>
                 </div>
             </div>
          </section>

          {/* 10. Newsletter & Footer CTA */}
          <section className="px-6 pb-6">
            <div className="bg-emerald-900 py-20 px-6 text-center text-white rounded-[3rem] mx-auto max-w-[1400px] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="max-w-2xl mx-auto relative z-10">
                    <Mail className="w-12 h-12 mx-auto mb-6 text-emerald-400" />
                    <h2 className="text-3xl lg:text-5xl font-bold mb-6">Join the Community</h2>
                    <p className="text-emerald-100/80 mb-10 text-xl font-medium">Get expert recovery tips, new product alerts, and exclusive discounts delivered to your inbox.</p>
                    <div className="flex gap-2 max-w-md mx-auto bg-white/10 p-2 rounded-full border border-white/20 backdrop-blur-sm">
                        <input type="email" placeholder="Enter your email address" className="bg-transparent border-none text-white placeholder:text-emerald-200/70 flex-1 px-6 focus:outline-none text-lg" />
                        <Button className="rounded-full bg-emerald-400 text-emerald-950 hover:bg-emerald-300 font-bold px-8 h-12">Subscribe</Button>
                    </div>
                </div>
            </div>
          </section>
        </main>
      ) : (
        // --- Catalog View (Styled) ---
        <div className="max-w-[1400px] mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">All Products</h1>
                    <p className="text-slate-500 mt-1">Showing {filteredProducts.length} results</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-slate-200" onClick={() => setShowFilters(!showFilters)}><Filter className="w-4 h-4 mr-2"/> Filters</Button>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[180px] border-slate-200"><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="featured">Featured</SelectItem><SelectItem value="price-low">Price: Low to High</SelectItem></SelectContent>
                    </Select>
                </div>
            </div>
            
            <div className="flex gap-8 items-start">
                <AnimatePresence>
                    {showFilters && (
                        <motion.aside 
                            initial={{ width: 0, opacity: 0 }} 
                            animate={{ width: 280, opacity: 1 }} 
                            exit={{ width: 0, opacity: 0 }}
                            className="flex-shrink-0 hidden lg:block overflow-hidden"
                        >
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-6 sticky top-24 shadow-sm">
                                <div className="flex justify-between items-center"><span className="font-bold text-slate-900">Refine Selection</span><Button variant="ghost" size="sm" className="text-xs h-auto p-0 text-emerald-600" onClick={() => setFilters({categories:[], subcategories:[], conditionUse:[], therapyType:[], ageGroup:[], deviceFunction:[], useLocation:[], priceRange:[0,50000], availability:[], rating:0})}>Clear</Button></div>
                                {[{title:"Category", k:"categories", opts:mainCategories}, {title:"Condition", k:"conditionUse", opts:conditionUseOptions}].map((g, i) => (
                                    <div key={i}>
                                        <h4 className="font-semibold text-sm mb-3 text-slate-900">{g.title}</h4>
                                        <div className="space-y-2">
                                            {g.opts.map(o => (
                                                <div key={o} className="flex items-center gap-2">
                                                    <Checkbox checked={(filters as any)[g.k].includes(o)} onCheckedChange={() => {
                                                        const current = (filters as any)[g.k];
                                                        setFilters({...filters, [g.k]: current.includes(o) ? current.filter((x:string)=>x!==o) : [...current, o]})
                                                    }} className="data-[state=checked]:bg-emerald-600 border-slate-300"/>
                                                    <label className="text-sm text-slate-600">{o}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
                
                <motion.div layout className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                    {filteredProducts.map(p => (
                        <motion.div key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <ProductCard 
                                product={p} 
                                onAddToCart={addToCart} 
                                onToggleWishlist={toggleWishlist} 
                                isInWishlist={wishlist.includes(p.id)}
                                onViewDetails={() => { setSelectedProduct(p); setCurrentView("product-detail"); }}
                            />
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
      )}
    </div>
  );
}

// --- Polished Components ---

function ProductCard({ product, onAddToCart, onToggleWishlist, isInWishlist, onViewDetails }: any) {
  return (
    <motion.div 
        variants={itemVar}
        whileHover={{ y: -8 }}
        className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 cursor-pointer flex flex-col h-full"
        onClick={onViewDetails}
    >
        <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            
            <div className="absolute top-3 left-3 flex gap-2">
                {product.isBestSeller && <Badge className="bg-white/90 text-slate-900 backdrop-blur-md border-none shadow-sm font-bold">Best Seller</Badge>}
                {product.originalPrice && <Badge className="bg-rose-500 text-white border-none shadow-sm font-bold">Sale</Badge>}
            </div>

            <button 
                onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
                className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
            >
                <Heart size={18} className={isInWishlist ? "fill-rose-500 text-rose-500" : ""} />
            </button>

            {/* Quick Add Overlay */}
            <div className="absolute inset-x-4 bottom-4 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-300">
                <Button 
                    className="w-full rounded-xl bg-white/95 backdrop-blur text-slate-900 hover:bg-emerald-600 hover:text-white shadow-lg border border-slate-100"
                    onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }}
                >
                    <Plus size={18} className="mr-2"/> Quick Add
                </Button>
            </div>
        </div>

        <div className="p-5 flex-1 flex flex-col">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">{product.category}</p>
            <h3 className="font-bold text-slate-900 text-lg leading-snug mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">{product.name}</h3>
            
            <div className="flex items-center gap-1 mb-4">
                <Star size={14} className="fill-amber-400 text-amber-400"/>
                <span className="text-sm font-bold text-slate-900">{product.rating}</span>
                <span className="text-xs text-slate-400 font-medium">({product.reviewCount} reviews)</span>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                    <p className="text-xl font-extrabold text-slate-900">₹{product.price.toLocaleString()}</p>
                    {product.originalPrice && <p className="text-xs text-slate-400 line-through font-medium">₹{product.originalPrice.toLocaleString()}</p>}
                </div>
                {product.inStock ? 
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <ArrowRight size={16}/>
                    </div>
                : <span className="text-xs font-bold text-rose-500">Out of Stock</span>}
            </div>
        </div>
    </motion.div>
  );
}

function ProductDetail({ product, onBack, onAddToCart, isInWishlist, onToggleWishlist, cartCount, onGoToCart }: any) {
    const [quantity, setQuantity] = useState(1);
    return (
        <div className="min-h-screen bg-white pb-20">
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                <Button variant="ghost" onClick={onBack} className="gap-2 font-medium text-slate-600 hover:text-emerald-600"><ChevronLeft size={20}/> Back to Catalog</Button>
                <div className="flex gap-3">
                    <Button variant="outline" size="icon" className="rounded-full" onClick={() => onToggleWishlist(product.id)}><Heart className={isInWishlist ? "fill-rose-500 text-rose-500" : ""}/></Button>
                    <Button variant="outline" size="icon" className="relative rounded-full" onClick={onGoToCart}><ShoppingCart/> {cartCount > 0 && <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white"/>}</Button>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-6 pt-12 grid md:grid-cols-2 gap-16">
                <div className="bg-slate-50 rounded-[3rem] p-12 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <motion.img 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }}
                        src={product.image} 
                        className="max-h-[500px] w-auto mix-blend-multiply relative z-10 shadow-2xl rounded-2xl" 
                    />
                </div>
                <div className="space-y-8 py-4">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Badge className="bg-emerald-100 text-emerald-800 border-none px-3 py-1 text-sm">{product.category}</Badge>
                            {product.inStock && <span className="text-sm font-bold text-emerald-600 flex items-center gap-1"><CheckCircle size={14}/> In Stock</span>}
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">{product.name}</h1>
                        <div className="flex items-baseline gap-4">
                            <p className="text-3xl font-bold text-slate-900">₹{product.price.toLocaleString()}</p>
                            <span className="text-xl font-medium text-slate-400 line-through">₹{product.originalPrice?.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <p className="text-slate-600 leading-relaxed text-lg">{product.description}</p>
                    
                    <div className="flex gap-4 pt-4">
                            <div className="flex items-center border border-slate-200 rounded-full px-2 h-14 bg-white">
                              <Button variant="ghost" size="icon" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="rounded-full w-10 h-10 hover:bg-slate-100"><Minus size={18}/></Button>
                            <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                            <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)} className="rounded-full w-10 h-10 hover:bg-slate-100"><Plus size={18}/></Button>
                        </div>
                        <Button size="lg" className="flex-1 rounded-full bg-slate-900 hover:bg-emerald-600 text-white text-lg h-14 transition-colors shadow-xl shadow-slate-200" onClick={() => onAddToCart(product.id, quantity)}>
                            Add to Cart - ₹{(product.price * quantity).toLocaleString()}
                        </Button>
                    </div>

                    <div className="border-t border-slate-100 pt-10 space-y-6">
                        <h3 className="font-bold text-xl text-slate-900">Product Highlights</h3>
                        <ul className="space-y-4">
                            {product.features.map((f:string, i:number) => (
                                <li key={i} className="flex items-center gap-4 text-slate-700 font-medium">
                                    <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0"><CheckCircle size={16}/></div> 
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ShoppingCartView({ cartItems, onBack, onUpdateQuantity, onRemove, total, onProceed }: any) {
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-5xl mx-auto">
                <Button variant="ghost" onClick={onBack} className="mb-8 hover:bg-white hover:text-emerald-600"><ChevronLeft size={18} className="mr-2"/> Continue Shopping</Button>
                <div className="flex items-end justify-between mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Your Cart</h1>
                    <span className="text-slate-500 font-medium">{cartItems.length} Items</span>
                </div>
                
                {cartItems.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag size={48} className="text-slate-300"/>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Your cart is empty</h3>
                        <p className="text-slate-500 mb-8">Looks like you haven't made your choice yet.</p>
                        <Button onClick={onBack} className="bg-emerald-600 hover:bg-emerald-700 rounded-full px-8 h-12 text-lg">Start Shopping</Button>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map(({product, quantity}: any) => (
                                <motion.div layout key={product.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex gap-6 items-center">
                                    <div className="h-24 w-24 bg-slate-50 rounded-2xl flex-shrink-0 border border-slate-100"><img src={product.image} className="w-full h-full object-cover rounded-2xl"/></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-slate-900 text-lg">{product.name}</h3>
                                            <p className="font-bold text-emerald-700 text-lg">₹{product.price.toLocaleString()}</p>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-4">{product.brand}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center border border-slate-200 rounded-full h-9 px-1">
                                                <button onClick={() => onUpdateQuantity(product.id, quantity - 1)} className="px-3 hover:text-emerald-600"><Minus size={14}/></button>
                                                <span className="text-sm font-bold w-4 text-center">{quantity}</span>
                                                <button onClick={() => onUpdateQuantity(product.id, quantity + 1)} className="px-3 hover:text-emerald-600"><Plus size={14}/></button>
                                            </div>
                                            <button onClick={() => onRemove(product.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-2"><X size={18}/></button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 h-fit sticky top-24">
                            <h3 className="font-bold text-xl mb-6 text-slate-900">Order Summary</h3>
                            <div className="space-y-4 text-slate-600 mb-8 font-medium">
                                <div className="flex justify-between"><span>Subtotal</span><span>₹{total.toLocaleString()}</span></div>
                                <div className="flex justify-between text-emerald-600"><span>Shipping</span><span>Free</span></div>
                                <div className="flex justify-between"><span>Tax</span><span>Calculated at checkout</span></div>
                            </div>
                            <div className="flex justify-between font-extrabold text-2xl mb-8 border-t border-slate-100 pt-6 text-slate-900"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
                            <Button onClick={onProceed} className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-900/10 transition-all hover:scale-[1.02]">Proceed to Checkout</Button>
                            <p className="text-xs text-center text-slate-400 mt-4 flex items-center justify-center gap-2"><Shield size={12}/> Secure SSL Encrypted Payment</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}