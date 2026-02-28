'use client'
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from "next/navigation";
import { helpMeChooseCategoryToSearch } from '@/constants/helpmechoose-mapping';
import { TherapistData } from '@/components/therabook/SearchResultsComponent';
import { AdvancedTherapistSearch } from '@/components/therabook/AdvancedTherapistSearch';

interface ApiTherapist {
  _id: string;
  displayName?: string;
  title?: string;
  specializations?: string[];
  therapyTypes?: string[];
  primaryFilters?: string[];
  conditions?: string[];
  primaryConditions?: string[];
  experience?: number;
  consultationFee?: number;
  sessionFee?: number;
  pricing?: Record<string, number> | Array<number | { amount?: number; price?: number; fee?: number }>;
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

type InitialFilters = {
  conditions?: string[];
  therapyTypes?: string[];
  sessionFormats?: string[];
  ageGroups?: string[];
  searchQuery?: string;
  city?: string;
  area?: string;
};

export default function TherapistsListingPage() {
  const [allTherapists, setAllTherapists] = useState<ApiTherapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [initialFilters, setInitialFilters] = useState<InitialFilters>({});
  const [therapistIdFilter, setTherapistIdFilter] = useState<string | null>(null);

  const searchParams = useSearchParams();

  // Handle URL parameters on component mount/change
  useEffect(() => {
    const search = searchParams?.get('search') || '';
    const condition = searchParams?.get('condition') || '';
    const therapy = searchParams?.get('therapy') || '';
    const locationParam = searchParams?.get('location') || '';
    const specialtyParam = searchParams?.get('specialty') || '';
    const sessionType = searchParams?.get('sessionType') || '';
    const category = searchParams?.get('category') || '';
    const source = searchParams?.get('source') || '';
    const therapistId = searchParams?.get('therapist') || '';
    
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

    const getAll = (key: string) => searchParams?.getAll(key) || [];
    const conditions = getAll('conditions').filter(Boolean);
    const therapyTypes = [
      ...getAll('therapyTypes'),
      ...getAll('therapyType'),
    ].filter(Boolean);
    const sessionFormats = [
      ...getAll('sessionFormats'),
      ...getAll('sessionFormat'),
      ...getAll('sessionType'),
    ].filter(Boolean);

    const mergedTherapyTypes = Array.from(new Set([
      ...therapyTypes,
      ...(specialtyParam ? [specialtyParam] : []),
    ].filter(Boolean)));

    const mergedSessionFormats = Array.from(new Set([
      ...sessionFormats,
      ...(finalSessionType ? [finalSessionType] : []),
    ].filter(Boolean)));

    const parseLocation = (value: string) => {
      const raw = (value || "").trim();
      if (!raw || raw.toLowerCase() === 'all') return { city: "", area: "" };
      if (raw.toLowerCase().replace(/\s+/g, "-") === "near-me") return { city: "near-me", area: "" };
      const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
      return {
        city: parts[0] || raw,
        area: parts.length > 1 ? parts.slice(1).join(", ") : "",
      };
    };

    const { city, area } = parseLocation(locationParam);

    setInitialFilters({
      searchQuery: finalSearchQuery || undefined,
      conditions: conditions.length ? conditions : undefined,
      therapyTypes: mergedTherapyTypes.length ? mergedTherapyTypes : undefined,
      sessionFormats: mergedSessionFormats.length ? mergedSessionFormats : undefined,
      city: city || undefined,
      area: area || undefined,
    });
    setTherapistIdFilter(therapistId || null);
  }, [searchParams]);

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
      } catch(e:any) {
        console.error('[TherapistsPage] Fetch error:', e?.message || e);
        setError(e.message);
      } finally { setLoading(false); }
    }
    load();
  }, []);

  const visibleTherapists = useMemo(() => {
    if (!therapistIdFilter) return allTherapists;
    const matched = allTherapists.filter((t) => String(t._id) === String(therapistIdFilter));
    return matched.length ? matched : allTherapists;
  }, [allTherapists, therapistIdFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-sm text-gray-600">Loading therapists...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-sm text-red-600">Unable to load therapists: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Advanced Header and Filter Sidebar */}
        <div className="mb-8">
          <AdvancedTherapistSearch
            key={searchParams?.toString() || "therapists"}
            initialFilters={initialFilters}
            therapists={(visibleTherapists || []).map((t): TherapistData => {
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
              // Calculate price: prefer pricing array/object from DB, then fallback to consultation/session fee
              const getDisplayPrice = () => {
                const pricing = (t as any).pricing;
                const toNumber = (value: any) => {
                  if (typeof value === 'number' && Number.isFinite(value)) return value;
                  if (typeof value === 'string') {
                    const parsed = Number(value.replace(/[^\d.]/g, ''));
                    return Number.isFinite(parsed) ? parsed : 0;
                  }
                  if (value && typeof value === 'object') {
                    const nested = value.amount ?? value.price ?? value.fee;
                    if (typeof nested === 'number') return nested;
                    if (typeof nested === 'string') {
                      const parsed = Number(nested.replace(/[^\d.]/g, ''));
                      return Number.isFinite(parsed) ? parsed : 0;
                    }
                  }
                  return 0;
                };
                if (Array.isArray(pricing)) {
                  const values = pricing.map(toNumber).filter((v) => v > 0);
                  if (values.length) return Math.min(...values);
                } else if (pricing && typeof pricing === 'object') {
                  const values = Object.values(pricing).map(toNumber).filter((v) => v > 0);
                  if (values.length) return Math.min(...values);
                }
                if (t.consultationFee && t.consultationFee > 0) return t.consultationFee;
                if ((t as any).sessionFee && (t as any).sessionFee > 0) return (t as any).sessionFee;
                return 0;
              };

              return {
                id: t._id,
                name: t.displayName || 'Therapist',
                specialty: t.title || 'Therapist',
                therapyTypes: t.specializations || [],
                conditions: t.specializations || [],
                experience: t.experience || 0,
                rating: t.rating || 0,
                reviews: t.reviewCount || 0,
                price: getDisplayPrice(),
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

