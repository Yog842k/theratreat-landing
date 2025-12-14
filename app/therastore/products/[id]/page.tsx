'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ShoppingCart, 
  Heart, 
  Star,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Share2,
  Box,
  Activity,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/components/auth/NewAuthContext';

// --- Types ---
interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  category: string;
  condition: string;
  stock: number;
  fastDelivery: boolean;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  warranty?: string;
}

interface StoreReview {
    _id: string;
    productId: string;
    userName: string;
    rating: number; // 1-5
    title?: string;
    comment: string;
    images?: string[];
    helpful: number;
    verified?: boolean;
    date: string; // ISO
}

export default function PremiumProductPage() {
    const { user: authUser, isAuthenticated } = useAuth?.() || ({} as any);
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
    const [inWishlist, setInWishlist] = useState(false);
    const [reviews, setReviews] = useState<StoreReview[]>([]);
    const [accountName, setAccountName] = useState<string>('');
    const [reviewRating, setReviewRating] = useState<number>(5);
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewComment, setReviewComment] = useState('');

    const syncServerCartItem = async (p: Product, quantity: number) => {
        try {
            const token = localStorage.getItem('token')
                || localStorage.getItem('authToken')
                || localStorage.getItem('auth_token')
                || localStorage.getItem('access_token');
            if (!token) return;
            await fetch('/api/therastore/cart', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId: String(p._id),
                    name: p.name,
                    price: Number(p.price || 0),
                    quantity: Number(quantity),
                }),
            });
        } catch {}
    };

    const addToCart = () => {
        if (!product) return;
        const cart: any[] = JSON.parse(localStorage.getItem('therastore_cart') || '[]');
        const idx = cart.findIndex((i) => String(i._id) === String(product._id));
        const toAdd = {
            _id: product._id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            originalPrice: product.originalPrice,
            images: product.images || [],
            quantity: quantity,
            stock: product.stock ?? 0,
        };
        if (idx >= 0) {
            const newQty = Math.min((cart[idx].quantity || 1) + quantity, product.stock ?? 9999);
            cart[idx] = { ...cart[idx], quantity: newQty };
        } else {
            cart.push(toAdd);
        }
        localStorage.setItem('therastore_cart', JSON.stringify(cart));
        // Sync only this item to server cart with its new quantity
        const current = cart.find((i) => String(i._id) === String(product._id));
        const q = current?.quantity || quantity || 1;
        syncServerCartItem(product, q);
    };

    // --- Fetch from API ---
    useEffect(() => {
        const id = (params as any)?.id;
        if (!id) return;
        let aborted = false;
        setLoading(true);
        (async () => {
            try {
                const res = await fetch(`/api/therastore/products/${encodeURIComponent(id)}`, {
                    headers: { 'x-request-id': crypto.randomUUID() },
                    cache: 'no-store',
                });
                const json = await res.json();
                const p = json?.data;
                if (!aborted) {
                    setProduct(p || null);
                    setLoading(false);
                }
            } catch (e) {
                if (!aborted) {
                    setProduct(null);
                    setLoading(false);
                }
            }
        })();
        return () => { aborted = true; };
    }, [params]);

    // Load wishlist status and product reviews when product changes
    useEffect(() => {
        if (!product) return;
        (async () => {
            try {
                const wl: any[] = JSON.parse(localStorage.getItem('therastore_wishlist') || '[]');
                setInWishlist(wl.some((i) => String(i._id) === String(product._id)));
            } catch {}
            try {
                const res = await fetch(`/api/therastore/reviews?productId=${encodeURIComponent(String(product._id))}`, { credentials: 'include' });
                const json = await res.json();
                if (json.ok && Array.isArray(json.reviews)) {
                    setReviews(json.reviews);
                } else {
                    const all: StoreReview[] = JSON.parse(localStorage.getItem('therastore_reviews') || '[]');
                    setReviews(all.filter((r) => String(r.productId) === String(product._id)));
                }
            } catch {
                try {
                    const all: StoreReview[] = JSON.parse(localStorage.getItem('therastore_reviews') || '[]');
                    setReviews(all.filter((r) => String(r.productId) === String(product._id)));
                } catch {}
            }
            // Prefer authenticated context name immediately if available
            try {
                const name = (authUser as any)?.name || (authUser as any)?.fullName;
                if (name && typeof name === 'string' && name.trim().length > 0) {
                    setAccountName(name.trim());
                    localStorage.setItem('user_name', name.trim());
                }
            } catch {}
        })();
    }, [product]);

    // Fetch authenticated user name from API if available
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                // Include Authorization header if we have a stored token
                let headers: Record<string, string> = { 'x-request-id': crypto.randomUUID() };
                try {
                    const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token') || localStorage.getItem('access_token');
                    if (token) headers['Authorization'] = `Bearer ${token}`;
                } catch {}
                // Include cookies for session-based auth
                const res = await fetch('/api/auth/me', { headers, cache: 'no-store', credentials: 'include' as RequestCredentials });
                if (!res.ok) return;
                const json = await res.json();
                const name = json?.data?.user?.name || json?.user?.name || json?.data?.name || json?.name;
                if (!cancelled && name && typeof name === 'string' && name.trim().length > 0) {
                    setAccountName(name.trim());
                    try { localStorage.setItem('user_name', name.trim()); } catch {}
                }
            } catch {}
        })();
        return () => { cancelled = true; };
    }, []);

    const toggleWishlist = async () => {
        if (!product) return;
        try {
            const wl: any[] = JSON.parse(localStorage.getItem('therastore_wishlist') || '[]');
            const exists = wl.findIndex((i) => String(i._id) === String(product._id));
            if (exists >= 0) {
                wl.splice(exists, 1);
                setInWishlist(false);
                // Try server removal
                try {
                    const userId = localStorage.getItem('user_id');
                    if (userId) {
                        await fetch('/api/therastore/wishlist', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ userId, action: 'remove', productId: String(product._id) }),
                        });
                    }
                } catch {}
            } else {
                wl.push({
                    _id: product._id,
                    name: product.name,
                    brand: product.brand,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    rating: product.rating,
                    reviewCount: product.reviewCount,
                    stock: product.stock,
                    category: product.category,
                    images: product.images || [],
                    fastDelivery: product.fastDelivery,
                });
                setInWishlist(true);
                // Try server add
                try {
                    const userId = localStorage.getItem('user_id');
                    if (userId) {
                        await fetch('/api/therastore/wishlist', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ userId, action: 'add', productId: String(product._id) }),
                        });
                    }
                } catch {}
            }
            localStorage.setItem('therastore_wishlist', JSON.stringify(wl));
        } catch {}
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;
        // Use fetched account name; fallback to stored name/email
        let name = accountName && accountName.trim().length > 0 ? accountName.trim() : 'Account User';
        if (name === 'Account User') {
            try {
                const storedName = localStorage.getItem('user_name') || '';
                const storedEmail = localStorage.getItem('user_email') || '';
                if (storedName && storedName.trim().length > 0) {
                    name = storedName.trim();
                } else if (storedEmail) {
                    name = storedEmail.split('@')[0] || 'Account User';
                }
            } catch {}
        }
        if (!reviewComment.trim()) return;
        const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token') || localStorage.getItem('access_token') || undefined;
        try {
            const resp = await fetch('/api/therastore/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                credentials: 'include',
                body: JSON.stringify({
                    productId: product._id,
                    rating: Math.min(5, Math.max(1, Number(reviewRating) || 5)),
                    comment: reviewComment.trim(),
                }),
            });
            const json = await resp.json();
            if (json.ok && json.review) {
                setReviews((r) => [json.review, ...r]);
            } else {
                throw new Error(json.error || 'Failed to submit review');
            }
            setReviewTitle('');
            setReviewComment('');
            setReviewRating(5);
        } catch (err) {
            // Fallback to localStorage if unauthorized or offline
            const newReview: StoreReview = {
                _id: Date.now().toString(),
                productId: product._id,
                userName: name,
                rating: Math.min(5, Math.max(1, Number(reviewRating) || 5)),
                title: reviewTitle.trim() || undefined,
                comment: reviewComment.trim(),
                images: [],
                helpful: 0,
                verified: false,
                date: new Date().toISOString(),
            };
            try {
                const all: StoreReview[] = JSON.parse(localStorage.getItem('therastore_reviews') || '[]');
                const updated = [...all, newReview];
                localStorage.setItem('therastore_reviews', JSON.stringify(updated));
                setReviews((r) => [newReview, ...r]);
            } catch {}
            setReviewTitle('');
            setReviewComment('');
            setReviewRating(5);
        }
    };

  if (loading) return <LoadingScreen />;
  if (!product) return <div className="p-20 text-center">Product Not Found</div>;

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;
    const localAvgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length) : undefined;
    const displayRating = typeof localAvgRating === 'number' ? Math.round(localAvgRating * 10) / 10 : (product.rating || 0);

  return (
    <div className="min-h-screen bg-[#F0FDF4] text-slate-900 font-sans selection:bg-[#228B22] selection:text-white">
      
      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-200/40 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-200/40 rounded-full blur-[120px]" />
      </div>

      {/* --- Navbar (Floating Glass) --- */}
            <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
                <div className="flex items-center justify-between w-full max-w-5xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl shadow-green-900/5 rounded-full px-6 py-3">
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-full hover:bg-green-50 text-slate-600 gap-2">
                        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
                    </Button>
                    <span className="font-bold text-slate-800 text-sm tracking-tight">{product.brand} / {product.name}</span>
                    <Button variant="ghost" size="icon" className="rounded-full hover:text-[#228B22]">
                        <Share2 className="w-4 h-4" />
                    </Button>
                </div>
            </nav>

      {/* --- Main Content --- */}
      <main className="relative z-10 pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
            
            {/* --- LEFT: Cinematic Gallery (Sticky) --- */}
            <div className="lg:col-span-7 sticky top-32 space-y-6">
                <div className="relative aspect-[4/3] w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-green-900/10 border-4 border-white">
                    <Image 
                        src={product.images[activeImage]} 
                        alt={product.name}
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Floating Badges */}
                    <div className="absolute top-6 left-6 flex gap-2">
                        {product.fastDelivery && (
                            <div className="bg-white/90 backdrop-blur text-[#228B22] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                                <Zap className="w-3 h-3 fill-current" /> Fast Delivery
                            </div>
                        )}
                        {discount > 0 && (
                            <div className="bg-[#228B22] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                                -{discount}% OFF
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Thumbnails */}
                {product.images.length > 1 && (
                    <div className="flex justify-center gap-3">
                        {product.images.map((img, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setActiveImage(idx)}
                                className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                                    activeImage === idx 
                                    ? 'border-[#228B22] shadow-lg scale-110 z-10' 
                                    : 'border-white/50 opacity-60 hover:opacity-100 hover:scale-105'
                                }`}
                            >
                                <Image src={img} alt="thumb" fill className="object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* --- RIGHT: Product Console --- */}
            <div className="lg:col-span-5 space-y-10">
                
                {/* 1. Title & Rating */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-[#228B22]/30 text-[#228B22] bg-green-50">{product.category}</Badge>
                        <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                            <Star className="w-4 h-4 fill-current" /> {displayRating} <span className="text-slate-400 font-normal">({reviews.length} reviews)</span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                        {product.name}
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        {product.description}
                    </p>
                </div>

                {/* 2. Glass Purchase Card */}
                <div className="bg-white/60 backdrop-blur-xl border border-white/60 p-6 rounded-[2rem] shadow-xl shadow-green-900/5 space-y-6">
                    <div className="flex items-end justify-between">
                         <div>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Price</p>
                             <div className="flex items-center gap-3">
                                 <span className="text-4xl font-black text-slate-900">₹{product.price.toLocaleString()}</span>
                                 {product.originalPrice && (
                                     <span className="text-xl text-slate-400 line-through font-medium decoration-2 decoration-slate-300">
                                         ₹{product.originalPrice.toLocaleString()}
                                     </span>
                                 )}
                             </div>
                         </div>
                         <div className="text-right">
                             {product.stock > 0 ? (
                                 <div className="flex flex-col items-end">
                                     <span className="flex items-center gap-1.5 text-[#228B22] font-bold text-sm bg-green-100 px-3 py-1 rounded-full">
                                         <span className="relative flex h-2 w-2">
                                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                           <span className="relative inline-flex rounded-full h-2 w-2 bg-[#228B22]"></span>
                                         </span>
                                         In Stock
                                     </span>
                                 </div>
                             ) : (
                                 <Badge variant="destructive">Out of Stock</Badge>
                             )}
                         </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4 bg-white/50 p-2 rounded-2xl border border-white/50">
                        <div className="flex-1 flex items-center justify-between bg-white rounded-xl px-2 h-12 shadow-sm">
                            <button 
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-500 transition"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                            <button 
                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                disabled={quantity >= product.stock}
                                className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-500 transition disabled:opacity-30"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={toggleWishlist}
                            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                            className={`h-12 w-12 rounded-xl border transition-all bg-white shadow-sm ${inWishlist ? 'border-red-200 bg-red-50 text-red-500' : 'border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500'}`}
                        >
                            <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                    </div>

                    {/* Primary Action */}
                    <div className="grid gap-3">
                         <Button 
                            className="h-14 rounded-2xl text-lg font-bold bg-[#228B22] hover:bg-[#1b6f1b] text-white shadow-lg shadow-[#228B22]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            disabled={product.stock === 0}
                            onClick={() => { addToCart(); router.push('/therastore/cart'); }}
                         >
                            Add to Cart — ₹{(product.price * quantity).toLocaleString()}
                         </Button>
                         <p className="text-center text-xs text-slate-400 font-medium">Free shipping & 30-day returns included.</p>
                    </div>
                </div>

                {/* 3. Bento Features Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Feature 1 */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-[#228B22] mb-3">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">Therapeutic</h3>
                        <p className="text-xs text-slate-500 mt-1">Medically graded support</p>
                    </div>
                    {/* Feature 2 */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">Warranty</h3>
                        <p className="text-xs text-slate-500 mt-1">{product.warranty}</p>
                    </div>
                    {/* Specifications List */}
                    <div className="col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Box className="w-4 h-4 text-[#228B22]" /> Specifications
                        </h3>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                            {Object.entries(product.specifications).map(([key, val], i) => (
                                <div key={i} className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{key}</span>
                                    <span className="text-sm font-semibold text-slate-900">{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
                {/* --- Reviews Section --- */}
                <section className="mt-16">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Write Review */}
                        <div className="lg:col-span-1 bg-white/70 backdrop-blur rounded-3xl border border-white/60 p-6 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Write a Review</h3>
                            <form onSubmit={submitReview} className="space-y-4">
                                {/* Name is taken from account automatically */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Rating</label>
                                    <div className="flex items-center gap-2">
                                        {[1,2,3,4,5].map((s) => (
                                            <button type="button" key={s} onClick={()=>setReviewRating(s)}
                                                className={`p-1 rounded ${reviewRating>=s? 'text-yellow-500' : 'text-slate-300'}`}
                                                aria-label={`Rate ${s} star`}>
                                                <Star className={`w-6 h-6 ${reviewRating>=s? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
                                    <input value={reviewTitle} onChange={(e)=>setReviewTitle(e.target.value)} placeholder="Great product!"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Comment</label>
                                    <textarea required value={reviewComment} onChange={(e)=>setReviewComment(e.target.value)} rows={4} placeholder="Share your experience..."
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
                                </div>
                                <Button type="submit" className="w-full bg-[#228B22] hover:bg-[#1b6f1b]">Submit Review</Button>
                                <p className="text-[11px] text-slate-400">Reviews are saved to your account when signed in; otherwise stored locally.</p>
                            </form>
                        </div>
                        {/* Reviews List */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-900">Customer Reviews</h3>
                                <span className="text-sm text-slate-500">{reviews.length} review{reviews.length===1?'':'s'}</span>
                            </div>
                            {reviews.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-slate-100 p-6 text-slate-600">No reviews yet. Be the first to review.</div>
                            ) : (
                                reviews.slice(0,5).map((r) => (
                                    <div key={r._id} className="bg-white rounded-2xl border border-slate-100 p-6">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                                    {r.userName?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{r.userName}</div>
                                                    <div className="text-xs text-slate-500">{new Date(r.date).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[1,2,3,4,5].map((s)=>(
                                                    <Star key={s} className={`w-4 h-4 ${s<=r.rating?'fill-yellow-400 text-yellow-400':'text-slate-300'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        {r.title && <div className="font-semibold mb-1">{r.title}</div>}
                                        <div className="text-slate-700">{r.comment}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
      </main>
    </div>
  );
}

// --- Minimal Loading State ---
function LoadingScreen() {
    return (
        <div className="min-h-screen bg-[#F0FDF4] flex items-center justify-center">
             <div className="relative">
                 <div className="w-20 h-20 border-4 border-[#228B22]/20 rounded-full animate-spin border-t-[#228B22]"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-2 h-2 bg-[#228B22] rounded-full"></div>
                 </div>
             </div>
        </div>
    )
}