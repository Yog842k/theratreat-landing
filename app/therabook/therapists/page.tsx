'use client'
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Star, 
  MapPin,
  Monitor,
  Building,
  Heart,
  Languages,
  Search,
  Filter,
  Clock,
  Users,
  Video,
  Phone,
  Home,
  Brain
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { SmartBookingButton } from '@/components/SmartBookingButton';
import { helpMeChooseCategoryToSearch } from '@/constants/helpmechoose-mapping';
import { SearchResultsComponent, TherapistData } from '@/components/therabook/SearchResultsComponent';
import { AdvancedTherapistSearch } from '@/components/therabook/AdvancedTherapistSearch';

interface ApiTherapist {
  _id: string;
  displayName?: string;
  title?: string;
  specializations?: string[];
  experience?: number;
  consultationFee?: number;
  rating?: number;
  reviewCount?: number;
  languages?: string[];
  sessionTypes?: string | string[];
  location?:
    | string
    | string[]
    | {
        city?: string;
        area?: string;
        locality?: string;
        address?: string;
        formatted?: string;
        [key: string]: any;
      };
  availabilityText?: string;
}

export default function TherapistsListingPage() {
  const [allTherapists, setAllTherapists] = useState<ApiTherapist[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<ApiTherapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedSessionType, setSelectedSessionType] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle URL parameters on component mount
  useEffect(() => {
    const search = searchParams?.get('search') || '';
    const condition = searchParams?.get('condition') || '';
    const therapy = searchParams?.get('therapy') || '';
  const sessionType = searchParams?.get('sessionType') || '';
  const category = searchParams?.get('category') || '';
  const source = searchParams?.get('source') || '';
    
    // Handle smart selector results
    const q0 = searchParams?.get('q0') || ''; // Therapy type from smart selector
    const q1 = searchParams?.get('q1') || ''; // Session type from smart selector
    
    // Set search query based on therapy type from smart selector or regular search
    let finalSearchQuery = search || condition || therapy;
    // If coming from help me choose and no explicit search term, map category id
    if (!finalSearchQuery && source === 'helpmechoose' && category) {
      finalSearchQuery = helpMeChooseCategoryToSearch[category] || '';
    }
    if (q0) {
      // Map smart selector therapy types to search terms
      const therapyTypeMapping: Record<string, string> = {
        'anxiety': 'anxiety stress',
        'depression': 'depression mood',
        'relationships': 'relationship therapy',
        'trauma': 'trauma ptsd'
      };
      finalSearchQuery = therapyTypeMapping[q0] || q0;
    }
    
    // Set session type from smart selector or regular parameters
    let finalSessionType = sessionType;
    if (q1) {
      // Map smart selector session types to our session types
      const sessionTypeMapping: Record<string, string> = {
        'video': 'video',
        'audio': 'audio',
        'clinic': 'in-clinic'
      };
      finalSessionType = sessionTypeMapping[q1] || q1;
    }
    
    setSearchQuery(finalSearchQuery);
    setSelectedSessionType(finalSessionType);
    
    // Apply initial filters
    filterTherapists(finalSearchQuery, selectedLocation, selectedSpecialty, finalSessionType);
  }, [searchParams]);

  const filterTherapists = (search: string, location: string, specialty: string, sessionType: string) => {
    let filtered = [...allTherapists];

    // Normalize 'all' selections to empty (no filter)
    const norm = (v: string) => (v || '').trim().toLowerCase();
    const loc = norm(location) === 'all' ? '' : location;
    const spec = norm(specialty) === 'all' ? '' : specialty;
    const sess = norm(sessionType) === 'all' ? '' : sessionType;

    const extractLocationString = (locVal: ApiTherapist['location']): string => {
      if (!locVal) return '';
      if (typeof locVal === 'string') return locVal;
      if (Array.isArray(locVal)) return locVal.filter(Boolean).join(', ');
      if (typeof locVal === 'object') {
        const city = (locVal as any).city || (locVal as any).cityName || '';
        const area = (locVal as any).area || (locVal as any).locality || '';
        const formatted = (locVal as any).formatted || (locVal as any).address || '';
        if (city || area) return [city, area].filter(Boolean).join(', ');
        return formatted || '';
      }
      return '';
    };

    const extractSessionTypes = (val: ApiTherapist['sessionTypes']): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val as string[];
      if (typeof val === 'string') return [val];
      return [];
    };

    if (search) {
      filtered = filtered.filter(therapist => 
  (therapist.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
  (therapist.specializations || []).some(s => s.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (loc) {
      filtered = filtered.filter((therapist) => extractLocationString(therapist.location).toLowerCase().includes(loc.toLowerCase()));
    }

    if (spec) {
      filtered = filtered.filter(therapist => (therapist.specializations || []).some(s => s.toLowerCase().includes(spec.toLowerCase())));
    }

    if (sess) {
      filtered = filtered.filter((therapist) => extractSessionTypes(therapist.sessionTypes).some((type: string) => type.toLowerCase().includes(sess.toLowerCase())));
    }

    // Sort results
    if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating||0) - (a.rating||0));
    } else if (sortBy === 'price') {
      filtered.sort((a, b) => (a.consultationFee||0) - (b.consultationFee||0));
    } else if (sortBy === 'experience') {
      filtered.sort((a, b) => (b.experience||0) - (a.experience||0));
    }
    setFilteredTherapists(filtered);
  };

  // Load therapists from API (runs once on mount)
  useEffect(() => {
    async function load() {
      try {
        setLoading(true); setError(null);
  const url = '/api/therapists?limit=50';
        console.log('[TherapistsPage] Fetching:', url);
        const res = await fetch(url, { cache: 'no-store' });
        console.log('[TherapistsPage] Status:', res.status);
        const text = await res.text();
        let json: any = {};
        try { json = JSON.parse(text); } catch {
          console.warn('[TherapistsPage] Non-JSON response:', text);
          throw new Error('Invalid response from API');
        }
        console.log('[TherapistsPage] Payload:', json);
        if (!res.ok || !json.success) throw new Error(json.message || 'Failed');
        const list: ApiTherapist[] = (json.data?.therapists || []);
        console.log('[TherapistsPage] Therapists count:', list.length);
        setAllTherapists(list);
        setFilteredTherapists(list);
      } catch(e:any) {
        console.error('[TherapistsPage] Fetch error:', e?.message || e);
        setError(e.message);
      } finally { setLoading(false); }
    }
    load();
  }, []);

  useEffect(() => {
    filterTherapists(searchQuery, selectedLocation, selectedSpecialty, selectedSessionType);
  }, [searchQuery, selectedLocation, selectedSpecialty, selectedSessionType, sortBy]);

  const getSessionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Phone className="w-4 h-4" />;
      case 'in-clinic': return <Building className="w-4 h-4" />;
      case 'home visit': return <Home className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Advanced Header and Filter Sidebar */}
        <div className="mb-8">
          <AdvancedTherapistSearch
            therapists={(filteredTherapists || []).map((t): TherapistData => {
              // Map current API data to TherapistData; keep consistent with below
              const parseLocation = (locVal: any): { city: string; area: string } => {
                let city = '';
                let area = '';
                try {
                  if (!locVal) return { city, area };
                  if (typeof locVal === 'string') {
                    const parts = String(locVal).split(',').map((s) => s.trim());
                    city = parts[0] || '';
                    area = parts.slice(1).join(', ') || '';
                    return { city, area };
                  }
                  if (Array.isArray(locVal)) {
                    const s = locVal.filter(Boolean).join(', ');
                    const parts = s.split(',').map((x) => x.trim());
                    city = parts[0] || '';
                    area = parts.slice(1).join(', ') || '';
                    return { city, area };
                  }
                  if (typeof locVal === 'object') {
                    city = locVal.city || locVal.town || locVal.cityName || '';
                    area = locVal.area || locVal.locality || locVal.neighbourhood || '';
                    if (!city && !area) {
                      const s = locVal.address || locVal.formatted || '';
                      if (s) {
                        const parts = String(s).split(',').map((x) => x.trim());
                        city = parts[0] || '';
                        area = parts.slice(1).join(', ') || '';
                      }
                    }
                    return { city, area };
                  }
                } catch {}
                return { city, area };
              };
              let { city, area } = parseLocation((t as any).location);
              const normalizeSessionType = (val: string) => {
                const s = (val || '').toLowerCase();
                if (s.includes('video') || s === 'online') return 'video';
                if (s.includes('audio')) return 'audio';
                if (s.includes('home')) return 'at-home';
                if (s.includes('clinic')) return 'in-clinic';
                return s || 'video';
              };
              const rawSessions = Array.isArray((t as any).sessionTypes)
                ? ((t as any).sessionTypes as string[])
                : typeof (t as any).sessionTypes === 'string'
                ? [(t as any).sessionTypes as string]
                : [];
              const sessionFormats = rawSessions.map(normalizeSessionType);
              const isOnline = sessionFormats.includes('video');
              if (!city && !area && isOnline) city = 'Online';
              return {
                id: t._id,
                name: t.displayName || 'Therapist',
                specialty: t.title || 'Therapist',
                therapyTypes: t.specializations || [],
                conditions: t.specializations || [],
                experience: t.experience || 0,
                rating: t.rating || 0,
                reviews: t.reviewCount || 0,
                price: t.consultationFee || 0,
                sessionFormats,
                ageGroups: [],
                location: { city, area },
                availability: t.availabilityText || 'Available',
                image: (t as any).image || '/logo.png',
                isOnline,
                verified: Boolean((t as any).isVerified ?? true),
                languages: t.languages || [],
              } as TherapistData;
            })}
            // The component includes its own filters/sidebar and results rendering
          />
        </div>
        {/* Results render within AdvancedTherapistSearch */}
      </div>
    </div>
  );
}

