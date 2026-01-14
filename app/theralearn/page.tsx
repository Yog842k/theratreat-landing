"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Award,
  BookOpen,
  ClipboardCheck,
  Clock,
  GraduationCap,
  Headphones,
  Heart,
  Laptop,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ViewType } from "@/constants/app-data";
import { useAuth } from "@/components/auth/NewAuthContext";
import { cn } from "@/lib/cn";

type Course = {
  id: string;
  title: string;
  instructor: string;
  instructorRole: string;
  type: "Course" | "Workshop" | "Webinar" | "Seminar";
  category: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  ratingCount: number;
  tags: string[];
  image: string;
  description: string;
  modules: number;
  certificate: boolean;
  liveSession: boolean;
  skills: string[];
  progress?: number;
};

type Webinar = {
  id: string;
  title: string;
  startTime: string;
  durationMinutes: number;
  category?: string | null;
  level?: string | null;
  status?: string;
  hostName?: string;
   isPaid?: boolean;
   price?: number;
};

type WebinarRegistration = {
  status: string;
  joinCode: string | null;
  meetingUrl: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
};

type RazorpayConstructor = NonNullable<Window["Razorpay"]>;

function getStoredToken(preferred?: string | null) {
  if (preferred) return preferred;
  if (typeof window === "undefined") return null;
  const keys = ["token", "authToken", "auth_token", "access_token", "accessToken", "Authorization"];
  for (const key of keys) {
    const fromLocal = window.localStorage.getItem(key);
    if (fromLocal) return fromLocal;
    const fromSession = window.sessionStorage.getItem(key);
    if (fromSession) return fromSession;
  }
  // Cookie fallback (least preferred)
  const cookies = document.cookie.split(";").map((c) => c.trim());
  for (const c of cookies) {
    const [name, value] = c.split("=");
    if (keys.includes(name) && value) return decodeURIComponent(value);
  }
  return null;
}

const types = ["All Types", "Course", "Workshop", "Webinar", "Seminar"] as const;
const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"] as const;
const courseCategories = [
  "Neuro Rehab",
  "Pediatrics",
  "Mental Health",
  "Sports Physio",
  "Geriatrics",
  "Telehealth",
  "Career Development",
  "Assessment",
];

const testimonials = [
  {
    name: "Dr. Rajesh Kumar",
    role: "Physical Therapist",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    quote: "TheraLearn transformed my practice. The advanced PT program gave me techniques I applied immediately.",
    rating: 5,
  },
  {
    name: "Sarah Johnson",
    role: "Occupational Therapist",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    quote: "Great pacing and clinical relevance. The workshops answered edge cases I face weekly.",
    rating: 5,
  },
  {
    name: "Dr. Amit Patel",
    role: "Sports Physiotherapist",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    quote: "Live labs plus on-demand content made upskilling flexible around my clinic schedule.",
    rating: 5,
  },
];

const mapCourseFromApi = (item: any): Course => ({
  id: String(item._id || item.id),
  title: item.title ?? "Untitled course",
  instructor: item.instructor ?? item.instructorName ?? "Instructor",
  instructorRole: item.instructorRole ?? "Instructor",
  type: (item.type as Course["type"]) || "Course",
  category: item.category ?? "General",
  duration: item.duration ?? "Self-paced",
  level: (item.level as Course["level"]) || "Beginner",
  rating: item.rating ?? 0,
  ratingCount: item.ratingCount ?? 0,
  tags: Array.isArray(item.tags) ? item.tags : [],
  image: item.image ?? "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop",
  description: item.description ?? "",
  modules: item.modules ?? 0,
  certificate: Boolean(item.certificate),
  liveSession: Boolean(item.liveSession),
  skills: Array.isArray(item.skills) ? item.skills : [],
});

async function fetchJson<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });

  const data = await res.json();
  return data as ApiResponse<T>;
}

async function loadRazorpay(): Promise<RazorpayConstructor | null> {
  if (typeof window === "undefined") return null;
  if (window.Razorpay) return window.Razorpay;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(window.Razorpay || null);
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}

