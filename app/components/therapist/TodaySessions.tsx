'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Phone, Video, MessageSquare } from 'lucide-react';

interface TodaySession {
  _id: string;
  date: string;
  timeSlot: string;
  sessionType: string;
  status: string;
  user: {
    name: string;
    email: string;
  };
}

interface TodaySessionsProps {
  sessions: TodaySession[];
}

const statusColor: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200'
};

const sessionTypeIcon: Record<string, React.ReactNode> = {
  individual: <Phone className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  group: <MessageSquare className="w-4 h-4" />
};

export default function TodaySessions({ sessions }: TodaySessionsProps) {
  if (sessions.length === 0) {
    return (
      <Card className='bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8'>
        <CardContent className='p-8'>
          <div className='text-center'>
            <CalendarDays className='w-12 h-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>No Sessions Today</h3>
            <p className='text-gray-500'>You have no scheduled sessions for today. Enjoy your day!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <CalendarDays className='w-6 h-6 text-blue-600' />
            </div>
            <div>
              <CardTitle className='text-xl'>Today's Sessions</CardTitle>
              <p className='text-sm text-gray-600'>Your scheduled sessions for today</p>
            </div>
          </div>
          <Badge variant='secondary' className='text-sm'>
            {sessions.length} session{sessions.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {sessions.map((session) => (
            <div 
              key={session._id} 
              className='p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-200'
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <Avatar className='w-12 h-12 border-2 border-white shadow-sm'>
                    <AvatarFallback className='bg-blue-100 text-blue-600 font-semibold'>
                      {session.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <h3 className='font-semibold text-gray-900'>{session.user.name}</h3>
                      <Badge className={statusColor[session.status]} variant='outline'>
                        {session.status}
                      </Badge>
                    </div>
                    <p className='text-sm text-gray-600 mb-2'>{session.user.email}</p>
                    <div className='flex items-center gap-4 text-sm text-gray-500'>
                      <div className='flex items-center gap-1'>
                        <Clock className='w-4 h-4' />
                        {session.timeSlot}
                      </div>
                      <div className='flex items-center gap-1'>
                        {sessionTypeIcon[session.sessionType] || <Phone className='w-4 h-4' />}
                        <span className='capitalize'>{session.sessionType}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  {session.status === 'confirmed' && (
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
                  {session.status === 'pending' && (
                    <>
                      <Button size='sm' variant='default'>
                        Confirm
                      </Button>
                      <Button size='sm' variant='outline'>
                        Reschedule
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
