"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Clock,
  Award,
  Users,
  Star,
  CheckCircle,
  Download,
  Globe,
  BookOpen,
  Video,
  FileText,
  Share2,
  Heart,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Lock,
  PlayCircle,
  MessageSquare,
  ThumbsUp,
  Calendar,
  Target,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "reading" | "quiz" | "assignment";
  locked: boolean;
  completed?: boolean;
}

interface Module {
  id: string;
  title: string;
  duration: string;
  lessons: Lesson[];
}

interface Review {
  id: string;
  userName: string;
  userImage: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}

const courseData = {
  title: "Advanced Physical Therapy Techniques",
  subtitle: "Master evidence-based manual therapy, dry needling, and movement analysis",
  instructor: {
    name: "Dr. Sarah Mitchell",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop",
    title: "Senior Physical Therapist",
    bio: "Dr. Sarah Mitchell is a board-certified physical therapist with over 15 years of clinical experience. She specializes in orthopedic rehabilitation and manual therapy techniques. Sarah has published numerous research papers and regularly speaks at international conferences.",
    students: 5420,
    courses: 12,
    rating: 4.9,
  },
  image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop",
  rating: 4.8,
  reviewCount: 234,
  studentsEnrolled: 1247,
  level: "Advanced",
  duration: "8 hours",
  lastUpdated: "January 2025",
  language: "English",
  price: 4999,
  originalPrice: 6999,
  certificate: true,
  modules: 12,
  lectures: 48,
  downloadableResources: 15,
  whatYouWillLearn: [
    "Master advanced manual therapy techniques for musculoskeletal conditions",
    "Perform comprehensive movement analysis and functional assessments",
    "Apply dry needling safely and effectively for pain management",
    "Develop evidence-based treatment plans for complex cases",
    "Understand latest research in pain science and rehabilitation",
    "Integrate manual therapy with exercise prescription",
  ],
  requirements: [
    "Basic understanding of human anatomy and physiology",
    "Current physical therapy license or student in accredited program",
    "Completion of foundational manual therapy course (recommended)",
    "Access to practice environment for hands-on application",
  ],
  targetAudience: [
    "Licensed physical therapists seeking advanced skills",
    "PT students in final year of education",
    "Rehabilitation specialists and sports therapists",
    "Healthcare professionals working in orthopedics",
  ],
};

const curriculum: Module[] = [
  {
    id: "1",
    title: "Introduction to Advanced Manual Therapy",
    duration: "45 min",
    lessons: [
      { id: "1-1", title: "Course Overview & Learning Objectives", duration: "10 min", type: "video", locked: false, completed: true },
      { id: "1-2", title: "Evidence-Based Practice in Manual Therapy", duration: "15 min", type: "video", locked: false },
      { id: "1-3", title: "Assessment Principles", duration: "12 min", type: "video", locked: false },
      { id: "1-4", title: "Module 1 Quiz", duration: "8 min", type: "quiz", locked: false },
    ],
  },
  {
    id: "2",
    title: "Cervical Spine Techniques",
    duration: "1 hr 20 min",
    lessons: [
      { id: "2-1", title: "Cervical Anatomy Review", duration: "15 min", type: "video", locked: false },
      { id: "2-2", title: "Assessment Techniques", duration: "20 min", type: "video", locked: false },
      { id: "2-3", title: "Mobilization Techniques", duration: "25 min", type: "video", locked: true },
      { id: "2-4", title: "Case Studies", duration: "15 min", type: "reading", locked: true },
      { id: "2-5", title: "Practice Assignment", duration: "5 min", type: "assignment", locked: true },
    ],
  },
  {
    id: "3",
    title: "Thoracic & Lumbar Spine",
    duration: "1 hr 40 min",
    lessons: [
      { id: "3-1", title: "Thoracic Spine Assessment", duration: "18 min", type: "video", locked: true },
      { id: "3-2", title: "Thoracic Mobilization", duration: "22 min", type: "video", locked: true },
      { id: "3-3", title: "Lumbar Spine Techniques", duration: "25 min", type: "video", locked: true },
      { id: "3-4", title: "Red Flags & Contraindications", duration: "15 min", type: "video", locked: true },
      { id: "3-5", title: "Clinical Reasoning", duration: "20 min", type: "reading", locked: true },
    ],
  },
  {
    id: "4",
    title: "Dry Needling Fundamentals",
    duration: "2 hrs",
    lessons: [
      { id: "4-1", title: "Introduction to Dry Needling", duration: "20 min", type: "video", locked: true },
      { id: "4-2", title: "Safety & Hygiene Protocols", duration: "15 min", type: "video", locked: true },
      { id: "4-3", title: "Trigger Point Identification", duration: "30 min", type: "video", locked: true },
      { id: "4-4", title: "Needling Techniques - Upper Body", duration: "25 min", type: "video", locked: true },
      { id: "4-5", title: "Needling Techniques - Lower Body", duration: "25 min", type: "video", locked: true },
      { id: "4-6", title: "Module Assessment", duration: "5 min", type: "quiz", locked: true },
    ],
  },
];

