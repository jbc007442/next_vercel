'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { GalleryVerticalEndIcon } from 'lucide-react';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);

  // ✅ Send OTP (LOGIN API)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const toastId = toast.loading('Sending OTP...');
    setLoading(true);

    try {
      // ✅ correct API
      await axios.post('/api/auth/login', { email });

      toast.success('OTP sent successfully 📩', { id: toastId });
      setStep('otp');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send OTP', {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const toastId = toast.loading('Verifying OTP...');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/verify-otp', {
        email,
        otp,
      });

      toast.success('Login successful 🚀', { id: toastId });

      // ✅ Save token in localStorage (optional)
      localStorage.setItem('token', res.data.token);

      // ✅ VERY IMPORTANT: save token in cookie
      document.cookie = `token=${res.data.token}; path=/`;

      // ✅ redirect
      window.location.href = '/dashboard';
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid OTP', {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Resend OTP
  const handleResendOtp = async () => {
    const toastId = toast.loading('Resending OTP...');

    try {
      await axios.post('/api/auth/login', { email });
      toast.success('OTP resent 📩', { id: toastId });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to resend OTP', {
        id: toastId,
      });
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form onSubmit={step === 'email' ? handleSendOtp : handleVerifyOtp}>
        <FieldGroup>
          {/* Header */}
          <div className="flex flex-col items-center gap-2 text-center">
            <Link href="/" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEndIcon className="size-6" />
              </div>
              <span className="sr-only">Crontex</span>
            </Link>

            <h1 className="text-xl font-bold">Welcome to Crontex</h1>

            <FieldDescription>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </FieldDescription>
          </div>

          {/* EMAIL STEP */}
          {step === 'email' && (
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
          )}

          {/* OTP STEP */}
          {step === 'otp' && (
            <Field>
              <FieldLabel>Enter OTP</FieldLabel>

              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {[...Array(6)].map((_, i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <FieldDescription className="text-center mt-2">OTP sent to {email}</FieldDescription>
            </Field>
          )}

          {/* Button */}
          <Field>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Please wait...' : step === 'email' ? 'Send OTP' : 'Verify OTP'}
            </Button>
          </Field>

          {/* Resend OTP */}
          {step === 'otp' && (
            <FieldDescription className="text-center">
              Didn’t receive OTP?{' '}
              <button
                type="button"
                className="underline"
                onClick={handleResendOtp}
                disabled={loading}
              >
                Resend
              </button>
            </FieldDescription>
          )}

          <FieldSeparator>Or</FieldSeparator>
        </FieldGroup>
      </form>

      {/* Footer */}
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{' '}
        <Link href="/terms" className="underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
        .
      </FieldDescription>
    </div>
  );
}
