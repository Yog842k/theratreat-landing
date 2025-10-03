import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  Star,
  Truck,
  Shield,
  CreditCard,
  Package,
  Plus,
  Minus,
  Zap
} from "lucide-react";

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
  condition: "New" | "Refurbished" | "Used";
  inStock: boolean;
  fastDelivery: boolean;
  description: string;
  features: string[];
}

const products: Product[] = [
  {
    id: "1",
    name: "Professional Massage Therapy Table",
    brand: "TherapyPro",
    price: 15999,
    originalPrice: 18999,
    rating: 4.8,
    reviewCount: 124,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
    category: "Physical Therapy",
    condition: "New",
    inStock: true,
    fastDelivery: true,
    description: "Professional-grade massage table with adjustable height and premium padding",
    features: ["Adjustable Height", "Premium Padding", "Portable Design", "Face Cradle Included"]
  },
  {
    id: "2",
    name: "Digital Blood Pressure Monitor",
    brand: "HealthTrack",
    price: 2499,
    originalPrice: 3299,
    rating: 4.6,
    reviewCount: 89,
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop",
    category: "Monitoring",
    condition: "New",
    inStock: true,
    fastDelivery: true,
    description: "Accurate digital BP monitor with large display and memory function",
    features: ["Large Display", "Memory Storage", "Irregular Heartbeat Detection", "2 User Memory"]
  },
  {
    id: "3",
    name: "Therapy Resistance Bands Set",
    brand: "FlexFit",
    price: 899,
    rating: 4.7,
    reviewCount: 156,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
    category: "Physical Therapy",
    condition: "New",
    inStock: true,
    fastDelivery: false,
    description: "Complete set of resistance bands for physical therapy and rehabilitation",
    features: ["5 Resistance Levels", "Door Anchor", "Exercise Guide", "Carrying Bag"]
  },
  {
    id: "4",
    name: "Ergonomic Lumbar Support Cushion",
    brand: "SpineComfort",
    price: 1299,
    originalPrice: 1699,
    rating: 4.5,
    reviewCount: 73,
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop",
    category: "Support",
    condition: "New",
    inStock: true,
    fastDelivery: true,
    description: "Memory foam lumbar support for office chairs and car seats",
    features: ["Memory Foam", "Breathable Cover", "Adjustable Strap", "Universal Fit"]
  }
];

const categories = ["All Categories", "Physical Therapy", "Monitoring", "Support", "Mobility", "Pain Relief"];
const brands = ["All Brands", "TherapyPro", "HealthTrack", "FlexFit", "SpineComfort"];
const conditions = ["All Conditions", "New", "Refurbished", "Used"];