export default function TheraLearnPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const setCurrentView = useCallback<(view: ViewType) => void>(() => {}, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<(typeof types)[number]>("All Types");
  const [selectedLevel, setSelectedLevel] = useState<(typeof levels)[number]>("All Levels");
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [webinarsLoading, setWebinarsLoading] = useState(false);
  const [webinarRegistrations, setWebinarRegistrations] = useState<Record<string, WebinarRegistration>>({});
  const [webinarProcessing, setWebinarProcessing] = useState<string | null>(null);
  const [localView, setLocalView] = useState<
    | "courses"
    | "course-detail"
    | "my-learning"
    | "learning-paths"
    | "workshops"
    | "webinars"
    | "certifications"
  >("courses");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);

  useEffect(() => {
    const loadCourses = async () => {
      setCoursesLoading(true);
      try {
        const resp = await fetchJson<Course[]>("/api/theralearn/courses");
        if (resp?.success && Array.isArray(resp.data)) {
          setCourses(resp.data.map(mapCourseFromApi));
        }
      } catch (err) {
        console.error("[theralearn] load courses", err);
      } finally {
        setCoursesLoading(false);
      }
    };

    const loadEnrollments = async () => {
      const authToken = getStoredToken(token);
      if (!authToken) return;
      try {
        const resp = await fetchJson<any[]>("/api/theralearn/enrollments", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (resp?.success && Array.isArray(resp.data)) {
          const ids = resp.data
            .map((enrollment: any) => enrollment.courseId || enrollment.course?._id || enrollment.course?._id)
            .filter(Boolean)
            .map((id: any) => String(id));
          setEnrolledCourses(ids);
        }
      } catch (err: any) {
        // Suppress auth errors in unauthenticated mode
        if (!String(err?.message || "").toLowerCase().includes("auth")) {
          console.error("[theralearn] load enrollments", err);
        }
      }
    };

    const loadWebinars = async () => {
      setWebinarsLoading(true);
      try {
        const resp = await fetchJson<Webinar[]>("/api/theralearn/webinars?upcoming=true");
        if (resp?.success && Array.isArray(resp.data)) {
          const mapped = resp.data.map((w: any) => ({
            id: String(w._id || w.id),
            title: w.title ?? "Webinar",
            startTime: w.startTime,
            durationMinutes: w.durationMinutes ?? 0,
            category: w.category ?? null,
            level: w.level ?? null,
            status: w.status ?? "scheduled",
            hostName: w.hostName ?? "Instructor",
            isPaid: Boolean(w.isPaid),
            price: typeof w.price === "number" ? w.price : Number(w.price) || 0,
          }));
          setWebinars(mapped);
        }
      } catch (err) {
        console.error("[theralearn] load webinars", err);
      } finally {
        setWebinarsLoading(false);
      }
    };

    loadCourses();
    loadEnrollments();
    loadWebinars();
  }, [token]);

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          course.title.toLowerCase().includes(q) ||
          course.instructor.toLowerCase().includes(q) ||
          course.tags.some((tag) => tag.toLowerCase().includes(q));
        const matchesType = selectedType === "All Types" || course.type === selectedType;
        const matchesLevel = selectedLevel === "All Levels" || course.level === selectedLevel;
        return matchesSearch && matchesType && matchesLevel;
      }),
    [searchQuery, selectedType, selectedLevel]
  );

  const enrollInCourse = async (courseId: string) => {
    try {
      const authToken = getStoredToken(token);
      if (!authToken) {
        console.warn("[theralearn] missing auth token for enrollment");
        router.push("/auth/login");
        return;
      }
      const resp = await fetchJson<{ id?: string }>("/api/theralearn/enrollments", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ courseId }),
      });
      if (resp?.success) {
        setEnrolledCourses((prev) => (prev.includes(courseId) ? prev : [...prev, courseId]));
      } else {
        console.warn("Enroll failed", resp?.error || resp?.message);
      }
    } catch (err) {
      console.error("[theralearn] enroll", err);
    }
  };

  if (localView === "course-detail" && selectedCourse) {
    return (
      <CourseDetail
        course={selectedCourse}
        isEnrolled={enrolledCourses.includes(selectedCourse.id)}
        onBack={() => setLocalView("courses")}
        onEnroll={() => enrollInCourse(selectedCourse.id)}
      />
    );
  }

  if (localView === "my-learning") {
    return (
      <MyLearningDashboard
        enrolledCourses={courses.filter((c) => enrolledCourses.includes(c.id))}
        onBack={() => setLocalView("courses")}
        onViewCourse={(course) => {
          setSelectedCourse(course);
          setLocalView("course-detail");
        }}
      />
    );
  }

  if (localView === "learning-paths") {
    return (
      <PlaceholderView title="Learning Paths" onBack={() => setLocalView("courses")}>
        Cohort-based, guided paths launching soon.
      </PlaceholderView>
    );
  }
  if (localView === "workshops" || localView === "webinars") {
    return (
      <WebinarsView
        webinars={webinars}
        loading={webinarsLoading}
        registrations={webinarRegistrations}
        processingId={webinarProcessing}
        onView={(id) => router.push(`/theralearn/webinars/${id}`)}
        onRegister={async (webinar) => {
          const authToken = getStoredToken(token);
          if (!authToken) {
            console.warn("[theralearn] missing auth token for webinar registration");
            router.push("/auth/login");
            return;
          }

          if (webinar.isPaid) {
            setWebinarProcessing(webinar.id);
            try {
              const RazorpayCtor = await loadRazorpay();
              if (!RazorpayCtor) throw new Error("Payment unavailable");

              const orderResp = await fetchJson<any>(`/api/theralearn/webinars/${webinar.id}/pay`, {
                method: "POST",
                headers: { Authorization: `Bearer ${authToken}` },
              });

              if (!orderResp?.success || !orderResp.data?.orderId) {
                throw new Error(orderResp?.message || "Could not start payment");
              }

              const order = orderResp.data;
              const rzp = new RazorpayCtor({
                key: order.key,
                amount: order.amount,
                currency: order.currency || "INR",
                name: "TheraLearn Webinar",
                description: order.webinar?.title || "Webinar enrollment",
                order_id: order.orderId,
                notes: order.notes,
                prefill: {
                  name: user?.name || undefined,
                  email: user?.email || undefined,
                },
                handler: async (response: any) => {
                  try {
                    const verifyResp = await fetchJson<WebinarRegistration>(
                      `/api/theralearn/webinars/${webinar.id}/register`,
                      {
                        method: "POST",
                        headers: { Authorization: `Bearer ${authToken}` },
                        body: JSON.stringify({
                          paymentStatus: "paid",
                          paymentReference: response?.razorpay_payment_id,
                          razorpayPaymentId: response?.razorpay_payment_id,
                          razorpayOrderId: response?.razorpay_order_id,
                          razorpaySignature: response?.razorpay_signature,
                        }),
                      }
                    );

                    if (verifyResp?.success && verifyResp.data) {
                      setWebinarRegistrations((prev) => ({ ...prev, [webinar.id]: verifyResp.data }));
                    }
                  } catch (err) {
                    console.error("[theralearn] webinar payment verify", err);
                  } finally {
                    setWebinarProcessing(null);
                  }
                },
                modal: {
                  ondismiss: () => setWebinarProcessing(null),
                },
              });

              rzp.open();
            } catch (err) {
              console.error("[theralearn] webinar payment", err);
              setWebinarProcessing(null);
            }
            return;
          }

          setWebinarProcessing(webinar.id);
          try {
            const resp = await fetchJson<WebinarRegistration>(`/api/theralearn/webinars/${webinar.id}/register`, {
              method: "POST",
              headers: { Authorization: `Bearer ${authToken}` },
            });
            if (resp?.success && resp.data) {
              setWebinarRegistrations((prev) => ({ ...prev, [webinar.id]: resp.data }));
            }
          } catch (err) {
            console.error("[theralearn] webinar register", err);
          } finally {
            setWebinarProcessing(null);
          }
        }}
        onBack={() => setLocalView("courses")}
      />
    );
  }
  if (localView === "certifications") {
    return (
      <PlaceholderView title="Certifications" onBack={() => setLocalView("courses")}>
        Industry-recognized credentials coming soon.
      </PlaceholderView>
    );
  }

  return (
    <div
      className="w-full bg-orange-50/30"
      style={{ boxShadow: "inset 0 0 100px rgba(249, 115, 22, 0.1)" }}
    >
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Leading Therapy & Rehabilitation Learning Platform
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Advance Your <br />
                <span className="text-orange-200">Therapy & Rehabilitation Career</span>
              </h1>
              <p className="text-xl text-orange-100">
                Learn through live webinars, on-demand programs, certifications, and workshops — built by therapy and
                rehabilitation experts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-orange-50"
                  onClick={() => document.getElementById("browse-courses")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Explore Learning
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => setCurrentView?.("instructor-register")}
                >
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Become an Instructor
                </Button>
              </div>
              <div className="pt-8 space-y-3">
                <p className="text-orange-200 font-medium">Platform at a Glance</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { value: "50K+", label: "Learners" },
                    { value: "800+", label: "Learning Programs" },
                    { value: "200+", label: "Certificates" },
                    { value: "100+", label: "Institutional Partners" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="font-bold mb-1">{stat.value}</div>
                      <div className="text-orange-100 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {["Live", "On-Demand", "Offline", "Academic"].map((tag) => (
                    <Badge key={tag} variant="outline" className="border-white/30 text-white">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-orange-200 text-sm">Therapy-Focused • Institution Ready</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758612215020-842383aadb9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Online Learning"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/50 to-transparent" />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 flex items-center gap-3"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">200+ Certifications</div>
                  <div className="text-sm text-gray-600">Industry Recognized</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Learning options */}
      <section className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-4 gap-6">
        {[
          { title: "Courses", icon: BookOpen, count: "450+", desc: "On-demand with assessments" },
          { title: "Webinars", icon: Video, count: "120+", desc: "Live & recorded expert sessions" },
          { title: "Workshops", icon: ClipboardCheck, count: "80+", desc: "Hands-on, case-based" },
          { title: "Certifications", icon: Award, count: "200+", desc: "Industry recognized credentials" },
        ].map((item) => {
          const viewKey = item.title === "Webinars" ? "webinars" : item.title.toLowerCase().replace(" ", "-");
          const handleClick = () => {
            if (item.title === "Webinars") {
              router.push("/theralearn/webinars");
              return;
            }
            setLocalView(viewKey as typeof localView);
          };
          return (
          <button
            key={item.title}
            onClick={handleClick}
            className={cn(
              "group rounded-2xl border border-orange-100 bg-white/80 p-5 text-left shadow-sm hover:-translate-y-1 transition",
              localView.includes(item.title.toLowerCase().split(" ")[0]) && "border-orange-300 shadow-md"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                <item.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-orange-600">{item.count}</span>
            </div>
            <div className="font-bold text-lg text-gray-900 mb-1">{item.title}</div>
            <div className="text-sm text-gray-600">{item.desc}</div>
          </button>
          );
        })}
      </section>

      {/* Search */}
      <section className="bg-white shadow-lg -mt-8 relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h3 className="font-semibold mb-3 text-gray-700">Search Learning</h3>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search courses, webinars, workshops, certifications, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base border-2 border-orange-200 focus:border-orange-500"
              />
            </div>
            <Select value={selectedType} onValueChange={(v) => setSelectedType(v as (typeof types)[number])}>
              <SelectTrigger className="w-full lg:w-48 h-12 border-2 border-orange-200">
                <SelectValue placeholder="All Learning Formats" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={(v) => setSelectedLevel(v as (typeof levels)[number])}>
              <SelectTrigger className="w-full lg:w-40 h-12 border-2 border-orange-200">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="h-12 px-8 bg-orange-600 hover:bg-orange-700 text-white">Search</Button>
          </div>
        </div>
      </section>

      {/* Filters + courses */}
      <section
        id="browse-courses"
        className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-[280px_1fr] gap-8"
      >
        <aside className="space-y-4">
          <Card className="border-orange-100">
            <CardContent className="pt-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Levels</h4>
                <div className="space-y-2">
                  {levels.map((level) => (
                    <label key={level} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="level"
                        value={level}
                        checked={selectedLevel === level}
                        onChange={() => setSelectedLevel(level as (typeof levels)[number])}
                        className="accent-orange-600"
                      />
                      {level}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Learning Formats</h4>
                <div className="space-y-2">
                  {types.map((type) => (
                    <label key={type} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={selectedType === type}
                        onChange={() => setSelectedType(type as (typeof types)[number])}
                        className="accent-orange-600"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-gray-900">Categories</div>
                <div className="flex flex-wrap gap-2">
                  {courseCategories.map((cat) => (
                    <Badge key={cat} variant="outline" className="border-orange-200 text-orange-700">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-100 bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Expert-Led</div>
                  <div className="text-sm text-gray-600">Built by clinicians</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Certified</div>
                  <div className="text-sm text-gray-600">Industry recognized</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Flexible</div>
                  <div className="text-sm text-gray-600">Live & on-demand</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-6">
          <div className="flex items-centered justify-between flex-wrap gap-3">
            <div>
              <div className="text-sm text-gray-500">Featured Learning</div>
              <div className="text-xl font-bold text-gray-900">Courses, Webinars & Certifications</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setLocalView("my-learning")} className="gap-2">
                <Users className="w-4 h-4" /> My Learning
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView?.("instructor-register")}
                className="gap-2"
              >
                <GraduationCap className="w-4 h-4" /> Publish Program
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {coursesLoading ? (
              <Card className="border-orange-100">
                <CardContent className="p-6 text-sm text-gray-700">Loading programs…</CardContent>
              </Card>
            ) : filteredCourses.length === 0 ? (
              <Card className="border-orange-100">
                <CardContent className="p-6 text-sm text-gray-700">
                  No programs available yet. Check back soon.
                </CardContent>
              </Card>
            ) : (
              filteredCourses.map((course) => (
                <Card key={course.id} className="border-orange-100 hover:border-orange-200 shadow-sm group transition">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-orange-100 text-orange-700 border-none">{course.category}</Badge>
                      <span className="text-xs text-gray-500">{course.duration}</span>
                    </div>
                    <div className="font-bold text-lg text-gray-900 leading-tight line-clamp-2">{course.title}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={course.image} />
                        <AvatarFallback>{course.instructor[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-900">{course.instructor}</div>
                        <div className="text-xs text-gray-500">{course.instructorRole}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1 text-orange-700 font-semibold">
                        <Star className="w-4 h-4 fill-orange-500 text-orange-500" /> {course.rating}
                      </span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-700">{course.level}</span>
                        <span className="text-gray-500">{course.type}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-orange-50 text-orange-700 border border-orange-100"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      onClick={() => router.push(`/theralearn/enroll/${course.id}`)}
                    >
                      View details
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Program highlight */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-8">
          <Card className="border-orange-100 bg-white shadow-md">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-orange-100 text-orange-700 border-none">Flagship Program</Badge>
                <span className="text-sm text-gray-500">Cohort starts in 10 days</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">Neuro Rehab Specialist Program</div>
              <p className="text-gray-600 text-sm leading-relaxed">
                A 12-week intensive program combining live workshops, on-demand modules, assessments, and mentored capstone for neuro rehabilitation specialists.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-700">
                {[{ icon: Clock, label: "Duration", value: "12 Weeks" },
                { icon: Users, label: "Format", value: "Live + On-demand" },
                { icon: Award, label: "Certification", value: "Industry Recognized" }].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-orange-50">
                    <item.icon className="w-4 h-4 text-orange-600" />
                    <div>
                      <div className="text-xs text-gray-500">{item.label}</div>
                      <div className="font-semibold text-gray-900">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Avatar key={i} className="border-2 border-white shadow-sm h-9 w-9">
                      <AvatarImage src={`https://i.pravatar.cc/100?img=${10 + i}`} />
                      <AvatarFallback>PT</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="border-orange-200 text-orange-700">
                    View Curriculum
                  </Button>
                  <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setLocalView("course-detail")}>
                    Join Cohort
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm uppercase tracking-wide">Fast-track</div>
                  <div className="text-xl font-bold">Clinical Skill Sprints</div>
                </div>
              </div>
              <p className="text-orange-50 text-sm leading-relaxed">
                4-week intensive sprints with live labs, case-based learning, and weekly assessments for rapid upskilling.
              </p>
              <div className="space-y-2 text-sm text-orange-50">
                {["Live labs with experts", "Weekly assessments & feedback", "Capstone mini-projects", "Certification on completion"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="text-2xl font-bold">Next sprint: 5 days</div>
                  <div className="text-orange-100 text-sm">Limited seats</div>
                </div>
                <Button className="bg-white text-orange-600 hover:bg-orange-50" onClick={() => setLocalView("workshops")}>
                  View Sprints
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm text-gray-500">What learners say</div>
            <div className="text-2xl font-bold text-gray-900">Trusted by therapists and clinics</div>
          </div>
          <Button variant="outline" className="border-orange-200 text-orange-700" onClick={() => setCurrentView?.("reviews")}>
            View all
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((item) => (
            <Card key={item.name} className="border-orange-100">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={item.avatar} />
                    <AvatarFallback>{item.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-600">{item.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-orange-600 text-sm">
                  <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                  {item.rating}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{item.quote}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-orange-600 to-red-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-[1.3fr_0.7fr] gap-8 items-center">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
              <ShieldCheck className="w-4 h-4" /> Start learning today
            </div>
            <div className="text-3xl font-bold">Advance your therapy career with TheraLearn</div>
            <p className="text-orange-100">
              Join live cohorts, on-demand programs, and hands-on workshops. Earn credentials and stay ahead with
              industry-ready skills.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-white text-orange-600 hover:bg-orange-50" onClick={() => setLocalView("courses")}>
                Browse Learning
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => setCurrentView?.("instructor-register")}
              >
                Become an Instructor
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-orange-100">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Certified programs
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-4 h-4" /> Flexible learning
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="w-4 h-4" /> Community support
              </span>
            </div>
          </div>
          <Card className="bg-white text-gray-900 border-none shadow-xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Institutional Offering</div>
                  <div className="font-bold text-lg">TheraLearn for Clinics</div>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                Upskill therapy teams with curated programs, progress tracking, and certifications tailored for clinics and
                rehab centers.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[{ label: "Team programs", icon: Users },
                { label: "Analytics", icon: Laptop },
                { label: "Compliance ready", icon: ShieldCheck },
                { label: "Dedicated support", icon: Headphones }].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 text-gray-800">
                    <item.icon className="w-4 h-4 text-orange-600" />
                    {item.label}
                  </div>
                ))}
              </div>
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">Talk to us</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function CourseDetail({
  course,
  isEnrolled,
  onBack,
  onEnroll,
}: {
  course: Course;
  isEnrolled: boolean;
  onBack: () => void;
  onEnroll: () => void;
}) {
  return (
    <div className="bg-orange-50/40 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <button onClick={onBack} className="text-sm text-orange-700 font-semibold hover:underline">
          ← Back to learning
        </button>
        <Card className="border-orange-100">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Badge className="bg-orange-100 text-orange-700 border-none">{course.category}</Badge>
              <span className="text-sm text-gray-500">{course.duration}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 leading-tight">{course.title}</div>
            <p className="text-gray-700 text-sm leading-relaxed">{course.description}</p>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Avatar>
                <AvatarImage src={course.image} />
                <AvatarFallback>{course.instructor[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-gray-900">{course.instructor}</div>
                <div className="text-xs text-gray-500">{course.instructorRole}</div>
              </div>
              <div className="inline-flex items-center gap-1 text-orange-700 ml-auto">
                <Star className="w-4 h-4 fill-orange-500 text-orange-500" /> {course.rating} ({course.ratingCount})
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-sm text-gray-800">
              {[{ label: "Level", value: course.level }, { label: "Format", value: course.type }, { label: "Modules", value: `${course.modules}` }].map((item) => (
                <div key={item.label} className="p-3 rounded-lg bg-orange-50">
                  <div className="text-xs text-gray-500">{item.label}</div>
                  <div className="font-semibold">{item.value}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-900">Skills you will build</div>
              <div className="flex flex-wrap gap-2">
                {course.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-orange-50 text-orange-700 border border-orange-100">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="border-orange-200 text-orange-700">
                <ShieldCheck className="w-4 h-4 mr-1" /> Certification {course.certificate ? "included" : "optional"}
              </Badge>
              <Badge variant="outline" className="border-orange-200 text-orange-700">
                <Clock className="w-4 h-4 mr-1" /> {course.duration}
              </Badge>
              {course.liveSession && (
                <Badge variant="outline" className="border-orange-200 text-orange-700">
                  <Video className="w-4 h-4 mr-1" /> Live touchpoints
                </Badge>
              )}
            </div>
            <div className="flex gap-3">
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={onEnroll} disabled={isEnrolled}>
                {isEnrolled ? "Enrolled" : "Enroll now"}
              </Button>
              <Button variant="outline" onClick={onBack} className="border-orange-200 text-orange-700">
                Back to catalog
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MyLearningDashboard({
  enrolledCourses,
  onBack,
  onViewCourse,
}: {
  enrolledCourses: Course[];
  onBack: () => void;
  onViewCourse: (course: Course) => void;
}) {
  return (
    <div className="bg-orange-50/40 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <button onClick={onBack} className="text-sm text-orange-700 font-semibold hover:underline">
          ← Back to learning
        </button>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Your progress</div>
            <div className="text-2xl font-bold text-gray-900">My Learning</div>
          </div>
          <Badge className="bg-orange-100 text-orange-700 border-none">{enrolledCourses.length} enrolled</Badge>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {enrolledCourses.map((course) => (
            <Card key={course.id} className="border-orange-100">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900 leading-tight">{course.title}</div>
                  <Badge className="bg-orange-100 text-orange-700 border-none">{course.level}</Badge>
                </div>
                <div className="text-sm text-gray-600">{course.instructor}</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Progress</span>
                    <span>{course.progress ?? 0}%</span>
                  </div>
                  <Progress value={course.progress ?? 0} className="bg-orange-100" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => onViewCourse(course)}>
                    Continue
                  </Button>
                  <Button size="sm" variant="outline" className="border-orange-200 text-orange-700">
                    View modules
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function WebinarsView({
  webinars,
  registrations,
  loading,
  processingId,
  onView,
  onRegister,
  onBack,
}: {
  webinars: Webinar[];
  registrations: Record<string, WebinarRegistration>;
  loading: boolean;
  processingId?: string | null;
  onView: (id: string) => void;
  onRegister: (webinar: Webinar) => Promise<void>;
  onBack: () => void;
}) {
  return (
    <div className="bg-orange-50/40 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <button onClick={onBack} className="text-sm text-orange-700 font-semibold hover:underline">
          ← Back to learning
        </button>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Live learning</div>
            <div className="text-2xl font-bold text-gray-900">Upcoming Webinars & Workshops</div>
          </div>
          <Badge className="bg-orange-100 text-orange-700 border-none">{webinars.length}</Badge>
        </div>

        {loading ? (
          <div className="text-sm text-gray-600">Loading webinars…</div>
        ) : webinars.length === 0 ? (
          <Card className="border-orange-100">
            <CardContent className="p-6 text-sm text-gray-700">No upcoming webinars yet. Check back soon.</CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {webinars.map((webinar) => {
              const registration = registrations[webinar.id];
              const start = webinar.startTime ? new Date(webinar.startTime) : null;
              const startLabel = start && !Number.isNaN(start.getTime()) ? start.toLocaleString() : "";
              const amountLabel = webinar.isPaid ? `₹${(webinar.price ?? 0).toLocaleString("en-IN")}` : "Free";
              const isProcessing = processingId === webinar.id;
              return (
                <Card key={webinar.id} className="border-orange-100">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-orange-100 text-orange-700 border-none">{webinar.category || "Webinar"}</Badge>
                      {webinar.status && <span className="text-xs text-gray-500">{webinar.status}</span>}
                    </div>
                    <div className="text-lg font-bold text-gray-900 leading-tight">{webinar.title}</div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Video className="w-4 h-4 text-orange-600" />
                      <span>{startLabel}</span>
                      {webinar.durationMinutes ? <span>• {webinar.durationMinutes} mins</span> : null}
                    </div>
                    <div className="text-xs text-gray-600">Host: {webinar.hostName || "Instructor"}</div>
                    <div className="text-sm font-semibold text-orange-700">{amountLabel}</div>
                    {registration ? (
                      <div className="space-y-1 text-sm text-gray-700 bg-orange-50 border border-orange-100 rounded-lg p-3">
                        <div className="font-semibold text-orange-700">Registered</div>
                        {registration.meetingUrl && (
                          <a
                            href={registration.meetingUrl}
                            className="text-orange-700 underline font-semibold"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Join meeting
                          </a>
                        )}
                        {registration.joinCode && <div className="text-xs text-gray-600">Code: {registration.joinCode}</div>}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          className="border-orange-200 text-orange-700"
                          onClick={() => onView(webinar.id)}
                        >
                          View details
                        </Button>
                        <Button
                          className="bg-orange-600 hover:bg-orange-700"
                          onClick={() => onRegister(webinar)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? "Processing..." : webinar.isPaid ? `Pay ${amountLabel}` : "Register"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PlaceholderView({ title, onBack, children }: { title: string; onBack: () => void; children: ReactNode }) {
  return (
    <div className="bg-orange-50/40 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-4">
        <button onClick={onBack} className="text-sm text-orange-700 font-semibold hover:underline">
          ← Back to learning
        </button>
        <Card className="border-orange-100">
          <CardContent className="p-6 space-y-3">
            <div className="text-2xl font-bold text-gray-900">{title}</div>
            <p className="text-sm text-gray-700">{children}</p>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={onBack}>
              Browse courses
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
