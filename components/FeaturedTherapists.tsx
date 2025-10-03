import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Clock, Award, Shield, Calendar } from "lucide-react";

interface Therapist {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  image: string;
  department: string;
  location: string;
  experience: string;
  availability: string;
  verified: boolean;
  insurance: boolean;
}

const featuredTherapists: Therapist[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    title: "Licensed Clinical Psychologist",
    specialties: ["Anxiety & Depression", "Trauma Therapy", "Sleep Disorders"],
    rating: 4.9,
    reviewCount: 127,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    department: "Mental Health",
    location: "New York, NY",
    experience: "12+ years",
    availability: "Available Today",
    verified: true,
    insurance: true
  },
  {
    id: "2",
    name: "Michael Chen, PT",
    title: "Physical Therapist",
    specialties: ["Sports Injury", "Back Pain", "Post-Surgery Rehab"],
    rating: 4.8,
    reviewCount: 89,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    department: "Physical Therapy",
    location: "Los Angeles, CA",
    experience: "8+ years",
    availability: "Next Available: Tomorrow",
    verified: true,
    insurance: true
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    title: "Child Development Specialist",
    specialties: ["ADHD", "Learning Disabilities", "Behavioral Therapy"],
    rating: 4.9,
    reviewCount: 156,
    image: "https://images.unsplash.com/photo-1594824388875-fb4d2b3d7518?w=150&h=150&fit=crop&crop=face",
    department: "Pediatric Care",
    location: "Chicago, IL",
    experience: "15+ years",
    availability: "Available This Week",
    verified: true,
    insurance: true
  },
  {
    id: "4",
    name: "Dr. David Thompson",
    title: "Cardiovascular Therapist",
    specialties: ["Heart Health", "Cardiac Rehab", "Exercise Therapy"],
    rating: 4.7,
    reviewCount: 94,
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face",
    department: "Cardiovascular",
    location: "Houston, TX",
    experience: "10+ years",
    availability: "Available Next Week",
    verified: true,
    insurance: true
  }
];

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
        {featuredTherapists.map((therapist) => (
          <Card key={therapist.id} className="hover:shadow-lg transition-all border-2 hover:border-blue-200">
            <CardHeader className="pb-4">
              <div className="flex items-start space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={therapist.image} alt={therapist.name} />
                  <AvatarFallback>{therapist.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{therapist.name}</h3>
                      <p className="text-muted-foreground">{therapist.title}</p>
                    </div>
                    <div className="flex space-x-1">
                      {therapist.verified && (
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
                      <span>{therapist.rating}</span>
                      <span>({therapist.reviewCount} reviews)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{therapist.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{therapist.experience}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700 border-blue-200">
                  {therapist.department}
                </Badge>
                <div className="flex flex-wrap gap-1">
                  {therapist.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-green-600 font-medium">{therapist.availability}</span>
                  {therapist.insurance && (
                    <p className="text-muted-foreground">Insurance accepted</p>
                  )}
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
