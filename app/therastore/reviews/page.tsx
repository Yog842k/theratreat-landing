'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Star,
  Filter,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Package
} from 'lucide-react';

interface Review {
  _id: string;
  productId: string;
  productName: string;
  productImage: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
  images?: string[];
}

export default function ReviewsPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = () => {
    try {
      const saved = localStorage.getItem('therastore_reviews');
      if (saved) {
        let allReviews = JSON.parse(saved);
        if (productId) {
          allReviews = allReviews.filter((r: Review) => r.productId === productId);
        }
        setReviews(allReviews);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const filteredReviews = reviews
    .filter(review => filter === 'all' || review.rating.toString() === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'helpful':
          return b.helpful - a.helpful;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
      : 0
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
            Product Reviews
          </h1>
          <p className="text-xl text-gray-600">
            {productId ? 'Reviews for this product' : 'All customer reviews'}
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Rating Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 sticky top-4 animate-in fade-in slide-in-from-left-4">
                <div className="text-center mb-6">
                  <div className="text-5xl font-extrabold text-gray-900 mb-2">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= Math.round(averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600">
                    Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                  </p>
                </div>

                <div className="space-y-3">
                  {ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center gap-3">
                      <button
                        onClick={() => setFilter(filter === rating.toString() ? 'all' : rating.toString() as any)}
                        className={`flex items-center gap-1 text-sm font-semibold transition-colors ${
                          filter === rating.toString() ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'
                        }`}
                      >
                        {rating}
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </button>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setFilter('all')}
                    className={`w-full px-4 py-2 rounded-xl font-semibold transition-colors ${
                      filter === 'all'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Show All
                  </button>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-3">
              {/* Sort Options */}
              <div className="flex items-center justify-between mb-6 animate-in fade-in slide-in-from-right-4">
                <p className="text-gray-600">
                  Showing {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}
                </p>
                <div className="flex items-center gap-3">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-full font-semibold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="helpful">Most Helpful</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                {filteredReviews.map((review, idx) => (
                  <div
                    key={review._id}
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{review.userName}</h3>
                          {review.verified && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {review.title && (
                      <h4 className="font-bold text-lg text-gray-900 mb-2">{review.title}</h4>
                    )}

                    <p className="text-gray-700 mb-4">{review.comment}</p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mb-4">
                        {review.images.map((img, imgIdx) => (
                          <img
                            key={imgIdx}
                            src={img}
                            alt="Review"
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                      <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        Helpful ({review.helpful})
                      </button>
                      <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors">
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                      {!productId && (
                        <Link
                          href={`/therastore/products/${review.productId}`}
                          className="ml-auto flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
                        >
                          <Package className="w-4 h-4" />
                          View Product
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-4">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
              <Star className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No reviews yet</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Be the first to review this product
            </p>
            <Link href="/therastore/products">
              <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105">
                Browse Products
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}