export function TheraStore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
  const [selectedCondition, setSelectedCondition] = useState("All Conditions");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("popularity");
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<"products" | "cart" | "product-detail">("products");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || product.category === selectedCategory;
    const matchesBrand = selectedBrand === "All Brands" || product.brand === selectedBrand;
    const matchesCondition = selectedCondition === "All Conditions" || product.condition === selectedCondition;
    const matchesPrice = (!priceRange.min || product.price >= parseInt(priceRange.min)) &&
                        (!priceRange.max || product.price <= parseInt(priceRange.max));
    
    return matchesSearch && matchesCategory && matchesBrand && matchesCondition && matchesPrice;
  });

  const addToCart = (productId: string, quantity: number = 1) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + quantity
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prev => ({
        ...prev,
        [productId]: quantity
      }));
    }
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const cartItems = Object.entries(cart).map(([productId, quantity]) => ({
    product: products.find(p => p.id === productId)!,
    quantity
  }));

  const cartTotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  if (currentView === "product-detail" && selectedProduct) {
    return (
      <ProductDetail 
        product={selectedProduct} 
        onBack={() => setCurrentView("products")}
        onAddToCart={addToCart}
        isInWishlist={wishlist.includes(selectedProduct.id)}
        onToggleWishlist={toggleWishlist}
      />
    );
  }

  if (currentView === "cart") {
    return (
      <ShoppingCartView 
        cartItems={cartItems}
        onBack={() => setCurrentView("products")}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        total={cartTotal}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-primary">TheraStore</h1>
          <p className="text-lg text-muted-foreground">
            Professional healthcare equipment and wellness products
          </p>
        </div>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={() => setCurrentView("cart")}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Cart ({cartCount})
          </Button>
          <Button variant="outline">
            <Heart className="w-4 h-4 mr-2" />
            Wishlist ({wishlist.length})
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search products, brands, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-6">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger>
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCondition} onValueChange={setSelectedCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                {conditions.map(condition => (
                  <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Min Price"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
            />

            <Input
              placeholder="Max Price"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
            />

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Product Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-all group">
            <div className="relative">
              <Image
                src={product.image} 
                alt={product.name}
                className="w-full h-48 object-cover rounded-t-lg"
                width={400}
                height={300}
              />
              <Button 
                variant="ghost" 
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              {product.originalPrice && (
                <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </Badge>
              )}
              {product.fastDelivery && (
                <Badge className="absolute bottom-2 left-2 bg-green-500 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  Fast Delivery
                </Badge>
              )}
            </div>

            <CardContent className="p-4 space-y-3">
              <div>
                <Badge variant="outline" className="mb-2">{product.category}</Badge>
                <h3 className="font-semibold line-clamp-2 cursor-pointer hover:text-blue-600"
                    onClick={() => {
                      setSelectedProduct(product);
                      setCurrentView("product-detail");
                    }}>
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground">{product.brand}</p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
                </div>
                <Badge variant={product.condition === "New" ? "secondary" : "outline"}>
                  {product.condition}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => addToCart(product.id)}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    {product.inStock ? "Add to Cart" : "Out of Stock"}
                  </Button>
                  <Button size="sm" variant="outline">
                    Buy Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Banner */}
      <div className="bg-blue-50 rounded-lg p-6">
        <div className="grid gap-6 md:grid-cols-4 text-center">
          <div className="space-y-2">
            <Truck className="w-8 h-8 text-blue-600 mx-auto" />
            <h3 className="font-semibold">Free Shipping</h3>
            <p className="text-sm text-muted-foreground">On orders above ₹2,000</p>
          </div>
          <div className="space-y-2">
            <Shield className="w-8 h-8 text-blue-600 mx-auto" />
            <h3 className="font-semibold">Secure Payment</h3>
            <p className="text-sm text-muted-foreground">100% secure transactions</p>
          </div>
          <div className="space-y-2">
            <Package className="w-8 h-8 text-blue-600 mx-auto" />
            <h3 className="font-semibold">Easy Returns</h3>
            <p className="text-sm text-muted-foreground">30-day return policy</p>
          </div>
          <div className="space-y-2">
            <CreditCard className="w-8 h-8 text-blue-600 mx-auto" />
            <h3 className="font-semibold">Multiple Payment Options</h3>
            <p className="text-sm text-muted-foreground">Card, UPI, Wallet, COD</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductDetail({ product, onBack, onAddToCart, isInWishlist, onToggleWishlist }: {
  product: Product;
  onBack: () => void;
  onAddToCart: (id: string, qty: number) => void;
  isInWishlist: boolean;
  onToggleWishlist: (id: string) => void;
}) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Button variant="outline" onClick={onBack}>
        ← Back to Products
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <Image
            src={product.image} 
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg"
            width={600}
            height={400}
          />
        </div>

        <div className="space-y-6">
          <div>
            <Badge variant="outline" className="mb-2">{product.category}</Badge>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-lg text-muted-foreground">{product.brand}</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{product.rating}</span>
              <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>
            <Badge variant={product.condition === "New" ? "secondary" : "outline"}>
              {product.condition}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
              {product.originalPrice && (
                <Badge className="bg-red-500 text-white">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">Inclusive of all taxes</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Key Features:</h3>
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span>Quantity:</span>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2 border rounded">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button 
                className="flex-1" 
                onClick={() => onAddToCart(product.id, quantity)}
                disabled={!product.inStock}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
              <Button variant="outline" onClick={() => onToggleWishlist(product.id)}>
                <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            <Button variant="outline" className="w-full" size="lg">
              Buy Now
            </Button>
          </div>

          {product.fastDelivery && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-600">Fast Delivery Available</span>
              </div>
              <p className="text-sm text-green-700 mt-1">Get it delivered within 24-48 hours</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ShoppingCartView({ cartItems, onBack, onUpdateQuantity, onRemove, total }: {
  cartItems: { product: Product; quantity: number }[];
  onBack: () => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  total: number;
}) {
  const deliveryFee = total > 2000 ? 0 : 99;
  const finalTotal = total + deliveryFee;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Continue Shopping
        </Button>
        <h2 className="text-2xl font-bold">Shopping Cart ({cartItems.length})</h2>
      </div>

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">Add some products to get started</p>
            <Button onClick={onBack}>Start Shopping</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(({ product, quantity }) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    <Image
                      src={product.image} 
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded"
                      width={80}
                      height={80}
                    />
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.brand}</p>
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold">₹{product.price.toLocaleString()}</span>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="px-2">{quantity}</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onRemove(product.id)}
                          className="text-red-500"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{(product.price * quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                </div>
                {total > 2000 && (
                  <p className="text-sm text-green-600">🎉 You saved ₹99 on delivery!</p>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>
              
              <Button className="w-full" size="lg">
                <CreditCard className="w-4 h-4 mr-2" />
                Proceed to Checkout
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                <Shield className="w-4 h-4 inline mr-1" />
                Secure checkout with 256-bit SSL encryption
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
