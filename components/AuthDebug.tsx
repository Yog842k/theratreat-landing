"use client";
import React from 'react';
import { useAuth } from '@/components/auth/NewAuthContext';

export const AuthDebug: React.FC = () => {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  if (process.env.NODE_ENV === 'production') return null;
  return (
    <div className="mt-4 p-4 text-xs bg-gray-900 text-green-200 rounded">
      <div className="font-bold mb-1">Auth Debug</div>
      <pre className="whitespace-pre-wrap break-all">
{JSON.stringify({ isLoading, isAuthenticated, hasUser: !!user, user, token: token?.slice(0,20)+'...' }, null, 2)}
      </pre>
    </div>
  );
};
