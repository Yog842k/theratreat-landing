'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, Plus, X, Image as ImageIcon, 
  Package, DollarSign, List, Tag, Layers, ChevronLeft, UploadCloud
} from 'lucide-react';
import { toast } from 'sonner';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Separate state for raw files (for backend upload)
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [categoriesApi, setCategoriesApi] = useState<{ name: string; count?: number }[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    price: '',
    originalPrice: '',
    category: '',
    subcategory: '',
    sku: '',
    condition: 'New',
    stock: '',
    images: [] as string[], // Used for Previews
    features: [] as string[],
    tags: [] as string[],
    isActive: true,
    isFeatured: false,
    fastDelivery: false,
    warranty: '',
    weight: '',
    dimensions: '',
    specifications: {} as Record<string, string>,
    gst: ''
  });

  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // Load categories from API
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/therastore/categories');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCategoriesApi(json.data);
        }
      } catch {}
    })();
  }, []);

  // Derive subcategories from static constants by selected category
  useEffect(() => {
    (async () => {
      if (!formData.category) { setSubcategories([]); return; }
      try {
        const mod = await import('@/constants/app-data');
        const statics = mod.therastoreCategories;
        const match = statics.find((c: any) => c.label === formData.category);
        setSubcategories((match?.subcategories || []).map((s: any) => s.label));
      } catch {
        setSubcategories([]);
      }
    })();
  }, [formData.category]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- Image Handling Logic Changed Here ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      
      // 1. Store raw files for submission
      setImageFiles(prev => [...prev, ...newFiles]);

      // 2. Create local preview URLs
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, ...newPreviews] 
      }));
    }
  };

  const removeImage = (index: number) => {
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(formData.images[index]);

    setFormData(prev => ({ 
      ...prev, 
      images: prev.images.filter((_, i) => i !== index) 
    }));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  // -----------------------------------------

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
  };

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: { ...prev.specifications, [newSpecKey.trim()]: newSpecValue.trim() }
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Upload images first (if any), then submit JSON to backend API.
    let uploadedUrls: string[] = [];
    if (imageFiles.length > 0) {
      try {
        const fd = new FormData();
        imageFiles.forEach((f) => fd.append('files', f));
        const upRes = await fetch('/api/therastore/upload', { method: 'POST', body: fd, headers: { 'x-request-id': crypto.randomUUID() } });
        const upJson = await upRes.json();
        if (!upRes.ok || !upJson.success) {
          throw new Error(upJson.error || 'Image upload failed');
        }
        uploadedUrls = upJson.urls || [];
      } catch (err: any) {
        // Fallback: proceed without images
        toast.warning('Image upload failed, saving without images');
        uploadedUrls = [];
      }
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      brand: formData.brand,
      price: formData.price,
      originalPrice: formData.originalPrice,
      category: formData.category,
      subcategory: formData.subcategory,
      images: uploadedUrls,
      stock: formData.stock,
      sku: formData.sku,
      condition: formData.condition,
      features: formData.features,
      specifications: formData.specifications,
      tags: formData.tags,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      fastDelivery: formData.fastDelivery,
      weight: formData.weight,
      dimensions: formData.dimensions,
      warranty: formData.warranty,
      gst: formData.gst,
    };

    setLoading(true);
    try {
      const res = await fetch('/api/therastore/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-request-id': crypto.randomUUID() },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save product');
      }
      toast.success('Product saved');
      router.push('/therastore/products');
    } catch (error: any) {
      toast.error(error.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <form onSubmit={handleSubmit}>
        
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-4 md:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="rounded-full hover:bg-slate-100 text-slate-500"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Add New Product</h1>
                <p className="text-xs text-slate-500">TheraStore Inventory</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                className="hidden sm:flex"
              >
                Discard
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 shadow-lg transition-all"
              >
                {loading ? 'Saving...' : 'Save Product'}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN - MAIN CONTENT */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* General Info Card */}
              <Card className="border-slate-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white rounded-md border border-slate-100 shadow-sm">
                      <Package className="w-4 h-4 text-emerald-600" />
                    </div>
                    <CardTitle className="text-lg text-slate-800">Product Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-600">Product Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g. Advanced Physio Ball"
                      className="text-lg font-medium border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand" className="text-slate-600">Brand</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        className="focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sku" className="text-slate-600">SKU</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => handleInputChange('sku', e.target.value)}
                        placeholder="Auto-generated"
                        className="font-mono text-sm focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-slate-600">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={5}
                      className="resize-none focus:ring-emerald-500/20 focus:border-emerald-500"
                      placeholder="Describe the product details..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Images Card (UPDATED) */}
              <Card className="border-slate-100 shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white rounded-md border border-slate-100 shadow-sm">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <CardTitle className="text-lg text-slate-800">Media</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  
                  {/* File Upload Area */}
                  <div 
                    onClick={triggerFileInput}
                    className="border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-400 transition-all rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer group"
                  >
                    <div className="p-4 rounded-full bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform mb-3">
                       <UploadCloud className="w-6 h-6 text-emerald-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">Click to upload image</p>
                    <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      multiple 
                      className="hidden" 
                      onChange={handleImageUpload}
                    />
                  </div>

                  {/* Image Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="group relative aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shadow-sm">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => removeImage(idx)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* Order Badge */}
                        <div className="absolute bottom-1 left-1 bg-white/90 backdrop-blur text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                           {idx === 0 ? 'Main' : `#${idx + 1}`}
                        </div>
                      </div>
                    ))}
                    
                    {formData.images.length === 0 && (
                       <div className="col-span-full py-2 text-center text-sm text-slate-400">
                          No images selected
                       </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Specifications Card */}
              <Card className="border-slate-100 shadow-sm">
                 <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white rounded-md border border-slate-100 shadow-sm">
                      <List className="w-4 h-4 text-emerald-600" />
                    </div>
                    <CardTitle className="text-lg text-slate-800">Specifications & Details</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Physical Specs */}
                  <div className="grid grid-cols-3 gap-4">
                     <div className="space-y-2">
                        <Label className="text-xs text-slate-500 uppercase font-semibold">Warranty</Label>
                        <Input value={formData.warranty} onChange={(e) => handleInputChange('warranty', e.target.value)} className="h-9" placeholder="e.g. 1 Year" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-xs text-slate-500 uppercase font-semibold">Weight</Label>
                        <Input value={formData.weight} onChange={(e) => handleInputChange('weight', e.target.value)} className="h-9" placeholder="e.g. 1.5kg" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-xs text-slate-500 uppercase font-semibold">Dimensions</Label>
                        <Input value={formData.dimensions} onChange={(e) => handleInputChange('dimensions', e.target.value)} className="h-9" placeholder="L x W x H" />
                     </div>
                  </div>
                  
                  <Separator />

                  {/* Dynamic Specs */}
                  <div className="space-y-3">
                    <Label className="text-slate-600">Technical Specifications</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newSpecKey}
                        onChange={(e) => setNewSpecKey(e.target.value)}
                        placeholder="Name (e.g. Material)"
                        className="flex-1"
                      />
                      <Input
                        value={newSpecValue}
                        onChange={(e) => setNewSpecValue(e.target.value)}
                        placeholder="Value (e.g. Latex)"
                        className="flex-1"
                      />
                      <Button type="button" onClick={addSpecification} variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="rounded-md border border-slate-100 divide-y divide-slate-100">
                      {Object.entries(formData.specifications).length === 0 && (
                          <div className="p-4 text-center text-sm text-slate-400">No specifications added</div>
                      )}
                      {Object.entries(formData.specifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition-colors">
                          <div className="flex gap-2 text-sm">
                            <span className="font-medium text-slate-700">{key}:</span>
                            <span className="text-slate-600">{value}</span>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeSpecification(key)} className="h-6 w-6 p-0 text-slate-400 hover:text-red-500">
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


            {/* RIGHT COLUMN - SIDEBAR */}
            <div className="space-y-8">
              
              {/* Status Card */}
              <Card className="border-slate-100 shadow-sm">
                 <CardHeader className="pb-3">
                   <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Availability</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium">Active Status</Label>
                        <p className="text-xs text-slate-500">Show product on store</p>
                      </div>
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    </div>
                    
                    <div className="space-y-3 pt-2">
                       <div className="flex items-center justify-between">
                          <Label className="text-slate-600 font-normal">Featured Product</Label>
                          <Switch checked={formData.isFeatured} onCheckedChange={(c) => handleInputChange('isFeatured', c)} className="scale-75 data-[state=checked]:bg-emerald-600" />
                       </div>
                       <Separator />
                       <div className="flex items-center justify-between">
                          <Label className="text-slate-600 font-normal">Fast Delivery</Label>
                          <Switch checked={formData.fastDelivery} onCheckedChange={(c) => handleInputChange('fastDelivery', c)} className="scale-75 data-[state=checked]:bg-emerald-600" />
                       </div>
                    </div>
                 </CardContent>
              </Card>

              {/* Pricing Card */}
              <Card className="border-slate-100 shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                   <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white rounded border border-slate-100">
                         <DollarSign className="w-4 h-4 text-emerald-600" />
                      </div>
                      <CardTitle className="text-base text-slate-800">Pricing & Inventory</CardTitle>
                   </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                        <Input
                          id="price"
                          type="number"
                          className="pl-7 focus:ring-emerald-500/20 focus:border-emerald-500"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice" className="text-slate-500 text-xs uppercase">Compare At</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                        <Input
                          id="originalPrice"
                          type="number"
                          className="pl-7 text-slate-500 focus:ring-emerald-500/20"
                          value={formData.originalPrice}
                          onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                     <div className="space-y-2">
                       <Label htmlFor="stock">Stock</Label>
                       <Input 
                          id="stock" 
                          type="number" 
                          value={formData.stock}
                          onChange={(e) => handleInputChange('stock', e.target.value)}
                       />
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="condition">Condition</Label>
                       <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Refurbished">Refurbished</SelectItem>
                          <SelectItem value="Used">Used</SelectItem>
                        </SelectContent>
                      </Select>
                     </div>
                  </div>
                </CardContent>
              </Card>

              {/* Organization Card */}
              <Card className="border-slate-100 shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                   <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white rounded border border-slate-100">
                         <Layers className="w-4 h-4 text-emerald-600" />
                      </div>
                      <CardTitle className="text-base text-slate-800">Organization</CardTitle>
                   </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="focus:ring-emerald-500/20">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesApi.map(cat => (
                          <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Sub-category</Label>
                    <Select value={formData.subcategory} onValueChange={(value) => handleInputChange('subcategory', value)}>
                      <SelectTrigger className="focus:ring-emerald-500/20">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories.map(sc => (
                          <SelectItem key={sc} value={sc}>{sc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gst">GST (%)</Label>
                    <Input id="gst" type="number" value={formData.gst} onChange={(e) => handleInputChange('gst', e.target.value)} placeholder="e.g., 18" />
                  </div>

                  <Separator />

                  {/* Features Input */}
                  <div className="space-y-3">
                     <Label className="flex items-center gap-2">
                        <List className="w-3 h-3 text-emerald-600" />
                        Features
                     </Label>
                     <div className="flex gap-2">
                       <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="Add feature..." className="h-8 text-sm" 
                           onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                       />
                       <Button type="button" size="sm" onClick={addFeature} variant="ghost" className="h-8 w-8 p-0 border border-slate-200">
                          <Plus className="w-4 h-4" />
                       </Button>
                     </div>
                     <div className="flex flex-wrap gap-1.5">
                        {formData.features.map((f, i) => (
                           <Badge key={i} variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 font-normal pr-1">
                              {f}
                              <X className="w-3 h-3 ml-1 cursor-pointer hover:text-emerald-900" onClick={() => removeFeature(i)} />
                           </Badge>
                        ))}
                     </div>
                  </div>

                  <Separator />

                  {/* Tags Input */}
                  <div className="space-y-3">
                     <Label className="flex items-center gap-2">
                        <Tag className="w-3 h-3 text-emerald-600" />
                        Tags
                     </Label>
                     <div className="flex gap-2">
                       <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add tag..." className="h-8 text-sm"
                           onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                       />
                       <Button type="button" size="sm" onClick={addTag} variant="ghost" className="h-8 w-8 p-0 border border-slate-200">
                          <Plus className="w-4 h-4" />
                       </Button>
                     </div>
                     <div className="flex flex-wrap gap-1.5">
                        {formData.tags.map((t, i) => (
                           <Badge key={i} variant="outline" className="text-slate-600 border-slate-200 font-normal pr-1">
                              {t}
                              <X className="w-3 h-3 ml-1 cursor-pointer hover:text-slate-900" onClick={() => removeTag(i)} />
                           </Badge>
                        ))}
                     </div>
                  </div>

                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </form>
    </div>
  );
}