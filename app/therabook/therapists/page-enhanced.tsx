'use client'
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  CheckCircle,
  Award,
  Calendar,
  ThumbsUp,
  Zap,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { SmartBookingButton } from '@/components/SmartBookingButton';

// Enhanced therapist data
const allTherapists = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    title: "Clinical Psychologist",
    specialization: "Clinical Psychology",
    image: "/api/placeholder/150/150",
    specialties: ["Anxiety", "Depression", "CBT"],
    rating: 4.9,
    reviews: 156,
    languages: ["Hindi", "English", "Marathi"],
    location: "Mumbai, Maharashtra",
    sessionTypes: ["Video", "Audio", "In-Clinic"],
    pricing: 1200,
    experience: "8 years",
    verified: true,
    availability: "Available today",
    conditions: ["Anxiety / Stress", "Depression & Mood"],
    nextSlot: "Today 3:00 PM",
    responseTime: "Usually responds in 2 hours",
    completedSessions: 1250,
    featured: true
  },
  {
    id: 2,
    name: "Dr. Rajeev Kumar",
    title: "Psychiatrist",
    specialization: "Psychiatry",
    image: "/api/placeholder/150/150",
    specialties: ["ADHD", "Bipolar", "Medication Management"],
    rating: 4.8,
    reviews: 234,
    languages: ["Hindi", "English", "Punjabi"],
    location: "Delhi, NCR",
    sessionTypes: ["Video", "In-Clinic"],
    pricing: 1800,
    experience: "12 years",
    verified: true,
    availability: "Available tomorrow",
    conditions: ["ADHD", "Bipolar Disorder"],
    nextSlot: "Tomorrow 10:00 AM",
    responseTime: "Usually responds in 1 hour",
    completedSessions: 2100
  },
  {
    id: 3,
    name: "Dr. Anita Desai",
    title: "Marriage & Family Therapist",
    specialization: "Family Therapy",
    image: "/api/placeholder/150/150",
    specialties: ["Relationships", "Family Conflicts", "Communication"],
    rating: 4.7,
    reviews: 89,
    languages: ["English", "Gujarati"],
    location: "Ahmedabad, Gujarat",
    sessionTypes: ["Video", "Audio"],
    pricing: 900,
    experience: "6 years",
    verified: true,
    availability: "Available today",
    conditions: ["Relationship Issues", "Family Conflicts"],
    nextSlot: "Today 6:00 PM",
    responseTime: "Usually responds in 3 hours",
    completedSessions: 680
  },
  {
    id: 4,
    name: "Dr. Vikram Singh",
    title: "Addiction Counselor",
    specialization: "Addiction Therapy",
    image: "/api/placeholder/150/150",
    specialties: ["Substance Abuse", "Behavioral Addictions", "Recovery"],
    rating: 4.6,
    reviews: 127,
    languages: ["Hindi", "English"],
    location: "Jaipur, Rajasthan",
    sessionTypes: ["Video", "Audio", "In-Clinic"],
    pricing: 1100,
    experience: "10 years",
    verified: true,
    availability: "Available today",
    conditions: ["Addiction Recovery", "Substance Abuse"],
    nextSlot: "Today 4:30 PM",
    responseTime: "Usually responds in 4 hours",
    completedSessions: 950,
    featured: true
  }
];

const specializations = [
  "All Specializations",
  "Clinical Psychology", 
  "Psychiatry",
  "Family Therapy",
  "Addiction Therapy",
  "Child Psychology",
  "Trauma Therapy"
];

const sessionTypeOptions = [
  "All Types",
  "Video Call",
  "Audio Call", 
  "In-Person"
];

const languages = [
  "All Languages",
  "Hindi",
  "English", 
  "Marathi",
  "Gujarati",
  "Tamil",
  "Telugu",
  "Bengali"
];

