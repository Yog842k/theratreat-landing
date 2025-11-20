import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, AlertCircle, Phone, Loader2, Sparkles } from "lucide-react";

interface OtpVerificationProps {
  phone: string;
  onVerified: () => void;
}

export default function OtpVerification({ phone, onVerified }: OtpVerificationProps) {
  const [step, setStep] = useState<"request" | "enter" | "verifying" | "success" | "error">("request");
  const [otp, setOtp] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  const requestOtp = async () => {
  setSending(true);
  setError("");
  setInfo("");
    try {
      // Normalize phone to E.164 format (+91XXXXXXXXXX)
      const digits = phone.replace(/\D/g, '');
      const normalizedPhone = digits.length === 10 ? `+91${digits}` : digits.length > 10 && digits.startsWith('91') ? `+${digits}` : digits.length > 10 ? `+${digits}` : `+91${digits}`;
      const res = await fetch('/api/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, purpose: 'signup:clinic' })
      });
      const json = await res.json();
      if (res.ok && json?.success && json?.data?.otpSent) {
        setStep("enter");
        setInfo(`OTP sent to ${json?.data?.phone || phone}`);
        setResendSeconds(json?.data?.nextSendSeconds || (json?.data?.ttlMinutes ? json.data.ttlMinutes * 60 : 60));
      } else {
        // Only set error if message is not 'OTP sent'
        if (json?.message && json.message.toLowerCase().includes('otp sent')) {
          setStep("enter");
          setInfo(json.message);
        } else {
          setError(json?.message || 'Failed to send OTP. Try again.');
          setStep("error");
        }
      }
    } catch {
      setError("Failed to send OTP. Try again.");
      setStep("error");
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    setVerifying(true);
    setError("");
    setInfo("");
    try {
      // Normalize phone to E.164 format (+91XXXXXXXXXX)
      const digits = phone.replace(/\D/g, '');
      const normalizedPhone = digits.length === 10 ? `+91${digits}` : digits.length > 10 && digits.startsWith('91') ? `+${digits}` : digits.length > 10 ? `+${digits}` : `+91${digits}`;
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, code: otp, purpose: 'signup:clinic' })
      });
      const json = await res.json();
      if (res.ok && json?.success && json?.data?.verified) {
        setError(""); // Clear any previous errors
        setStep("success");
        setInfo("OTP verified");
      } else {
        setError(json?.message || 'Invalid OTP. Please try again.');
        setStep("error");
      }
    } catch {
      setError("OTP verification failed. Try again.");
      setStep("error");
    } finally {
      setVerifying(false);
    }
  };

  React.useEffect(() => {
    if (resendSeconds > 0) {
      const timer = setTimeout(() => setResendSeconds(resendSeconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendSeconds]);

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6">
      <h3 className="text-xl font-bold text-violet-700 flex items-center gap-2">
        <Phone className="w-5 h-5" /> OTP Verification
      </h3>
      
      {/* Success state - show first if verified */}
      {step === "success" ? (
        <div className="w-full flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-3 p-5 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 w-full shadow-md">
            <CheckCircle className="w-7 h-7 text-green-600 flex-shrink-0" />
            <span className="text-green-800 font-bold text-lg">{info || "OTP verified"}</span>
          </div>
          <Button className="mt-2 w-full h-12 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg" onClick={onVerified}>
            Continue
          </Button>
        </div>
      ) : step === "request" ? (
        <>
          <p className="text-gray-600 text-sm mb-2">Enter your phone number to receive an OTP.</p>
          <Button onClick={requestOtp} disabled={sending} className="w-full h-12 text-lg">
            {sending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Phone className="w-5 h-5 mr-2" />}
            {sending ? "Sending..." : "Send OTP"}
          </Button>
        </>
      ) : step === "enter" ? (
        <>
          <p className="text-green-700 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {info}</p>
          <Input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            maxLength={6}
            onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            className="h-12 text-center text-lg tracking-widest font-bold"
          />
          <Button onClick={verifyOtp} disabled={verifying || otp.length !== 6} className="w-full h-12 text-lg">
            {verifying ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {verifying ? "Verifying..." : "Verify OTP"}
          </Button>
          <div className="text-xs text-gray-500 mt-2">
            {resendSeconds > 0 ? `Resend OTP in ${resendSeconds}s` : <Button variant="ghost" size="sm" onClick={requestOtp}>Resend OTP</Button>}
          </div>
          {/* Show error only in enter step, not in success */}
          {error && step === "enter" && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 w-full">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
        </>
      ) : step === "error" ? (
        <div className="w-full flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border-2 border-red-200 w-full">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700 text-sm font-semibold">{error}</span>
          </div>
          <Button onClick={() => { setStep("request"); setError(""); setOtp(""); }} className="w-full h-12 text-lg">
            Try Again
          </Button>
        </div>
      ) : null}
    </div>
  );
}
