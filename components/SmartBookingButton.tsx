'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';

interface SmartBookingButtonProps {
  therapistId: string;
  therapistName?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export function SmartBookingButton({ 
  therapistId, 
  therapistName,
  className,
  variant = 'default',
  size = 'default',
  children = 'Book Session'
}: SmartBookingButtonProps) {
  const router = useRouter();

  const handleBooking = () => {
    // For demo purposes, just navigate to the booking page
    router.push(`/therabook/therapists/${therapistId}/book`);
  };

  return (
    <Button 
      onClick={handleBooking}
      className={className}
      variant={variant}
      size={size}
    >
      <Calendar className="w-4 h-4 mr-2" />
      {children}
    </Button>
  );
}