const reviews: Review[] = [
  {
    id: "1",
    userName: "Dr. Rajesh Kumar",
    userImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop",
    rating: 5,
    date: "2 weeks ago",
    comment:
      "Outstanding course! The manual therapy techniques are explained clearly with excellent demonstrations. I've already implemented several techniques in my practice with great results.",
    helpful: 45,
  },
  {
    id: "2",
    userName: "Jennifer Adams",
    userImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
    rating: 5,
    date: "1 month ago",
    comment:
      "Dr. Mitchell's teaching style is fantastic. The course content is evidence-based and immediately applicable. The dry needling module was particularly valuable.",
    helpful: 38,
  },
  {
    id: "3",
    userName: "Michael Chen",
    userImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop",
    rating: 4,
    date: "1 month ago",
    comment:
      "Great course overall. Would have liked more case studies, but the technique demonstrations are top-notch. Highly recommend for intermediate to advanced practitioners.",
    helpful: 22,
  },
];

export default function EnrollmentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string | null>(null);
  useEffect(() => {
    params.then((p) => setCourseId(p.id)).catch(() => setCourseId(null));
  }, [params]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>(["1"]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]));
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle className="w-4 h-4" />;
      case "reading":
        return <FileText className="w-4 h-4" />;
      case "quiz":
        return <CheckCircle className="w-4 h-4" />;
      case "assignment":
        return <BookOpen className="w-4 h-4" />;
      default:
        return <PlayCircle className="w-4 h-4" />;
    }
  };

  const handleEnroll = async () => {
    try {
      if (!courseId) return;
      const res = await fetch("/api/theralearn/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        setIsEnrolled(true);
      }
    } catch (err) {
      console.error("[enroll]", err);
    }
  };

  return (
    <div className="w-full bg-orange-50/30 min-h-screen">
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Button variant="ghost" onClick={() => router.push("/theralearn")} className="text-white hover:bg-white/20 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-orange-600 text-white">{courseData.level}</Badge>
                  <Badge variant="outline" className="border-white text-white">
                    Best Seller
                  </Badge>
                </div>

                <h1 className="text-4xl font-bold">{courseData.title}</h1>
                <p className="text-xl text-gray-300">{courseData.subtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{courseData.rating}</span>
                  <span className="text-gray-400">({courseData.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{courseData.studentsEnrolled.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{courseData.duration} total</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 border-2 border-white">
                  <AvatarImage src={courseData.instructor.image} />
                  <AvatarFallback>{courseData.instructor.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Created by {courseData.instructor.name}</p>
                  <p className="text-sm text-gray-400">{courseData.instructor.title}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Last updated {courseData.lastUpdated}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>{courseData.language}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-6">
                <Card className="overflow-hidden border-2 border-orange-300">
                  <div className="relative">
                    <img src={courseData.image} alt={courseData.title} className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-orange-600 ml-1" />
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div>
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-3xl font-bold">₹{courseData.price.toLocaleString()}</span>
                        <span className="text-lg text-gray-500 line-through">₹{courseData.originalPrice.toLocaleString()}</span>
                        <Badge className="bg-green-500 text-white">
                          {Math.round((1 - courseData.price / courseData.originalPrice) * 100)}% OFF
                        </Badge>
                      </div>
                          <p className="text-sm text-red-600 font-semibold">Limited-time price</p>
                    </div>

                    {isEnrolled ? (
                      <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <Play className="w-4 h-4 mr-2" />
                        Go to Course
                      </Button>
                    ) : (
                      <Button onClick={handleEnroll} className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-xl">
                        Enroll Now
                      </Button>
                    )}

                    <div className="text-center text-sm text-gray-600">30-Day Money-Back Guarantee</div>

                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-semibold">This course includes:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-orange-600" />
                          <span>{courseData.lectures} video lectures</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Download className="w-4 h-4 text-orange-600" />
                          <span>{courseData.downloadableResources} downloadable resources</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-orange-600" />
                          <span>Certificate of completion</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-orange-600" />
                          <span>Lifetime access</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-orange-600" />
                          <span>Q&A support</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" className="flex-1 border-orange-300 hover:bg-orange-50">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" className="flex-1 border-orange-300 hover:bg-orange-50">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-white border-2 border-orange-200">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>What You'll Learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {courseData.whatYouWillLearn.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {courseData.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-orange-600 font-bold">-</span>
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Who This Course Is For</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {courseData.targetAudience.map((audience, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Target className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{audience}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Course Curriculum</CardTitle>
                      <div className="text-sm text-gray-600">
                            {courseData.modules} modules | {courseData.lectures} lectures | {courseData.duration}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {curriculum.map((module) => (
                      <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {expandedModules.includes(module.id) ? (
                              <ChevronDown className="w-5 h-5 text-orange-600" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-orange-600" />
                            )}
                            <div className="text-left">
                              <h4 className="font-semibold">{module.title}</h4>
                              <p className="text-sm text-gray-600">
                                    {module.lessons.length} lessons | {module.duration}
                              </p>
                            </div>
                          </div>
                        </button>

                        {expandedModules.includes(module.id) && (
                          <div className="border-t border-gray-200 bg-gray-50">
                            {module.lessons.map((lesson) => (
                              <div key={lesson.id} className="flex items-center justify-between p-4 hover:bg-white transition-colors">
                                <div className="flex items-center gap-3">
                                  {lesson.locked ? <Lock className="w-4 h-4 text-gray-400" /> : getLessonIcon(lesson.type)}
                                  <span className={lesson.locked ? "text-gray-400" : "text-gray-700"}>{lesson.title}</span>
                                  {lesson.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
                                </div>
                                <span className="text-sm text-gray-600">{lesson.duration}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructor">
                <Card>
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6 mb-6">
                      <Avatar className="w-24 h-24 border-4 border-orange-200">
                        <AvatarImage src={courseData.instructor.image} />
                        <AvatarFallback>{courseData.instructor.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-1">{courseData.instructor.name}</h3>
                        <p className="text-gray-600 mb-4">{courseData.instructor.title}</p>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-bold">{courseData.instructor.rating}</span>
                            </div>
                            <div className="text-sm text-gray-600">Instructor Rating</div>
                          </div>
                          <div>
                            <div className="font-bold mb-1">{courseData.instructor.students.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Students</div>
                          </div>
                          <div>
                            <div className="font-bold mb-1">{courseData.instructor.courses}</div>
                            <div className="text-sm text-gray-600">Courses</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed">{courseData.instructor.bio}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Student Reviews</CardTitle>
                      <div className="flex items-center gap-2">
                        <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                        <span className="text-2xl font-bold">{courseData.rating}</span>
                        <span className="text-gray-600">({courseData.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={review.userImage} />
                            <AvatarFallback>{review.userName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold">{review.userName}</p>
                                <p className="text-sm text-gray-600">{review.date}</p>
                              </div>
                              <div className="flex gap-1">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3">{review.comment}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <button className="flex items-center gap-1 text-gray-600 hover:text-orange-600">
                                <ThumbsUp className="w-4 h-4" />
                                <span>Helpful ({review.helpful})</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="hidden lg:block" />
        </div>
      </section>

      {!isEnrolled && (
        <div className="sticky bottom-0 bg-white border-t-2 border-orange-200 shadow-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold">₹{courseData.price.toLocaleString()}</span>
                <span className="text-gray-500 line-through">₹{courseData.originalPrice.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-600">Limited time offer</p>
            </div>
            <Button onClick={handleEnroll} size="lg" className="bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-xl">
              Enroll Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
