'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Package } from 'lucide-react';

interface Category {
  name: string;
  count: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/therastore/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
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
              <p className="text-muted-foreground">Categories will appear here once products are added</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, idx) => (
              <Link 
                key={category.name} 
                href={`/therastore/products?category=${category.name}`}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <Card className="group hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden cursor-pointer h-full hover:scale-105">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={categoryImages[idx % categoryImages.length]}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-colors"></div>
                    <div className="absolute inset-0 bg-emerald-600/0 group-hover:bg-emerald-600/20 transition-colors duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="font-bold text-2xl mb-2 group-hover:translate-y-[-4px] transition-transform">{category.name}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-white/90">{category.count} products</p>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

