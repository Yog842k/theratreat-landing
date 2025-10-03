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
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <MessageCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No therapists found</h3>
        <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters to find more results.</p>
        <div className="text-sm text-gray-400">{searchQuery && <p>No results for "{searchQuery}"</p>}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {searchQuery && (
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {therapists.length} results for <span className="font-medium text-gray-900">"{searchQuery}"</span>
          </p>
        </div>
      )}

      <div className="space-y-4">
        {therapists.map((therapist, index) => (
          <motion.div
            key={therapist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={therapist.image}
                            alt={therapist.name}
                            className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-100"
                          />
                          {therapist.isOnline && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white">
                              <div className="w-full h-full bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-blue-600">
                              {highlightSearchTerm(therapist.name, searchQuery)}
                            </h3>
                            {therapist.verified && <Award className="w-4 h-4 text-green-500" />}
                          </div>

                          <p className="text-gray-600 mb-1">
                            {highlightSearchTerm(therapist.specialty, searchQuery)}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{therapist.experience}+ years experience</span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{therapist.rating}</span>
                              <span>({therapist.reviews} reviews)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">Starting from</p>
                        <p className="text-xl font-bold text-blue-600">₹{therapist.price}</p>
                        <p className="text-xs text-gray-500">per session</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Specializes in:</p>
                        <div className="flex flex-wrap gap-2">
                          {therapist.therapyTypes.slice(0, 3).map((type, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {highlightSearchTerm(type, searchQuery)}
                            </Badge>
                          ))}
                          {therapist.therapyTypes.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{therapist.therapyTypes.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Treats conditions:</p>
                        <div className="flex flex-wrap gap-2">
                          {therapist.conditions.slice(0, 4).map((condition, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {highlightSearchTerm(condition, searchQuery)}
                            </Badge>
                          ))}
                          {therapist.conditions.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{therapist.conditions.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Session Types</p>
                        <div className="flex flex-wrap gap-1">
                          {therapist.sessionFormats.map((format, idx) => (
                            <div key={idx} className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded text-xs">
                              {getSessionFormatIcon(format)}
                              <span>{formatSessionTypes([format])[0]}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Location</p>
                        <div className="flex items-center space-x-1 text-sm text-gray-700">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {highlightSearchTerm(
                              `${therapist.location.area}, ${therapist.location.city}`,
                              searchQuery
                            )}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Next Available</p>
                        <div className="flex items-center space-x-1 text-sm text-green-600">
                          <Clock className="w-4 h-4" />
                          <span>{therapist.availability}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-600 mb-1">Languages</p>
                      <div className="flex space-x-2">
                        {therapist.languages.map((language, idx) => (
                          <span key={idx} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            {highlightSearchTerm(language, searchQuery)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-48 flex lg:flex-col space-x-3 lg:space-x-0 lg:space-y-3">
                    <Button
                      onClick={() => onBookSession(therapist.id)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Session
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => onViewProfile(therapist.id)}
                      className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      View Profile
                    </Button>

                    {therapist.isOnline && (
                      <Button variant="ghost" size="sm" className="flex-1 text-green-600 hover:bg-green-50">
                        <MessageCircle className="w-4 h-4 mr-2" />
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
