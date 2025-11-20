'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/NewAuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, UserPlus, Heart, UserCheck, GraduationCap, BookOpen, Building2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/logo.png';

export default function SignupClient() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const accountType = searchParams?.get('type') || 'patient';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: accountType
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!searchParams?.get('type')) {
      router.push('/auth/signup/account-type');
    }
  }, [searchParams, router]);

  useEffect(() => {
    const type = searchParams?.get('type');
    if (type) setFormData(prev => ({ ...prev, userType: type }));
  }, [searchParams]);

  const getAccountTypeInfo = () => {
    const types = {
      patient: { title: 'Patient', description: 'Find and book therapy sessions', icon: <Heart className="w-5 h-5" />, color: 'bg-blue-100 text-blue-700 border-blue-200' },
      therapist: { title: 'Therapist', description: 'Provide therapy services', icon: <UserCheck className="w-5 h-5" />, color: 'bg-green-100 text-green-700 border-green-200' },
      instructor: { title: 'Instructor', description: 'Teach therapy courses', icon: <GraduationCap className="w-5 h-5" />, color: 'bg-purple-100 text-purple-700 border-purple-200' },
      student: { title: 'Student', description: 'Learn therapy skills', icon: <BookOpen className="w-5 h-5" />, color: 'bg-orange-100 text-orange-700 border-orange-200' },
      clinic: { title: 'Clinic', description: 'Manage clinic operations', icon: <Building2 className="w-5 h-5" />, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' }
    } as const;
    return types[accountType as keyof typeof types] || types.patient;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) { 
      const errorMsg = 'Passwords do not match';
      setError(errorMsg);
      toast.error('Validation error', { description: errorMsg });
      return false; 
    }
    if (formData.password.length < 8) { 
      const errorMsg = 'Password must be at least 8 characters long';
      setError(errorMsg);
      toast.error('Validation error', { description: errorMsg });
      return false; 
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) { 
      const errorMsg = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      setError(errorMsg);
      toast.error('Validation error', { description: errorMsg });
      return false; 
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    if (!validateForm()) { setLoading(false); return; }
    try {
      const { confirmPassword, ...submitData } = formData;
      const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(submitData) });
      const data = await response.json();
      if (data.success) {
        const successMsg = 'Account created successfully! Redirecting...';
        setSuccess(successMsg);
        toast.success('Registration successful!', {
          description: 'Your account has been created. Redirecting...',
        });
        if (data.data.token && data.data.user) login(data.data.token, data.data.user);
        setTimeout(() => {
          if (data.data.token) {
            switch (data.data.user.userType) {
              case 'therapist': router.push('/therabook/onboarding/therapist'); break;
              case 'instructor': router.push('/therabook/onboarding/instructor'); break;
              case 'student': router.push('/therabook/onboarding/student'); break;
              case 'clinic': router.push('/therabook/onboarding/clinic'); break;
              case 'patient': default: router.push('/therabook/onboarding/patient'); break;
            }
          } else router.push('/auth/login');
        }, 2000);
      } else {
        const errorMsg = data.message || (data.errors?.join(', ') || 'Registration failed');
        setError(errorMsg);
        toast.error('Registration failed', {
          description: errorMsg,
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg = 'An error occurred. Please try again.';
      setError(errorMsg);
      toast.error('Registration error', {
        description: errorMsg,
      });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/auth/signup/account-type" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Change Account Type
          </Link>
          <div className="flex justify-center mb-4">
            <Image src={Logo} alt="TheraBook" width={80} height={80} className="rounded-full" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
          <div className="flex justify-center mt-3">
            <Badge variant="outline" className={`${getAccountTypeInfo().color} border px-3 py-1`}>
              <span className="flex items-center gap-2">
                {getAccountTypeInfo().icon}
                {getAccountTypeInfo().title}
              </span>
            </Badge>
          </div>
          <p className="text-gray-600 mt-2">{getAccountTypeInfo().description}</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center">
              <UserPlus className="w-6 h-6 mr-2" />
              Sign Up
            </CardTitle>
            <CardDescription className="text-gray-600">Fill in your details to create an account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input id="name" name="name" type="text" required value={formData.name} onChange={handleInputChange} className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="Enter your full name" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="Enter your email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="Enter your phone number" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleInputChange} className="pl-10 pr-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="Create a password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff /> : <Eye />}</button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleInputChange} className="pl-10 pr-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="Confirm your password" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-gray-600">{showConfirmPassword ? <EyeOff /> : <Eye />}</button>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input id="terms" name="terms" type="checkbox" required className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                </div>
                <div className="ml-2 text-sm">
                  <label htmlFor="terms" className="text-gray-700">
                    I agree to the{' '}<Link href="/terms" className="text-blue-600 hover:text-blue-800">Terms of Service</Link>{' '}and{' '}<Link href="/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link>
                  </label>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:transform-none disabled:opacity-50">
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-gray-600">Already have an account?{' '}<Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">Sign in here</Link></p>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Need help?{' '}<Link href="/support" className="text-blue-600 hover:text-blue-800">Contact Support</Link></p>
        </div>
      </div>
    </div>
  );
}
