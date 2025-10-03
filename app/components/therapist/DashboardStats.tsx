'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Calendar, 
  Star, 
  Target,
  TrendingUp,
  Users,
  Clock,
  Award
} from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    totalBookings: number;
    completedSessions: number;
    upcomingBookings: number;
    totalEarnings: number;
    monthlyEarnings: number;
    averageRating: number;
    totalReviews: number;
    completionRate: number;
  };
}

const statCards = [
  {
    key: 'totalEarnings',
    title: 'Total Earnings',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    format: (value: number) => `$${value.toLocaleString()}`,
    subtitle: (stats: any) => `$${stats.monthlyEarnings.toLocaleString()} this month`
  },
  {
    key: 'upcomingBookings',
    title: 'Upcoming Sessions',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    format: (value: number) => value.toString(),
    subtitle: () => 'Next 30 days'
  },
  {
    key: 'averageRating',
    title: 'Average Rating',
    icon: Star,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    format: (value: number) => value.toFixed(1),
    subtitle: (stats: any) => `${stats.totalReviews} reviews`
  },
  {
    key: 'completionRate',
    title: 'Completion Rate',
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    format: (value: number) => `${Math.round(value)}%`,
    subtitle: () => 'Session success rate'
  }
];

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
      {statCards.map((card) => {
        const IconComponent = card.icon;
        const value = stats[card.key as keyof typeof stats] as number;
        
        return (
          <Card key={card.key} className='bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300'>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-sm font-medium text-gray-600'>{card.title}</CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <IconComponent className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold text-gray-900 mb-1'>
                {card.format(value)}
              </div>
              <p className='text-xs text-gray-500'>
                {card.subtitle(stats)}
              </p>
              {card.key === 'completionRate' && (
                <Progress value={value} className='mt-3' />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
