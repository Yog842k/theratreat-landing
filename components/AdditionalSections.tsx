import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, User, BookOpen, TrendingUp, Mail } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Managing Anxiety in the Digital Age: Practical Strategies",
    excerpt: "Learn evidence-based techniques for managing anxiety in our increasingly connected world.",
    author: "Dr. Sarah Johnson",
    date: "Jan 15, 2025",
    readTime: "8 min read",
    category: "Health Updates",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop"
  },
  {
    id: "2", 
    title: "Case Study: Recovery from Sports Injury Through Physical Therapy",
    excerpt: "A detailed look at how structured physical therapy helped an athlete return to peak performance.",
    author: "Michael Chen, PT",
    date: "Jan 12, 2025",
    readTime: "12 min read",
    category: "Case Studies",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop"
  },
  {
    id: "3",
    title: "Podcast: The Future of Mental Health Technology",
    excerpt: "Join our conversation about how technology is transforming mental health care delivery.",
    author: "TheaPheap Team",
    date: "Jan 10, 2025", 
    readTime: "45 min listen",
    category: "Podcast Episodes",
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=200&fit=crop"
  },
  {
    id: "4",
    title: "5 Therapy Tips for Better Communication in Relationships",
    excerpt: "Expert advice on improving communication patterns for healthier relationships.",
    author: "Dr. Emily Rodriguez",
    date: "Jan 8, 2025",
    readTime: "6 min read", 
    category: "Therapy Tips",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=200&fit=crop"
  }
];

const categories = ["All", "Health Updates", "Case Studies", "Podcast Episodes", "Therapy Tips"];

export function AdditionalSections() {
  return (
    <div className="w-full space-y-16">
      {/* TheaBlogs Section */}
      <section className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold text-primary">TheaBlogs</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay informed with the latest insights, case studies, and expert advice 
            from our healthcare professionals.
          </p>
        </div>

        {/* Blog Categories */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              size="sm"
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Blog Post */}
        <Card className="mb-8 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <div 
                className="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center text-gray-500 rounded"
              >
                Blog Image
              </div>
            </div>
            <div className="md:w-1/2 p-8">
              <Badge variant="secondary" className="mb-4">
                {blogPosts[0].category}
              </Badge>
              <h3 className="text-2xl font-bold mb-4">{blogPosts[0].title}</h3>
              <p className="text-muted-foreground mb-6">{blogPosts[0].excerpt}</p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{blogPosts[0].author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{blogPosts[0].date}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{blogPosts[0].readTime}</span>
                </div>
              </div>
              <Button>Read More</Button>
            </div>
          </div>
        </Card>

        {/* Blog Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.slice(1).map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all">
              <div className="relative">
                <div 
                  className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 rounded"
                >
                  Blog Image
                </div>
                <Badge className="absolute top-3 left-3 bg-white/90 text-foreground">
                  {post.category}
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{post.author}</span>
                  <span>{post.readTime}</span>
                </div>
                <Button variant="ghost" className="w-full mt-4">
                  {post.category === "Podcast Episodes" ? "Listen Now" : "Read More"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Articles
          </Button>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold">Join Our Newsletter</h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Get weekly insights, therapy tips, and updates from leading healthcare professionals 
              delivered straight to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email address"
                className="bg-white/10 border-white/30 text-white placeholder:text-white/70 flex-1"
              />
              <Button variant="secondary" className="bg-white text-blue-600 hover:bg-white/90">
                Subscribe
              </Button>
            </div>
            <p className="text-sm text-blue-200">
              Join 10,000+ healthcare professionals already subscribed
            </p>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-primary">Patient Success Stories</h2>
          <p className="text-lg text-muted-foreground">
            Real stories from patients who found healing through our platform
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Sarah M.",
              condition: "Anxiety & Depression",
              quote: "The therapist I found through TheaPheap changed my life. I finally feel like myself again.",
              improvement: "90% improvement in anxiety levels"
            },
            {
              name: "James T.",
              condition: "Back Pain Recovery",
              quote: "After months of pain, the physical therapy program got me back to playing with my kids.",
              improvement: "Complete recovery in 3 months"
            },
            {
              name: "Maria L.",
              condition: "Sleep Disorders",
              quote: "I never thought I'd sleep well again. The sleep therapy program worked wonders.",
              improvement: "8 hours of quality sleep nightly"
            }
          ].map((story, index) => (
            <Card key={index} className="p-6">
              <CardContent className="space-y-4 p-0">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                  ))}
                </div>
                <blockquote className="text-lg italic">&ldquo;{story.quote}&rdquo;</blockquote>
                <div className="space-y-2">
                  <p className="font-semibold">{story.name}</p>
                  <Badge variant="outline">{story.condition}</Badge>
                  <p className="text-sm text-green-600 font-medium">{story.improvement}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-blue-50">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Our Impact in Numbers</h2>
            <p className="text-lg text-muted-foreground">
              Trusted by thousands of patients and providers nationwide
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4 text-center">
            {[
              { number: "50,000+", label: "Patients Served", icon: <User className="w-8 h-8 text-blue-600" /> },
              { number: "2,500+", label: "Licensed Providers", icon: <User className="w-8 h-8 text-blue-600" /> },
              { number: "95%", label: "Patient Satisfaction", icon: <TrendingUp className="w-8 h-8 text-blue-600" /> },
              { number: "50", label: "States Covered", icon: <BookOpen className="w-8 h-8 text-blue-600" /> }
            ].map((stat, index) => (
              <div key={index} className="space-y-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto">
                  {stat.icon}
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
