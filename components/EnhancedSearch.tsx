import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search,
  MapPin,
  Calendar,
  Clock,
  Mic,
  MicOff,
  History,
  TrendingUp,
  Star,
  Users,
  Filter,
  X,
  ChevronDown,
  Brain,
  Heart,
  Activity,
  MessageCircle,
  Stethoscope,
  Baby,
  Eye,
  Zap,
  Target,
  FileText,
  Award
} from "lucide-react";
import { ViewType } from "@/constants/app-data";
import { useTherapistSearch } from "./TherapistSearchContext";

interface EnhancedSearchProps {
  onSearch: (searchParams: SearchParams) => void;
  setCurrentView?: (view: ViewType) => void;
  variant?: "hero" | "page" | "compact";
  placeholder?: string;
  showFilters?: boolean;
}

interface SearchParams {
  query: string;
  location: string;
  date: string;
  sessionType: string;
  specialty: string;
  availability: string;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: "therapist" | "specialty" | "condition" | "location" | "recent";
  category?: string;
  count?: number;
  icon?: React.ReactNode;
}

export function EnhancedSearch({ 
  onSearch, 
  setCurrentView, 
  variant = "page", 
  placeholder = "Search therapists, specialties, conditions...",
  showFilters = true 
}: EnhancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSessionType, setSelectedSessionType] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { setFilterState, clearFilterState } = useTherapistSearch();

  // Mock data for search suggestions
  const allSuggestions: SearchSuggestion[] = [
    // Therapists
    { id: "t1", text: "Dr. Priya Sharma", type: "therapist", category: "Clinical Psychology", icon: <Users className="w-4 h-4" /> },
    { id: "t2", text: "Dr. Rajesh Kumar", type: "therapist", category: "Physiotherapy", icon: <Users className="w-4 h-4" /> },
    { id: "t3", text: "Dr. Kavita Mehta", type: "therapist", category: "Speech Therapy", icon: <Users className="w-4 h-4" /> },
    
    // Specialties
    { id: "s1", text: "Clinical Psychology", type: "specialty", count: 156, icon: <Brain className="w-4 h-4" /> },
    { id: "s2", text: "Physiotherapy", type: "specialty", count: 203, icon: <Activity className="w-4 h-4" /> },
    { id: "s3", text: "Speech Therapy", type: "specialty", count: 89, icon: <MessageCircle className="w-4 h-4" /> },
    { id: "s4", text: "Occupational Therapy", type: "specialty", count: 124, icon: <Target className="w-4 h-4" /> },
    { id: "s5", text: "ABA Therapy", type: "specialty", count: 67, icon: <FileText className="w-4 h-4" /> },
    { id: "s6", text: "Special Education", type: "specialty", count: 91, icon: <Award className="w-4 h-4" /> },
    
    // Conditions
    { id: "c1", text: "Anxiety & Stress", type: "condition", count: 234, icon: <Heart className="w-4 h-4" /> },
    { id: "c2", text: "Depression & Mood", type: "condition", count: 189, icon: <Brain className="w-4 h-4" /> },
    { id: "c3", text: "Back & Neck Pain", type: "condition", count: 267, icon: <Activity className="w-4 h-4" /> },
    { id: "c4", text: "Speech Delay", type: "condition", count: 145, icon: <MessageCircle className="w-4 h-4" /> },
    { id: "c5", text: "ADHD", type: "condition", count: 123, icon: <Zap className="w-4 h-4" /> },
    { id: "c6", text: "Autism (ASD)", type: "condition", count: 167, icon: <Baby className="w-4 h-4" /> },
    
    // Locations
    { id: "l1", text: "Mumbai", type: "location", count: 456, icon: <MapPin className="w-4 h-4" /> },
    { id: "l2", text: "Delhi", type: "location", count: 389, icon: <MapPin className="w-4 h-4" /> },
    { id: "l3", text: "Bangalore", type: "location", count: 234, icon: <MapPin className="w-4 h-4" /> },
    { id: "l4", text: "Pune", type: "location", count: 178, icon: <MapPin className="w-4 h-4" /> },
    { id: "l5", text: "Chennai", type: "location", count: 156, icon: <MapPin className="w-4 h-4" /> }
  ];

  const trendingSearches = [
    "Anxiety therapy near me",
    "Best physiotherapist",
    "Speech therapy for kids",
    "Online psychology sessions",
    "ADHD specialist",
    "Autism therapy",
    "Depression counseling",
    "Back pain treatment"
  ];

  // Filter suggestions based on search query
  const filteredSuggestions = searchQuery.length > 0
    ? allSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  const recentSearches = searchHistory.slice(0, 5);

  // Voice search functionality
  const toggleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in this browser');
      return;
    }

    if (isVoiceSearching) {
      setIsVoiceSearching(false);
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsVoiceSearching(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsVoiceSearching(false);
    };

    recognition.onerror = () => {
      setIsVoiceSearching(false);
    };

    recognition.onend = () => {
      setIsVoiceSearching(false);
    };

    recognition.start();
  };

  // Handle search submission
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    // Add to search history
    if (!searchHistory.includes(searchQuery)) {
      setSearchHistory(prev => [searchQuery, ...prev.slice(0, 9)]);
    }

    // Close suggestions
    setShowSuggestions(false);

    // Prepare search parameters
    const searchParams: SearchParams = {
      query: searchQuery,
      location: selectedLocation,
      date: selectedDate,
      sessionType: selectedSessionType,
      specialty: selectedSpecialty,
      availability: selectedAvailability
    };

    // Update filter state for context
    const filters: any = {};
    if (searchQuery) filters.searchQuery = searchQuery;
    if (selectedLocation) filters.locations = [selectedLocation];
    if (selectedSpecialty) filters.therapyTypes = [selectedSpecialty];
    if (selectedSessionType) filters.sessionFormats = [selectedSessionType];
    if (selectedAvailability) filters.availability = [selectedAvailability];

    setFilterState(filters);
    onSearch(searchParams);
    
    // Navigate to search results if setCurrentView is provided
    if (setCurrentView) {
      setCurrentView("therapist-search");
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    
    // Set appropriate filters based on suggestion type
    if (suggestion.type === "specialty") {
      setSelectedSpecialty(suggestion.text);
    } else if (suggestion.type === "location") {
      setSelectedLocation(suggestion.text);
    }
    
    // Trigger search immediately
    setTimeout(handleSearch, 100);
  };

  // Handle trending search click
  const handleTrendingClick = (trend: string) => {
    setSearchQuery(trend);
    setShowSuggestions(false);
    setTimeout(handleSearch, 100);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedLocation("");
    setSelectedDate("");
    setSelectedSessionType("");
    setSelectedSpecialty("");
    setSelectedAvailability("");
    clearFilterState();
  };

  // Get container classes based on variant
  const getContainerClasses = () => {
    switch (variant) {
      case "hero":
        return "bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-6";
      case "compact":
        return "bg-white rounded-lg shadow-lg p-4 space-y-4";
      default:
        return "bg-white rounded-xl shadow-xl p-6 space-y-6";
    }
  };

  const getInputClasses = () => {
    switch (variant) {
      case "hero":
        return "pl-12 pr-20 bg-white/95 border-0 text-gray-700 placeholder-gray-500 rounded-xl h-14 text-lg";
      case "compact":
        return "pl-10 pr-16 h-10 border-gray-200 focus:ring-blue-500";
      default:
        return "pl-12 pr-20 h-12 border-gray-200 focus:ring-blue-500";
    }
  };

  return (
    <div className="relative">
      <Card className={getContainerClasses()}>
        {variant === "hero" && (
          <h3 className="text-white font-medium text-2xl text-center">
            Find Your Perfect Therapist
          </h3>
        )}

        {/* Main Search Bar */}
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 ${
            variant === "compact" ? "w-4 h-4" : "w-5 h-5"
          }`} />
          
          <Input
            ref={searchInputRef}
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className={getInputClasses()}
          />

          {/* Voice Search & Clear Button */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {searchQuery && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSearchQuery("")}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleVoiceSearch}
              className={`h-8 w-8 p-0 ${
                isVoiceSearching 
                  ? "text-red-500 hover:text-red-600 animate-pulse" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {isVoiceSearching ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick Filters - Desktop */}
        {showFilters && variant !== "compact" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className={variant === "hero" ? "bg-white/95 border-0 h-12" : "h-10"}>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <SelectValue placeholder="Location" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mumbai">Mumbai</SelectItem>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="bangalore">Bangalore</SelectItem>
                <SelectItem value="pune">Pune</SelectItem>
                <SelectItem value="chennai">Chennai</SelectItem>
                <SelectItem value="online">Online Sessions</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className={variant === "hero" ? "bg-white/95 border-0 h-12" : "h-10"}>
                <div className="flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-gray-500" />
                  <SelectValue placeholder="Specialty" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clinical-psychology">Clinical Psychology</SelectItem>
                <SelectItem value="physiotherapy">Physiotherapy</SelectItem>
                <SelectItem value="speech-therapy">Speech Therapy</SelectItem>
                <SelectItem value="occupational-therapy">Occupational Therapy</SelectItem>
                <SelectItem value="aba-therapy">ABA Therapy</SelectItem>
                <SelectItem value="special-education">Special Education</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className={variant === "hero" ? "bg-white/95 border-0 h-12" : "h-10"}>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <SelectValue placeholder="Date" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="next-week">Next Week</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={handleSearch}
              className={variant === "hero" 
                ? "bg-blue-600 hover:bg-blue-700 text-white h-12" 
                : "bg-blue-600 hover:bg-blue-700 text-white h-10"
              }
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        )}

        {/* Compact Search Button */}
        {variant === "compact" && (
          <Button onClick={handleSearch} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <Search className="w-4 h-4 mr-2" />
            Search Therapists
          </Button>
        )}

        {/* Advanced Filters Toggle */}
        {showFilters && variant !== "compact" && (
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
            </Button>
            
            {(selectedLocation || selectedDate || selectedSessionType || selectedSpecialty || selectedAvailability) && (
              <Button variant="ghost" onClick={clearAllFilters} className="text-sm text-red-600 hover:text-red-800">
                Clear All
              </Button>
            )}
          </div>
        )}

        {/* Advanced Filters */}
        <AnimatePresence>
          {isAdvancedOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedSessionType} onValueChange={setSelectedSessionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Session Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="audio">Audio Call</SelectItem>
                    <SelectItem value="in-clinic">In-Clinic</SelectItem>
                    <SelectItem value="at-home">Home Visit</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                  <SelectTrigger>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <SelectValue placeholder="Availability" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (6 AM - 12 PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12 PM - 6 PM)</SelectItem>
                    <SelectItem value="evening">Evening (6 PM - 10 PM)</SelectItem>
                    <SelectItem value="weekend">Weekends</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    More filters coming soon
                  </Badge>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (searchQuery.length > 0 || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-50 mt-2"
          >
            <Card className="shadow-xl border-0">
              <ScrollArea className="max-h-96">
                <div className="p-4 space-y-4">
                  {/* Filtered Suggestions */}
                  {filteredSuggestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Suggestions</h4>
                      <div className="space-y-1">
                        {filteredSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg text-left"
                          >
                            <div className="text-gray-400">
                              {suggestion.icon}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {suggestion.text}
                              </div>
                              {suggestion.category && (
                                <div className="text-xs text-gray-500">
                                  {suggestion.category}
                                </div>
                              )}
                            </div>
                            {suggestion.count && (
                              <Badge variant="secondary" className="text-xs">
                                {suggestion.count}
                              </Badge>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Searches */}
                  {searchQuery.length === 0 && recentSearches.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                        <History className="w-4 h-4 mr-2" />
                        Recent Searches
                      </h4>
                      <div className="space-y-1">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSearchQuery(search);
                              setTimeout(handleSearch, 100);
                            }}
                            className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg text-left"
                          >
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{search}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Searches */}
                  {searchQuery.length === 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Trending Searches
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {trendingSearches.slice(0, 6).map((trend, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleTrendingClick(trend)}
                            className="text-xs h-7"
                          >
                            {trend}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Extend Window interface for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}