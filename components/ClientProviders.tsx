"use client";

import { ReactNode, useEffect } from 'react';
import { TherapistSearchProvider } from './TherapistSearchContext';
import { Toaster } from '@/components/ui/sonner';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  useEffect(() => {
    // Dynamically polyfill IntersectionObserver & ResizeObserver if missing (older browsers / test envs)
    (async () => {
      if (typeof window !== 'undefined') {
        if (typeof (window as any).IntersectionObserver === 'undefined') {
          try {
            await import('intersection-observer');
            console.info('[polyfill] IntersectionObserver loaded');
          } catch (e) {
            console.warn('[polyfill] Failed to load IntersectionObserver polyfill', e);
          }
        }
        if (typeof (window as any).ResizeObserver === 'undefined') {
          try {
            const mod: any = await import('@juggle/resize-observer');
            (window as any).ResizeObserver = mod.ResizeObserver;
            console.info('[polyfill] ResizeObserver loaded');
          } catch (e) {
            console.warn('[polyfill] Failed to load ResizeObserver polyfill', e);
          }
        }
      }
    })();
  }, []);
  return (
    <TherapistSearchProvider>
      {children}
      <Toaster />
    </TherapistSearchProvider>
  );
}
