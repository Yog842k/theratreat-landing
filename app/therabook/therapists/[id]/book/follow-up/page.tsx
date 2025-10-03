'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, Repeat, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface FollowUpPageProps {}

const mockTherapist = {
  name: "Dr. Sarah Johnson",
  title: "Clinical Psychologist",
  image: "/api/placeholder/100/100",
  price: 120,
};

const packageOptions = [
  {
    id: "single",
    name: "Single Session",
    sessions: 1,
    price: 120,
    savings: 0,
    description: "Book one session at a time",
    popular: false,
  },
  {
    id: "package-4",
    name: "4-Session Package",
    sessions: 4,
    price: 432,
    originalPrice: 480,
    savings: 48,
    description: "Save 10% on 4 sessions",
    popular: true,
  },
  {
    id: "package-8",
    name: "8-Session Package",
    sessions: 8,
    price: 816,
    originalPrice: 960,
    savings: 144,
    description: "Save 15% on 8 sessions",
    popular: false,
  },
  {
    id: "monthly",
    name: "Monthly Plan",
    sessions: "4/month",
    price: 400,
    originalPrice: 480,
    savings: 80,
    description: "4 sessions per month, cancel anytime",
    popular: false,
  },
];

const nextAvailableSlots = [
  { date: "Tomorrow", time: "2:00 PM", available: true },
  { date: "Dec 20", time: "10:00 AM", available: true },
  { date: "Dec 20", time: "3:00 PM", available: true },
  { date: "Dec 21", time: "11:00 AM", available: true },
  { date: "Dec 21", time: "4:00 PM", available: false },
  { date: "Dec 22", time: "9:00 AM", available: true },
];

export default function FollowUpPage({}: FollowUpPageProps) {
  const [selectedPackage, setSelectedPackage] = useState("single");
  const [selectedSlot, setSelectedSlot] = useState("");
  const routeParams = useParams();
  const id = Array.isArray(routeParams?.id) ? (routeParams?.id?.[0] as string) : ((routeParams?.id as string) || "");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Link href="/therabook">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to TheraBook
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Follow-up Sessions</h1>
        <p className="text-gray-600">
          Continue your therapy journey with Dr. Johnson
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Therapist Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={mockTherapist.image} alt={mockTherapist.name} />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{mockTherapist.name}</h2>
                  <p className="text-gray-600">{mockTherapist.title}</p>
                  <p className="text-sm text-green-600 font-medium">
                    You&apos;ve completed 1 session together
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Choose Your Plan
              </CardTitle>
              <CardDescription>
                Select the option that works best for your therapy goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {packageOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPackage === option.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPackage(option.id)}
                  >
                    {option.popular && (
                      <Badge className="absolute -top-2 left-4 bg-blue-600">
                        Most Popular
                      </Badge>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{option.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{option.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">${option.price}</span>
                          {option.originalPrice && (
                            <span className="text-gray-500 line-through">
                              ${option.originalPrice}
                            </span>
                          )}
                          {option.savings > 0 && (
                            <Badge variant="outline" className="text-green-600">
                              Save ${option.savings}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Sessions</p>
                        <p className="text-xl font-semibold">{option.sessions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Available Slots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Next Available Times
              </CardTitle>
              <CardDescription>
                Schedule your next session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {nextAvailableSlots.map((slot, index) => (
                  <Button
                    key={index}
                    variant={selectedSlot === `${slot.date}-${slot.time}` ? "default" : "outline"}
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(`${slot.date}-${slot.time}`)}
                    className="h-16 flex-col"
                  >
                    <div className="font-medium">{slot.date}</div>
                    <div className="text-sm opacity-80">{slot.time}</div>
                  </Button>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Full Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Selected Plan:</span>
                  <span className="text-sm font-medium">
                    {packageOptions.find(p => p.id === selectedPackage)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sessions:</span>
                  <span className="text-sm font-medium">
                    {packageOptions.find(p => p.id === selectedPackage)?.sessions}
                  </span>
                </div>
                {selectedSlot && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Next Session:</span>
                    <span className="text-sm font-medium">{selectedSlot}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${packageOptions.find(p => p.id === selectedPackage)?.price}</span>
                </div>
                {packageOptions.find(p => p.id === selectedPackage)?.savings && (
                  <p className="text-sm text-green-600 font-medium">
                    You save ${packageOptions.find(p => p.id === selectedPackage)?.savings}!
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Link href={`/therabook/therapists/${id}/book`}>
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={!selectedSlot}
                  >
                    {selectedPackage === 'single' ? 'Book Session' : 'Purchase Package'}
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full">
                  <Repeat className="w-4 h-4 mr-2" />
                  Set Recurring Schedule
                </Button>
              </div>

              <div className="pt-4 border-t text-center">
                <p className="text-xs text-gray-500 mb-2">
                  Questions about therapy packages?
                </p>
                <Button variant="ghost" size="sm">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
