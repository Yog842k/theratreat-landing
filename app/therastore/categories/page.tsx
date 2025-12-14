'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Package } from 'lucide-react';
import { therastoreCategories } from '@/constants/app-data';

interface Category {
  name: string;
  count: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categories directly from DB-backed API
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/therastore/categories');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data as Category[]);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const categoryImages = [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6 animate-in fade-in slide-in-from-top-4">
            <Package className="w-4 h-4" />
            <span className="text-sm font-medium">Browse Collections</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 animate-in fade-in slide-in-from-left-4">
            Shop by Category
          </h1>
          <p className="text-xl text-emerald-50 max-w-2xl animate-in fade-in slide-in-from-left-6">
            Explore our curated collections of premium healthcare equipment
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-0">
                <div className="aspect-[4/3] bg-gray-100 rounded-lg animate-pulse"></div>
              </Card>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <Card className="border-0">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No categories found</h3>
              <p className="text-muted-foreground">Once categories are added in Admin, they will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {categories.map((category, idx) => {
              const staticMatch = therastoreCategories.find(c => c.label === category.name);
              const subcats = staticMatch?.subcategories || [];
              return (
                <div key={category.name} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <button className="w-full text-left">
                    <div className="relative">
                      <div className="relative aspect-[4/1]">
                        <Image
                          src={categoryImages[idx % categoryImages.length]}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center px-6">
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <h3 className="text-white font-extrabold text-2xl">{category.name}</h3>
                            <p className="text-white/80 text-sm">{category.count} products</p>
                          </div>
                          <ArrowRight className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Accordion content: subcategory cards */}
                  {subcats.length > 0 && (
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {subcats.map((s, sIdx) => (
                        <Link
                          key={s.key}
                          href={`/therastore/products?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(s.label)}`}
                          className="group"
                        >
                          <Card className="border border-gray-100 hover:border-emerald-300 hover:shadow-lg transition-all">
                            <CardContent className="p-5">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm text-gray-500">Sub-category</div>
                                  <div className="font-semibold text-gray-900 group-hover:text-emerald-700">{s.label}</div>
                                </div>
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Explore</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

