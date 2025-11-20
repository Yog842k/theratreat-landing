'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Heart, UserCheck, GraduationCap, BookOpen, Building2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/logo.png';

interface AccountType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const accountTypes: AccountType[] = [
  {
    id: 'patient',
    title: 'Patient',
    description: 'Find and book therapy sessions',
    icon: <Heart className="w-6 h-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200 hover:border-blue-300'
  },
  {
    id: 'therapist',
    title: 'Therapist',
    description: 'Provide therapy services',
    icon: <UserCheck className="w-6 h-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200 hover:border-green-300'
  },
  {
    id: 'instructor',
    title: 'Instructor',
    description: 'Teach therapy courses',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200 hover:border-purple-300'
  },
  {
    id: 'student',
    title: 'Student',
    description: 'Learn therapy skills',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200 hover:border-orange-300'
  },
  {
    id: 'clinic',
    title: 'Clinic',
    description: 'Manage clinic operations',
    icon: <Building2 className="w-6 h-6" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200 hover:border-indigo-300'
  }
];

export default function AccountTypeSelection() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleContinue = () => {
    if (!selectedType) {
      toast.error('Please select an account type', {
        description: 'Choose how you want to use TheraBook',
      });
      return;
    }
    
    setIsLoading(true);
    
    const accountTypeNames: Record<string, string> = {
      patient: 'Patient',
      therapist: 'Therapist',
      instructor: 'Instructor',
      student: 'Student',
      clinic: 'Clinic'
    };
    
    toast.info('Redirecting...', {
      description: `Setting up ${accountTypeNames[selectedType]} account`,
    });
    
    // Redirect to the appropriate signup flow based on account type
    if (selectedType === 'patient') {
      router.push('/therabook/onboarding/patient');
    } else if (selectedType === 'therapist') {
      router.push('/therabook/therapists/apply');
    } else if (selectedType === 'instructor') {
      router.push('/auth/signup?type=instructor');
    } else if (selectedType === 'student') {
      router.push('/auth/signup?type=student');
    } else if (selectedType === 'clinic') {
      // Redirect directly to the clinic multi-step registration flow
      router.push('/clinics/register');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header with Logo and Back Button */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex justify-center mb-6">
            <Image src={Logo} alt="TheraBook" width={80} height={80} className="rounded-full" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Choose Your Account Type</h1>
          <p className="text-gray-600 text-lg">Select how you want to use TheraBook</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Get Started
            </CardTitle>
            <CardDescription className="text-gray-600">
              Choose the option that best describes you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {accountTypes.map((type) => (
              <div
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`
                  relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md
                  ${selectedType === type.id 
                    ? `${type.borderColor.replace('hover:', '')} ${type.bgColor} shadow-md` 
                    : `border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50`
                  }
                `}
              >
                <div className="flex items-center space-x-4">
                  <div className={`
                    p-3 rounded-full 
                    ${selectedType === type.id ? type.bgColor : 'bg-gray-100'}
                  `}>
                    <div className={selectedType === type.id ? type.color : 'text-gray-500'}>
                      {type.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {type.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {type.description}
                    </p>
                  </div>
                  <div className={`
                    w-5 h-5 rounded-full border-2 transition-all duration-200
                    ${selectedType === type.id 
                      ? `${type.borderColor.split(' ')[0]} bg-current` 
                      : 'border-gray-300'
                    }
                  `}>
                    {selectedType === type.id && (
                      <div className="w-full h-full rounded-full bg-white scale-[0.4]"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-6">
              <Button
                onClick={handleContinue}
                disabled={!selectedType || isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:transform-none disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Continue'}
              </Button>
            </div>

            <div className="text-center pt-4">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm mb-4">
            Not sure which account type to choose?
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
            <div className="bg-white/60 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">For Individuals</h4>
              <p>Choose Patient to book sessions or Student to learn therapy skills</p>
            </div>
            <div className="bg-white/60 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">For Professionals</h4>
              <p>Choose Therapist to provide services, Instructor to teach, or Clinic to manage operations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
