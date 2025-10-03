'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Mail, 
  Phone, 
  MoreHorizontal,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Filter,
  Search,
  Download,
  Eye,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

interface BookingItem {
  _id: string;
  date: string;
  timeSlot: string;
  sessionType: string;
  status: string;
  amount: number;
  notes?: string;
  user?: { 
    _id: string;
    name: string; 
    email: string;
    phone?: string;
  };
  createdAt: string;
}

interface BookingListProps {
  loading: boolean;
  error: string | null;
  items: BookingItem[];
  emptyMsg: string;
  title: string;
  onStatusUpdate?: (bookingId: string, status: string) => Promise<void>;
}

const statusColor: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200'
};

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  confirmed: <CheckCircle2 className="w-4 h-4" />,
  completed: <CheckCircle2 className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />
};

function formatDate(dateStr: string) {
  try { 
    return new Date(dateStr).toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch { 
    return dateStr; 
  }
}

function formatTime(timeStr: string) {
  return timeStr;
}

export default function BookingList({ 
  loading, 
  error, 
  items, 
  emptyMsg, 
  title,
  onStatusUpdate 
}: BookingListProps) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    if (!onStatusUpdate) return;
    
    setUpdatingStatus(bookingId);
    try {
      await onStatusUpdate(bookingId, status);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loading) {
    return (
      <Card className='bg-white/80 backdrop-blur-sm border-0 shadow-lg'>
        <CardContent className='p-8'>
          <div className='flex items-center justify-center gap-3 text-gray-600'>
            <Loader2 className='w-5 h-5 animate-spin' />
            Loading sessions...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='bg-white/80 backdrop-blur-sm border-0 shadow-lg'>
        <CardContent className='p-8'>
          <div className='flex items-center justify-center gap-3 text-red-600'>
            <AlertCircle className='w-5 h-5' />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!items.length) {
    return (
      <Card className='bg-white/80 backdrop-blur-sm border-0 shadow-lg'>
        <CardContent className='p-8'>
          <div className='text-center'>
            <Calendar className='w-12 h-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>No Sessions Found</h3>
            <p className='text-gray-500'>{emptyMsg}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='bg-white/80 backdrop-blur-sm border-0 shadow-lg'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <Calendar className='w-5 h-5 text-blue-600' />
            </div>
            <CardTitle className='text-xl'>{title}</CardTitle>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm'>
              <Filter className='w-4 h-4 mr-2' />
              Filter
            </Button>
            <Button variant='outline' size='sm'>
              <Search className='w-4 h-4 mr-2' />
              Search
            </Button>
            <Button variant='outline' size='sm'>
              <Download className='w-4 h-4 mr-2' />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {items.map((booking) => (
            <div 
              key={booking._id} 
              className='p-6 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-200'
            >
              <div className='flex flex-col lg:flex-row lg:items-center gap-4'>
                <div className='flex items-center gap-4 flex-1'>
                  <Avatar className='w-12 h-12 border-2 border-gray-100'>
                    <AvatarFallback className='bg-blue-100 text-blue-600 font-semibold'>
                      {booking.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1 min-w-0'>
                    <div className='flex flex-wrap items-center gap-3 mb-2'>
                      <h3 className='font-semibold text-gray-900'>{booking.user?.name || 'Unknown User'}</h3>
                      <Badge className={statusColor[booking.status]} variant='outline'>
                        {statusIcon[booking.status]}
                        <span className='ml-1'>{booking.status}</span>
                      </Badge>
                      <Badge variant='outline' className='capitalize bg-gray-50'>
                        {booking.sessionType}
                      </Badge>
                    </div>
                    <div className='flex flex-wrap items-center gap-4 text-sm text-gray-600'>
                      <div className='flex items-center gap-1'>
                        <Calendar className='w-4 h-4' />
                        {formatDate(booking.date)}
                      </div>
                      <div className='flex items-center gap-1'>
                        <Clock className='w-4 h-4' />
                        {formatTime(booking.timeSlot)}
                      </div>
                      <div className='flex items-center gap-1'>
                        <DollarSign className='w-4 h-4' />
                        ${booking.amount}
                      </div>
                      {booking.user?.email && (
                        <div className='flex items-center gap-1'>
                          <Mail className='w-4 h-4' />
                          {booking.user.email}
                        </div>
                      )}
                      {booking.user?.phone && (
                        <div className='flex items-center gap-1'>
                          <Phone className='w-4 h-4' />
                          {booking.user.phone}
                        </div>
                      )}
                    </div>
                    {booking.notes && (
                      <p className='text-sm text-gray-500 mt-2 italic bg-gray-50 p-2 rounded'>
                        "{booking.notes}"
                      </p>
                    )}
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  {booking.status === 'pending' && onStatusUpdate && (
                    <>
                      <Button 
                        size='sm' 
                        variant='default'
                        disabled={updatingStatus === booking._id}
                        onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                      >
                        {updatingStatus === booking._id ? (
                          <Loader2 className='w-4 h-4 mr-1 animate-spin' />
                        ) : (
                          <CheckCircle2 className='w-4 h-4 mr-1' />
                        )}
                        Confirm
                      </Button>
                      <Button 
                        size='sm' 
                        variant='destructive'
                        disabled={updatingStatus === booking._id}
                        onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                      >
                        {updatingStatus === booking._id ? (
                          <Loader2 className='w-4 h-4 mr-1 animate-spin' />
                        ) : (
                          <XCircle className='w-4 h-4 mr-1' />
                        )}
                        Decline
                      </Button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <>
                      <Button size='sm' variant='outline' className='text-green-600 border-green-200 hover:bg-green-50'>
                        <Phone className='w-4 h-4 mr-1' />
                        Start Call
                      </Button>
                      <Button size='sm' variant='outline'>
                        <MessageSquare className='w-4 h-4 mr-1' />
                        Message
                      </Button>
                    </>
                  )}
                  <Button size='sm' variant='outline'>
                    <MoreHorizontal className='w-4 h-4' />
                  </Button>
                  <Link href={`/therabook/bookings/${booking._id}`}>
                    <Button size='sm' variant='secondary'>
                      <Eye className='w-4 h-4 mr-1' />
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
