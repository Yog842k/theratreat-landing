import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BookOpen, 
  Video, 
  Users, 
  Clock, 
  Star,
  Play,
  Download,
  Award,
  Search,
  Filter,
  CheckCircle,
  Lock,
  Globe
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  instructor: string;
  instructorImage: string;
  type: "Course" | "Workshop" | "Webinar" | "Seminar";
  domain: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  studentsEnrolled: number;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  image: string;
  description: string;
  modules: number;
  certificate: boolean;
  liveSession: boolean;
  language: string;
  lastUpdated: string;
  tags: string[];
}

const courses: Course[] = [
  {
    id: "1",
    title: "Advanced Physical Therapy Techniques",
    instructor: "Dr. Sarah Mitchell",
    instructorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
    type: "Course",
    domain: "Physical Therapy",
    price: 4999,
    originalPrice: 6999,
    rating: 4.8,
    reviewCount: 234,
    studentsEnrolled: 1247,
    duration: "8 hours",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
    description: "Master advanced techniques in physical therapy including manual therapy, dry needling, and movement analysis.",
    modules: 12,
    certificate: true,
    liveSession: true,
    language: "English",
    lastUpdated: "Jan 2025",
    tags: ["Manual Therapy", "Movement Analysis", "Pain Management"]
  },
  {
    id: "2",
    title: "Telehealth Best Practices for Therapists",
    instructor: "Michael Chen",
    instructorImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
    type: "Workshop",
    domain: "Telehealth",
    price: 1999,
    rating: 4.7,
    reviewCount: 156,
    studentsEnrolled: 892,
    duration: "4 hours",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop",
    description: "Learn how to effectively conduct therapy sessions remotely while maintaining quality care.",
    modules: 6,
    certificate: true,
    liveSession: false,
    language: "English",
    lastUpdated: "Dec 2024",
    tags: ["Digital Health", "Remote Care", "Technology"]
  },
  {
    id: "3",
    title: "Pediatric Psychology Assessment Tools",
    instructor: "Dr. Emily Rodriguez",
    instructorImage: "https://images.unsplash.com/photo-1594824388875-fb4d2b3d7518?w=100&h=100&fit=crop&crop=face",
    type: "Seminar",
    domain: "Psychology",
    price: 2499,
    originalPrice: 3499,
    rating: 4.9,
    reviewCount: 89,
    studentsEnrolled: 456,
    duration: "6 hours",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=250&fit=crop",
    description: "Comprehensive guide to psychological assessment tools specifically designed for pediatric populations.",
    modules: 8,
    certificate: true,
    liveSession: true,
    language: "English",
    lastUpdated: "Jan 2025",
    tags: ["Child Psychology", "Assessment", "Development"]
  },
  {
    id: "4",
    title: "Rehabilitation Technology and Tools",
    instructor: "Prof. David Kim",
    instructorImage: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&h=100&fit=crop&crop=face",
    type: "Webinar",
    domain: "Rehabilitation",
    price: 799,
    rating: 4.6,
    reviewCount: 67,
    studentsEnrolled: 234,
    duration: "2 hours",
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop",
    description: "Introduction to modern rehabilitation technology and how to integrate it into your practice.",
    modules: 4,
    certificate: false,
    liveSession: true,
    language: "English",
    lastUpdated: "Jan 2025",
    tags: ["Technology", "Equipment", "Innovation"]
  }
];

const domains = ["All Domains", "Physical Therapy", "Psychology", "Telehealth", "Rehabilitation", "Mental Health"];
const types = ["All Types", "Course", "Workshop", "Webinar", "Seminar"];
const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];

