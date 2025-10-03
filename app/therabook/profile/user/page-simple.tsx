'use client';

import React, { useState } from 'react';
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  User, 
  Star, 
  FileText, 
  Settings,
  Edit,
  Video,
  Phone,
  Building,
  CheckCircle,
  Award,
  TrendingUp,
  Heart,
  Shield,
  Bell,
  Globe,
  ChevronRight,
  Activity,
  Target,
  Zap,
  BookOpen,
  MessageCircle
} from "lucide-react";

const mockUserProfile = {
  name: "John Doe",
  email: "john.doe@email.com",
  image: "/api/placeholder/150/150",
  joinDate: "March 2023",
  membershipType: "Premium",
  stats: {
    totalSessions: 24,
    completedSessions: 22,
    cancelledSessions: 2,
    totalSpent: 2880,
    averageRating: 4.9,
    streak: 8,
    hoursCompleted: 44
  },
  upcomingSessions: [
    {
      id: 1,
      therapist: "Dr. Sarah Johnson",
      therapistImage: "/api/placeholder/50/50",
      date: "Today",
      time: "2:00 PM",
      type: "Video Call",
      duration: "50 min",
      status: "confirmed",
      specialty: "Anxiety & Depression"
    },
    {
      id: 2,
      therapist: "Dr. Michael Chen",
      therapistImage: "/api/placeholder/50/50",
      date: "Dec 22",
      time: "10:00 AM",
      type: "Audio Call",
      duration: "50 min",
      status: "confirmed",
      specialty: "Cognitive Behavioral Therapy"
    }
  ],
  pastSessions: [
    {
      id: 1,
      therapist: "Dr. Sarah Johnson",
      therapistImage: "/api/placeholder/50/50",
      date: "Dec 15, 2023",
      time: "2:00 PM",
      type: "Video Call",
      duration: "50 min",
      status: "completed",
      rating: 5,
      notes: "Excellent progress on anxiety management techniques. Implemented new breathing exercises and mindfulness practices.",
      tags: ["Anxiety", "Mindfulness", "Breathing"]
    },
    {
      id: 2,
      therapist: "Dr. Sarah Johnson",
      therapistImage: "/api/placeholder/50/50",
      date: "Dec 8, 2023",
      time: "2:00 PM",
      type: "Video Call",
      duration: "50 min",
      status: "completed",
      rating: 5,
      notes: "Focused on CBT strategies and cognitive restructuring. Homework assigned for thought pattern tracking.",
      tags: ["CBT", "Thought Patterns", "Homework"]
    },
    {
      id: 3,
      therapist: "Dr. Emily Rodriguez",
      therapistImage: "/api/placeholder/50/50",
      date: "Nov 30, 2023",
      time: "3:00 PM",
      type: "In-Person",
      duration: "50 min",
      status: "completed",
      rating: 4,
      notes: "Initial consultation and comprehensive assessment. Established therapy goals and treatment plan.",
      tags: ["Assessment", "Goal Setting", "Treatment Plan"]
    }
  ],
  preferences: {
    sessionType: "Video Call",
    timeZone: "EST",
    reminderTime: "24 hours",
    language: "English"
  },
  achievements: [
    { name: "Early Bird", description: "Completed 5 morning sessions", icon: "🌅" },
    { name: "Consistency Champion", description: "8-week streak", icon: "🔥" },
    { name: "Progress Pioneer", description: "Completed 20+ sessions", icon: "⭐" }
  ]
};

const getSessionIcon = (type: string) => {
  switch (type) {
    case "Video Call": return Video;
    case "Audio Call": return Phone;
    case "In-Person": return Building;
    default: return Video;
  }
};


const StatCard = ({ title, value, icon: Icon, trend}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
  color?: string;
}) => (
  <div className={`bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
    <div className="flex items-center justify-between mb-3">
      <div className={`p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <div className="flex items-center text-blue-600 text-sm font-medium">
          <TrendingUp className="w-4 h-4 mr-1" />
          +{trend}%
        </div>
      )}
    </div>
    <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-sm text-gray-600 font-medium">{title}</div>
  </div>
);

const AchievementBadge = ({ achievement }: { achievement: { name: string; description: string; icon: string } }) => (
  <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 shadow-sm border border-blue-200 hover:shadow-md transition-all duration-300">
    <div className="text-2xl mb-2">{achievement.icon}</div>
    <h4 className="font-semibold text-gray-900 mb-1">{achievement.name}</h4>
    <p className="text-xs text-gray-600">{achievement.description}</p>
  </div>
);

