"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Clock, Award, Shield, Calendar } from "lucide-react";

interface TherapistApiItem {
  _id: string;
  displayName: string;
  title: string;
  specializations: string[];
  rating?: number;
  reviewCount?: number;
  image?: string;
  location?: string;
  experience?: number;
  sessionTypes?: string[];
  consultationFee?: number;
  isVerified?: boolean;
  isActive?: boolean;
}

const departments = [
  "All Departments",
  "Mental Health",
  "Physical Therapy", 
  "Pediatric Care",
  "Cardiovascular",
  "Sleep Medicine",
  "Nutrition"
];

export function FeaturedTherapists() {
  const [therapists, setTherapists] = useState<TherapistApiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/therapists?limit=4&sortBy=fee&sortOrder=asc`, { cache: "no-store" });
        const json = await res.json();
        const list: TherapistApiItem[] = json?.data?.therapists || [];
        setTherapists(list);
      } catch (e: any) {
        setError(e?.message || "Failed to load therapists");
      } finally {
        setLoading(false);
      }
    };
    fetchTherapists();
  }, []);

  const departments = useMemo(() => [
    "All Departments",
    "Mental Health",
    "Physical Therapy",
    "Pediatric Care",
    "Cardiovascular",
    "Sleep Medicine",
    "Nutrition"
  ], []);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">Featured Therapists & Clinics</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with our verified, licensed experts across multiple specialties. 
          All providers are vetted and work with major insurance plans.
        </p>
      </div>

      {/* Why TheaPheap Section */}
      <div className="bg-blue-50 rounded-lg p-8 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-4">Why Choose TheaPheap?</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold">Works with Insurance</h3>
            <p className="text-sm text-muted-foreground">Most major insurance plans accepted</p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Award className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold">Verified & Licensed Experts</h3>
            <p className="text-sm text-muted-foreground">All providers are background checked</p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold">Flexible Scheduling</h3>
            <p className="text-sm text-muted-foreground">Book appointments that fit your schedule</p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold">Treatment Planning</h3>
            <p className="text-sm text-muted-foreground">Personalized care plans for better outcomes</p>
          </div>
        </div>
      </div>

      {/* Department Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {departments.map((dept) => (
          <Button
            key={dept}
            variant={dept === "All Departments" ? "default" : "outline"}
            size="sm"
            className="rounded-full"
          >
            {dept}
          </Button>
        ))}
      </div>

      {/* Therapists Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {(loading ? Array.from({ length: 4 }).map((_, i) => ({ _id: String(i) })) : therapists).map((therapist: any) => (
          <Card key={therapist.id} className="hover:shadow-lg transition-all border-2 hover:border-blue-200">
            <CardHeader className="pb-4">
              <div className="flex items-start space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={therapist.image || ""} alt={therapist.displayName || ""} />
                  <AvatarFallback>{(therapist.displayName || "").split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{therapist.displayName || "Loading..."}</h3>
                      <p className="text-muted-foreground">{therapist.title || ""}</p>
                    </div>
                    <div className="flex space-x-1">
                      {therapist.isVerified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{typeof therapist.rating === 'number' ? therapist.rating.toFixed(1) : '-'}</span>
                      <span>({therapist.reviewCount || 0} reviews)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{therapist.location || ""}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      {(() => {
                        const raw: any = (therapist as any).experience ?? (therapist as any).yearsExperience ?? (therapist as any).yearsOfExperience ?? (therapist as any).expYears;
                        let label = '';
                        if (typeof raw === 'number') {
                          if (raw > 0) label = `${raw}+ years`;
                        } else if (typeof raw === 'string') {
                          const s = raw.trim();
                          const m = s.match(/(\d+)(?:\s*\+?)?/);
                          if (m && Number(m[1]) > 0) label = `${Number(m[1])}+ years`;
                          else if (s.length) label = s.replace(/years?/i, 'years');
                        }
                        return <span>{label}</span>;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <div className="flex flex-wrap gap-1">
                  {(therapist.specializations || []).slice(0, 3).map((specialty: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-green-600 font-medium">{(therapist.sessionTypes && therapist.sessionTypes.length) ? `Offers ${therapist.sessionTypes.join(', ')}` : ''}</span>
                  {(() => {
                    // Compute cheapest visible price
                    const fee = Number(therapist.consultationFee || 0);
                    const types: string[] = Array.isArray(therapist.sessionTypes) ? therapist.sessionTypes.map((t: string) => String(t).toLowerCase()) : [];
                    const defaults: Record<string, number> = { video: 999, audio: 499, "in-clinic": 699, clinic: 699, home: 1299, "home-visit": 1299 };
                    const availableTypePrices = types.map((t) => defaults[t]).filter((v) => typeof v === 'number' && v > 0);
                    const candidates = [fee > 0 ? fee : Infinity, ...(availableTypePrices.length ? availableTypePrices : [])];
                    const minPrice = Math.min(...(candidates.length ? candidates : [Infinity]));
                    if (minPrice !== Infinity && minPrice > 0) {
                      return <p className="text-muted-foreground">From ₹{minPrice.toLocaleString()}</p>;
                    }
                    return null; // Hide price when nothing valid
                  })()}
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                  <Button size="sm">
                    Book Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          View All Therapists
        </Button>
      </div>
    </div>
  );
}