export function TheraLearn() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All Domains");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [currentView, setCurrentView] = useState<"courses" | "course-detail" | "my-learning">("courses");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>(["1"]); // Sample enrolled course

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDomain = selectedDomain === "All Domains" || course.domain === selectedDomain;
    const matchesType = selectedType === "All Types" || course.type === selectedType;
    const matchesLevel = selectedLevel === "All Levels" || course.level === selectedLevel;
    
    return matchesSearch && matchesDomain && matchesType && matchesLevel;
  });

  const enrollInCourse = (courseId: string) => {
    setEnrolledCourses(prev => [...prev, courseId]);
  };

  if (currentView === "course-detail" && selectedCourse) {
    return (
      <CourseDetail 
        course={selectedCourse}
        isEnrolled={enrolledCourses.includes(selectedCourse.id)}
        onBack={() => setCurrentView("courses")}
        onEnroll={() => enrollInCourse(selectedCourse.id)}
      />
    );
  }

  if (currentView === "my-learning") {
    return (
      <MyLearningDashboard 
        enrolledCourses={courses.filter(c => enrolledCourses.includes(c.id))}
        onBack={() => setCurrentView("courses")}
        onViewCourse={(course) => {
          setSelectedCourse(course);
          setCurrentView("course-detail");
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">TheraLearn</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Advance your healthcare expertise with our comprehensive learning platform. 
          Access courses, workshops, and certifications from industry experts.
        </p>
        <div className="flex justify-center space-x-4">
          <Button onClick={() => setCurrentView("my-learning")}>
            <BookOpen className="w-4 h-4 mr-2" />
            My Learning ({enrolledCourses.length})
          </Button>
          <Button variant="outline">
            <Award className="w-4 h-4 mr-2" />
            My Certificates
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search courses, instructors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger>
                <SelectValue placeholder="Domain" />
              </SelectTrigger>
              <SelectContent>
                {domains.map(domain => (
                  <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Course Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-all group">
            <div className="relative">
              <div 
                className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 rounded"
              >
                Course Image
              </div>
              <Badge className="absolute top-3 left-3 bg-blue-600 text-white">
                {course.type}
              </Badge>
              {course.originalPrice && (
                <Badge className="absolute top-3 right-3 bg-red-500 text-white">
                  {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                </Badge>
              )}
              {course.liveSession && (
                <Badge className="absolute bottom-3 left-3 bg-green-500 text-white">
                  <Globe className="w-3 h-3 mr-1" />
                  Live Session
                </Badge>
              )}
            </div>

            <CardContent className="p-4 space-y-3">
              <div>
                <Badge variant="outline" className="mb-2">{course.domain}</Badge>
                <h3 className="font-semibold line-clamp-2 cursor-pointer hover:text-blue-600"
                    onClick={() => {
                      setSelectedCourse(course);
                      setCurrentView("course-detail");
                    }}>
                  {course.title}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={course.instructorImage} alt={course.instructor} />
                  <AvatarFallback>{course.instructor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{course.instructor}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{course.rating}</span>
                  <span className="text-muted-foreground">({course.reviewCount})</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{course.studentsEnrolled.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                <Badge variant="secondary">{course.level}</Badge>
                {course.certificate && (
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>Certificate</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {course.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold">₹{course.price.toLocaleString()}</span>
                  {course.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{course.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => {
                    setSelectedCourse(course);
                    setCurrentView("course-detail");
                  }}
                >
                  {enrolledCourses.includes(course.id) ? "Continue Learning" : "View Details"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Instructors */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Instructors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            {Array.from(new Set(courses.map(c => c.instructor))).slice(0, 4).map((instructor, index) => {
              const instructorCourses = courses.filter(c => c.instructor === instructor);
              const avgRating = instructorCourses.reduce((sum, c) => sum + c.rating, 0) / instructorCourses.length;
              const totalStudents = instructorCourses.reduce((sum, c) => sum + c.studentsEnrolled, 0);
              
              return (
                <div key={index} className="text-center space-y-3">
                  <Avatar className="w-20 h-20 mx-auto">
                    <AvatarImage src={instructorCourses[0].instructorImage} alt={instructor} />
                    <AvatarFallback>{instructor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{instructor}</h3>
                    <p className="text-sm text-muted-foreground">{instructorCourses.length} courses</p>
                    <div className="flex items-center justify-center space-x-1 text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{avgRating.toFixed(1)}</span>
                      <span className="text-muted-foreground">• {totalStudents.toLocaleString()} students</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CourseDetail({ course, isEnrolled, onBack, onEnroll }: {
  course: Course;
  isEnrolled: boolean;
  onBack: () => void;
  onEnroll: () => void;
}) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Button variant="outline" onClick={onBack}>
        ← Back to Courses
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div 
              className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg"
            >
              Course Image
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Badge>{course.type}</Badge>
              <Badge variant="outline">{course.domain}</Badge>
              <Badge variant="outline">{course.level}</Badge>
              {course.certificate && <Badge variant="outline">Certificate Included</Badge>}
            </div>

            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-lg text-muted-foreground">{course.description}</p>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={course.instructorImage} alt={course.instructor} />
                  <AvatarFallback>{course.instructor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{course.instructor}</p>
                  <p className="text-sm text-muted-foreground">Instructor</p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{course.rating}</span>
                <span className="text-muted-foreground">({course.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex space-x-8">
              <button 
                className={`pb-2 ${activeTab === "overview" ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground"}`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              <button 
                className={`pb-2 ${activeTab === "curriculum" ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground"}`}
                onClick={() => setActiveTab("curriculum")}
              >
                Curriculum
              </button>
              <button 
                className={`pb-2 ${activeTab === "reviews" ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground"}`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews
              </button>
            </div>

            <div className="mt-6">
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">What you&apos;ll learn</h3>
                    <ul className="space-y-2">
                      {course.tags.map((tag, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Master {tag.toLowerCase()} techniques and applications</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Course Details</h3>
                    <div className="grid gap-2 md:grid-cols-2 text-sm">
                      <div>Duration: {course.duration}</div>
                      <div>Level: {course.level}</div>
                      <div>Modules: {course.modules}</div>
                      <div>Language: {course.language}</div>
                      <div>Last Updated: {course.lastUpdated}</div>
                      <div>Students: {course.studentsEnrolled.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "curriculum" && (
                <div className="space-y-4">
                  {Array.from({ length: course.modules }, (_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {isEnrolled ? (
                            <Play className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          )}
                          <div>
                            <h4 className="font-semibold">Module {i + 1}: Introduction to {course.tags[i % course.tags.length]}</h4>
                            <p className="text-sm text-muted-foreground">45 minutes • 3 lessons</p>
                          </div>
                        </div>
                        {isEnrolled && (
                          <Button size="sm" variant="outline">
                            Start Module
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-4">
                  <div className="text-center p-8 text-muted-foreground">
                    Reviews coming soon...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold">₹{course.price.toLocaleString()}</div>
                {course.originalPrice && (
                  <div className="text-muted-foreground line-through">
                    ₹{course.originalPrice.toLocaleString()}
                  </div>
                )}
              </div>

              {isEnrolled ? (
                <div className="space-y-3">
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-green-600">You&apos;re enrolled!</p>
                  </div>
                  <Button className="w-full" size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    Continue Learning
                  </Button>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>25%</span>
                    </div>
                    <Progress value={25} />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button className="w-full" size="lg" onClick={onEnroll}>
                    Enroll Now
                  </Button>
                  <Button variant="outline" className="w-full">
                    Add to Wishlist
                  </Button>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration} of content</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Video className="w-4 h-4" />
                  <span>{course.modules} modules</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Downloadable resources</span>
                </div>
                {course.certificate && (
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4" />
                    <span>Certificate of completion</span>
                  </div>
                )}
                {course.liveSession && (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>Live Q&A sessions</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About the Instructor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={course.instructorImage} alt={course.instructor} />
                  <AvatarFallback>{course.instructor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{course.instructor}</h3>
                  <p className="text-sm text-muted-foreground">Healthcare Expert</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold">4.8</div>
                  <div className="text-muted-foreground">Rating</div>
                </div>
                <div>
                  <div className="font-semibold">2,543</div>
                  <div className="text-muted-foreground">Students</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MyLearningDashboard({ enrolledCourses, onBack, onViewCourse }: {
  enrolledCourses: Course[];
  onBack: () => void;
  onViewCourse: (course: Course) => void;
}) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Back to Courses
        </Button>
        <h2 className="text-2xl font-bold">My Learning Dashboard</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            <div className="text-muted-foreground">Enrolled Courses</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">0</div>
            <div className="text-muted-foreground">Certificates Earned</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">25%</div>
            <div className="text-muted-foreground">Average Progress</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Continue Learning</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div 
                  className="w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-500 rounded text-xs"
                >
                  IMG
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">{course.instructor}</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>25%</span>
                      </div>
                      <Progress value={25} />
                    </div>
                    <Button size="sm" onClick={() => onViewCourse(course)}>
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
