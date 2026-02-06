"use client";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  MapPin,
  Clock,
  Video,
  Phone,
  Building,
  Home,
  Award,
  MessageCircle,
  Calendar,
} from "lucide-react";
import React from "react";

export interface TherapistData {
  id: string;
  name: string;
  specialty: string;
  therapyTypes: string[];
  conditions: string[];
  experience: number;
  rating: number;
  reviews: number;
  price: number;
  sessionFormats: string[];
  ageGroups: string[];
  location: {
    city: string;
    area: string;
  };
  availability: string;
  image: string;
  isOnline: boolean;
  verified: boolean;
  languages: string[];
}

export interface SearchResultsComponentProps {
  therapists: TherapistData[];
  searchQuery: string;
  onBookSession: (therapistId: string) => void;
  onViewProfile: (therapistId: string) => void;
}

export function SearchResultsComponent({
  therapists,
  searchQuery,
  onBookSession,
  onViewProfile,
}: SearchResultsComponentProps) {
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = String(text).split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded font-medium">
          {part}
        </mark>
      ) : (
        <React.Fragment key={index}>{part}</React.Fragment>
      )
    );
  };

  const getSessionFormatIcon = (format: string) => {
    switch (format) {
      case "video":
        return <Video className="w-3 h-3" />;
      case "audio":
        return <Phone className="w-3 h-3" />;
      case "in-clinic":
        return <Building className="w-3 h-3" />;
      case "at-home":
        return <Home className="w-3 h-3" />;
      default:
        return <Video className="w-3 h-3" />;
    }
  };

  const formatSessionTypes = (formats: string[]) => {
    const formatMap: { [key: string]: string } = {
      video: "Video",
      audio: "Audio",
      "in-clinic": "In-Clinic",
      "at-home": "Home Visit",
    };
    return formats.map((f) => formatMap[f] || f);
  };

  if (!therapists || therapists.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 bg-slate-100 rounded-full flex items-center justify-center">
          <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">No therapists found</h3>
        <p className="text-sm sm:text-base text-slate-500 mb-4">Try adjusting your search criteria or filters to find more results.</p>
        <div className="text-xs sm:text-sm text-slate-400">{searchQuery && <p>No results for "{searchQuery}"</p>}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {searchQuery && (
        <div className="mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-slate-600">
            Showing {therapists.length} results for <span className="font-medium text-slate-900">"{searchQuery}"</span>
          </p>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {therapists.map((therapist, index) => (
          <motion.div
            key={therapist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden border border-slate-200/70 bg-white/90 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.45)] transition-all duration-300 hover:shadow-[0_20px_36px_-26px_rgba(15,23,42,0.5)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500" />
              <CardContent className="p-4 sm:p-5 lg:p-6 pt-5 sm:pt-6">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 lg:gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                      <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <img
                            src={therapist.image}
                            alt={therapist.name}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-white shadow-md"
                          />
                          {therapist.isOnline && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white">
                              <div className="w-full h-full bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1 flex-wrap">
                            <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                              {highlightSearchTerm(therapist.name, searchQuery)}
                            </h3>
                            {therapist.verified && <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />}
                          </div>

                          <p className="text-sm sm:text-base text-slate-600 mb-1.5 sm:mb-2 truncate">
                            {highlightSearchTerm(therapist.specialty, searchQuery)}
                          </p>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-1 sm:gap-0 text-xs sm:text-sm text-slate-500">
                            <span>{therapist.experience}+ years experience</span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{therapist.rating}</span>
                              <span>({therapist.reviews} reviews)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0 sm:ml-4">
                        <p className="text-[10px] sm:text-xs uppercase tracking-wide text-slate-500">Starting from</p>
                        <div className="mt-1 inline-flex items-end gap-1 rounded-full bg-blue-50 px-3 py-1">
                          <span className="text-lg sm:text-xl font-semibold text-blue-700">₹{therapist.price}</span>
                          <span className="text-[10px] sm:text-xs text-blue-700/70">per session</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4 mb-4">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Specializes in:</p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {therapist.therapyTypes.slice(0, 3).map((type, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[10px] sm:text-xs px-2 py-0.5">
                              {highlightSearchTerm(type, searchQuery)}
                            </Badge>
                          ))}
                          {therapist.therapyTypes.length > 3 && (
                            <Badge variant="outline" className="text-[10px] sm:text-xs px-2 py-0.5">
                              +{therapist.therapyTypes.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Treats conditions:</p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {therapist.conditions.slice(0, 4).map((condition, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-[10px] sm:text-xs bg-blue-50 text-blue-700 border-blue-200 px-2 py-0.5"
                            >
                              {highlightSearchTerm(condition, searchQuery)}
                            </Badge>
                          ))}
                          {therapist.conditions.length > 4 && (
                            <Badge variant="outline" className="text-[10px] sm:text-xs px-2 py-0.5">
                              +{therapist.conditions.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium text-slate-600 mb-1">Session Types</p>
                        <div className="flex flex-wrap gap-1">
                          {therapist.sessionFormats.map((format, idx) => (
                            <div key={idx} className="flex items-center space-x-1 bg-slate-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs">
                              {getSessionFormatIcon(format)}
                              <span className="whitespace-nowrap">{formatSessionTypes([format])[0]}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] sm:text-xs font-medium text-slate-600 mb-1">Location</p>
                        <div className="flex items-center space-x-1 text-xs sm:text-sm text-slate-700">
                          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">
                            {highlightSearchTerm(
                              `${therapist.location.area}, ${therapist.location.city}`,
                              searchQuery
                            )}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] sm:text-xs font-medium text-slate-600 mb-1">Next Available</p>
                        <div className="flex items-center space-x-1 text-xs sm:text-sm text-green-600">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{therapist.availability}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-[10px] sm:text-xs font-medium text-slate-600 mb-1">Languages</p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {therapist.languages.map((language, idx) => (
                          <span key={idx} className="text-[10px] sm:text-xs text-slate-600 bg-slate-50 px-2 py-0.5 sm:py-1 rounded">
                            {highlightSearchTerm(language, searchQuery)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-48 flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3 lg:gap-3 border-t lg:border-t-0 pt-4 lg:pt-0">
                    <Button
                      onClick={() => onBookSession(therapist.id)}
                      className="w-full sm:flex-1 lg:w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm sm:text-base py-2 sm:py-2.5"
                    >
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                      Book Session
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => onViewProfile(therapist.id)}
                      className="w-full sm:flex-1 lg:w-full border-blue-200 text-blue-600 hover:bg-blue-50 text-sm sm:text-base py-2 sm:py-2.5"
                    >
                      View Profile
                    </Button>

                    {therapist.isOnline && (
                      <Button variant="ghost" size="sm" className="w-full sm:flex-1 lg:w-full text-green-600 hover:bg-green-50 text-sm sm:text-base py-2 sm:py-2.5">
                        <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                        Chat Now
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}