// Crown component for premium badge
const Crown = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 6L13.13 8.5L16 7.5L15 10.5L18 12L15 13.5L16 16.5L13.13 15.5L12 18L10.87 15.5L8 16.5L9 13.5L6 12L9 10.5L8 7.5L10.87 8.5L12 6Z"/>
  </svg>
);

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState("overview");

  const userProfile = mockUserProfile;

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "sessions", label: "Sessions", icon: Calendar },
    { id: "history", label: "History", icon: FileText },
    { id: "preferences", label: "Settings", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/30 to-blue-300/30 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-100/30 to-blue-200/30 blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Profile Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl mb-8 overflow-hidden shadow-2xl border border-white/50">
          {/* Dynamic Gradient Background */}
          <div className="h-56 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
            </div>
            
            {/* Floating Action Buttons */}
            <div className="absolute top-6 right-6 flex gap-3">
              <button className="group bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105">
                <Edit className="w-4 h-4 mr-2 inline group-hover:rotate-12 transition-transform" />
                Edit Profile
              </button>
              <button className="group bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105">
                <Settings className="w-4 h-4 mr-2 inline group-hover:rotate-90 transition-transform" />
                Settings
              </button>
            </div>
          </div>
          
          <div className="relative -mt-20 px-8 pb-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Enhanced Profile Avatar */}
              <div className="relative">
                <div className="w-36 h-36 rounded-3xl bg-gradient-to-br from-white to-gray-100 p-2 shadow-2xl">
                  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
                    {userProfile.image ? (
                      <img src={userProfile.image} alt={userProfile.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      userProfile.name.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                {/* Status Indicator */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 border-4 border-white rounded-full shadow-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
                {/* Premium Badge */}
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  <Award className="w-3 h-3 inline mr-1" />
                  Premium
                </div>
              </div>
              
              <div className="flex-1 pt-4">
                {/* Enhanced User Info */}
                <div className="mb-8">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                    {userProfile.name}
                  </h1>
                  <p className="text-gray-600 mb-4 text-lg">{userProfile.email}</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full font-medium shadow-lg">
                      <Crown className="w-4 h-4 inline mr-2" />
                      {userProfile.membershipType} Member
                    </div>
                    <div className="flex items-center text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Member since {userProfile.joinDate}
                    </div>
                    <div className="flex items-center text-blue-600 bg-blue-100 px-4 py-2 rounded-full">
                      <Zap className="w-4 h-4 mr-2" />
                      {userProfile.stats.streak} week streak
                    </div>
                  </div>
                </div>

                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard 
                    title="Total Sessions" 
                    value={userProfile.stats.totalSessions} 
                    icon={BookOpen}
                    trend={15}
                    color="blue"
                  />
                  <StatCard 
                    title="Completed" 
                    value={userProfile.stats.completedSessions} 
                    icon={CheckCircle}
                    trend={8}
                    color="blue"
                  />
                  <StatCard 
                    title="Investment" 
                    value={`$${userProfile.stats.totalSpent}`} 
                    icon={TrendingUp}
                    color="blue"
                  />
                  <StatCard 
                    title="Rating" 
                    value={userProfile.stats.averageRating} 
                    icon={Star}
                    color="blue"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 mb-8 shadow-lg border border-white/50">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upcoming Sessions - Enhanced */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Calendar className="w-6 h-6 mr-3" />
                    Upcoming Sessions
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {userProfile.upcomingSessions.map((session, index) => {
                    const SessionIcon = getSessionIcon(session.type);
                    return (
                      <div key={session.id} className={`group bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${index === 0 ? 'ring-2 ring-blue-200' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                              {session.therapistImage ? (
                                <img src={session.therapistImage} alt={session.therapist} className="w-full h-full object-cover" />
                              ) : (
                                'T'
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 w-5 h-5 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900 mb-1">{session.therapist}</h4>
                            <p className="text-blue-600 font-medium mb-2">{session.specialty}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {session.date} at {session.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <SessionIcon className="w-4 h-4" />
                                {session.type}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {index === 0 && (
                              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse">
                                Starting Soon
                              </div>
                            )}
                            <Link href={`/therabook/therapists/1/book/session`}>
                              <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105">
                                Join Session
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <Link href="/therabook/therapists">
                    <button className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-50 hover:to-blue-100 border-2 border-dashed border-gray-300 hover:border-blue-300 rounded-2xl p-6 text-gray-600 hover:text-blue-600 font-medium transition-all duration-300 group">
                      <Calendar className="w-6 h-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      Book New Session
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Achievements */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Award className="w-6 h-6 mr-3" />
                    Achievements
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {userProfile.achievements.map((achievement, index) => (
                    <AchievementBadge key={index} achievement={achievement} />
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Zap className="w-6 h-6 mr-3" />
                    Quick Actions
                  </h3>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    { label: "Message Therapist", icon: MessageCircle, color: "blue" },
                    { label: "View Progress", icon: TrendingUp, color: "blue" },
                    { label: "Update Goals", icon: Target, color: "blue" },
                    { label: "Emergency Support", icon: Heart, color: "blue" }
                  ].map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button key={index} className={`w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 text-blue-700 font-medium transition-all duration-300 hover:scale-105 group`}>
                        <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        {action.label}
                        <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <h3 className="text-2xl font-bold text-white">Current Sessions</h3>
              <p className="text-blue-100 mt-2">Manage your active therapy sessions</p>
            </div>
            <div className="p-8">
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-blue-400 mb-4" />
                <h4 className="text-xl font-semibold text-gray-600 mb-2">Enhanced Session Management</h4>
                <p className="text-gray-500">Advanced session management features are being developed.</p>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <FileText className="w-6 h-6 mr-3" />
                Session History
              </h3>
              <p className="text-blue-100 mt-2">Your therapy journey and progress notes</p>
            </div>
            <div className="p-8 space-y-6">
              {userProfile.pastSessions.map((session) => {
                const SessionIcon = getSessionIcon(session.type);
                return (
                  <div key={session.id} className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl overflow-hidden flex-shrink-0">
                        {session.therapistImage ? (
                          <img src={session.therapistImage} alt={session.therapist} className="w-full h-full object-cover" />
                        ) : (
                          'T'
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-xl text-gray-900">{session.therapist}</h4>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                              Completed
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {session.date}
                          </div>
                          <div className="flex items-center gap-2">
                            <SessionIcon className="w-4 h-4" />
                            {session.type}
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < session.rating ? 'text-blue-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                            <span className="ml-2 font-medium">{session.rating}/5</span>
                          </div>
                        </div>
                        {session.tags && (
                          <div className="flex gap-2 mb-4">
                            {session.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
                          <p className="text-gray-700 leading-relaxed">{session.notes}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <Settings className="w-6 h-6 mr-3" />
                Account Preferences
              </h3>
              <p className="text-blue-100 mt-2">Customize your therapy experience</p>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg border border-blue-100">
                  <h4 className="font-bold text-xl mb-6 text-gray-900 flex items-center">
                    <User className="w-6 h-6 mr-3 text-blue-600" />
                    Session Preferences
                  </h4>
                  <div className="space-y-4">
                    {[
                      { label: "Session Type", value: userProfile.preferences.sessionType, icon: Video },
                      { label: "Time Zone", value: userProfile.preferences.timeZone, icon: Globe },
                      { label: "Reminders", value: userProfile.preferences.reminderTime, icon: Bell },
                      { label: "Language", value: userProfile.preferences.language, icon: MessageCircle }
                    ].map((pref, index) => {
                      const Icon = pref.icon;
                      return (
                        <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-blue-600" />
                            <span className="text-gray-700 font-medium">{pref.label}:</span>
                          </div>
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{pref.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg border border-blue-100">
                  <h4 className="font-bold text-xl mb-6 text-gray-900 flex items-center">
                    <Shield className="w-6 h-6 mr-3 text-blue-600" />
                    Privacy & Security
                  </h4>
                  <div className="space-y-4">
                    {[
                      { label: "Email Notifications", enabled: true },
                      { label: "SMS Reminders", enabled: true },
                      { label: "Session Recording", enabled: false },
                      { label: "Data Sharing", enabled: false }
                    ].map((setting, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 transition-colors">
                        <span className="text-gray-700 font-medium">{setting.label}</span>
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          setting.enabled ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-300'
                        }`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            setting.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-white rounded-2xl p-6 border border-blue-200">
                <div className="flex gap-4 flex-wrap">
                  <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg">
                    <Settings className="w-5 h-5 mr-2 inline" />
                    Update Preferences
                  </button>
                  <button className="bg-white border-2 border-gray-300 hover:border-blue-300 text-gray-700 hover:text-blue-600 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105">
                    Reset to Default
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