export default function TherapistsPage() {
  const [filteredTherapists, setFilteredTherapists] = useState(allTherapists);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All Specializations');
  const [selectedSessionType, setSelectedSessionType] = useState('All Types');
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages');
  const [priceRange, setPriceRange] = useState('All Prices');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Apply filters
  const filtered = allTherapists.filter(therapist => {
      const matchesSearch = therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           therapist.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           therapist.conditions.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesSpecialization = selectedSpecialization === 'All Specializations' || 
                                   therapist.specialization === selectedSpecialization;
      
      const matchesSessionType = selectedSessionType === 'All Types' ||
                                therapist.sessionTypes.some(type => 
                                  (selectedSessionType === 'Video Call' && type === 'Video') ||
                                  (selectedSessionType === 'Audio Call' && type === 'Audio') ||
                                  (selectedSessionType === 'In-Person' && type === 'In-Clinic')
                                );
      
      const matchesLanguage = selectedLanguage === 'All Languages' ||
                            therapist.languages.includes(selectedLanguage);

      return matchesSearch && matchesSpecialization && matchesSessionType && matchesLanguage;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return a.pricing - b.pricing;
        case 'price-high':
          return b.pricing - a.pricing;
        case 'experience':
          return parseInt(b.experience) - parseInt(a.experience);
        default:
          return 0;
      }
    });

    setFilteredTherapists(filtered);
  }, [searchQuery, selectedSpecialization, selectedSessionType, selectedLanguage, priceRange, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialization('All Specializations');
    setSelectedSessionType('All Types');
    setSelectedLanguage('All Languages');
    setPriceRange('All Prices');
    setSortBy('rating');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Find Your Perfect Therapist
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Connect with verified mental health professionals who understand your needs and speak your language
            </p>
          </div>

          {/* Search & Filter Section */}
          <div className="max-w-4xl mx-auto">
            {/* Main Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by therapist name, specialization, or condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 shadow-lg"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-xl border-2 border-gray-200 hover:border-gray-300"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              
              <div className="flex items-center gap-4">
                <span className="text-gray-600">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="experience">Most Experienced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map(spec => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSessionType} onValueChange={setSelectedSessionType}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Session Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionTypeOptions.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={clearFilters} className="rounded-xl">
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {filteredTherapists.length} therapists available
          </h2>
          {filteredTherapists.length === 0 && (
            <Button onClick={clearFilters} variant="outline" className="rounded-xl">
              Clear filters to see all therapists
            </Button>
          )}
        </div>

        {/* Therapist Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredTherapists.map((therapist) => (
            <Card key={therapist.id} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 rounded-3xl overflow-hidden bg-white relative">
              {therapist.featured && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-gradient-to-r from-orange-400 to-pink-500 text-white">
                    Featured
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20 ring-4 ring-white shadow-lg">
                      <AvatarImage src={therapist.image} alt={therapist.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
                        {therapist.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {therapist.verified && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{therapist.name}</h3>
                    <p className="text-gray-600 mb-2">{therapist.title}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 font-semibold">{therapist.rating}</span>
                        <span className="ml-1 text-sm text-gray-500">({therapist.reviews})</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        <span className="text-sm">{therapist.completedSessions} sessions</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {/* Specialties */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-1">
                    {therapist.specialties.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs bg-blue-100 text-blue-800 rounded-full">
                        {specialty}
                      </Badge>
                    ))}
                    {therapist.specialties.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 rounded-full">
                        +{therapist.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Key Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                    <span>{therapist.experience} exp</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-green-500" />
                    <span className="truncate">{therapist.location.split(',')[0]}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Languages className="w-4 h-4 mr-2 text-purple-500" />
                    <span>{therapist.languages.length} languages</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Zap className="w-4 h-4 mr-2 text-orange-500" />
                    <span className="truncate">{therapist.responseTime}</span>
                  </div>
                </div>

                {/* Session Types */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Sessions</h4>
                  <div className="flex gap-2">
                    {therapist.sessionTypes.map((type) => (
                      <div key={type} className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        {type === 'Video' && <Video className="w-3 h-3 mr-1" />}
                        {type === 'Audio' && <Phone className="w-3 h-3 mr-1" />}
                        {type === 'In-Clinic' && <Building className="w-3 h-3 mr-1" />}
                        {type}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability & Pricing */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-green-700">Next available</span>
                    <span className="text-lg font-bold text-gray-800">₹{therapist.pricing}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600">{therapist.nextSlot}</span>
                    <span className="text-sm text-gray-500">per session</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Link href={`/therabook/therapists/${therapist.id}`} className="flex-1">
                    <Button variant="outline" className="w-full rounded-xl border-2 border-gray-200 hover:border-blue-300">
                      View Profile
                    </Button>
                  </Link>
                  <Link href={`/therabook/therapists/${therapist.id}/book`} className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTherapists.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No therapists found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Try adjusting your search criteria or clear the filters to see all available therapists.
            </p>
            <Button onClick={clearFilters} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl">
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
