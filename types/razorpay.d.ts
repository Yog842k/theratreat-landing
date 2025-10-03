// Minimal Razorpay type declarations for client usage

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpayPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

export interface RazorpayNotes {
  [key: string]: string | number | boolean | null | undefined;
}

export interface RazorpayTheme {
  color?: string;
}

export interface RazorpayModalOptions {
  ondismiss?: () => void;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  image?: string;
  order_id: string;
  handler?: (response: RazorpayPaymentResponse) => void | Promise<void>;
  prefill?: RazorpayPrefill;
  notes?: RazorpayNotes;
  theme?: RazorpayTheme;
  modal?: RazorpayModalOptions;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  close: () => void;
}

export {};
