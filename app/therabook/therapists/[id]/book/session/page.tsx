'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Video, Shield, Clock, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { HMSRoomProvider } from "@100mslive/react-sdk";
import { VideoRoomContent, VideoRoomJoinWrapper } from "@/components/video-call/TherapyVideoRoom";
import { useAuth } from "@/components/auth/NewAuthContext";

export default function SessionPage() {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState<{ token: string; roomId: string; role: string } | null>(null);
  const [error, setError] = useState("");
  const [bookingData, setBookingData] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [hasSeenInstructions, setHasSeenInstructions] = useState(false);
  const routeParams = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const id = Array.isArray(routeParams?.id) ? (routeParams?.id?.[0] as string) : ((routeParams?.id as string) || "");

  const bookingId = searchParams?.get('bookingId');
  const roomId = searchParams?.get('roomId');

  // Don't auto-join - wait for user to click button

  // Fetch booking data
  useEffect(() => {
    if (bookingId && token && !authLoading) {
      fetchBookingData();
    }
  }, [bookingId, token, authLoading]);

  const fetchBookingData = async () => {
    try {
      const headers: HeadersInit = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const response = await fetch(`/api/bookings/${bookingId}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setBookingData(data.booking || data.data?.booking || data);
      }
    } catch (err) {
      console.error('Failed to fetch booking:', err);
    }
  };

  const handleJoinSession = async () => {
    if (!token || !user) {
      setError('You must be logged in to join a session. Please log in and try again.');
      toast.error("Authentication required", { description: "Please log in to join the session" });
      return;
    }

    setLoading(true);
    setError("");

    try {
      let finalRoomId = roomId;
      
      // Step 1: Get roomId from booking if not provided
      if (bookingId && !finalRoomId) {
        const headers: HeadersInit = { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
        
        const bookingResponse = await fetch(`/api/bookings/${bookingId}`, { headers });
        if (bookingResponse.ok) {
          const bookingData = await bookingResponse.json();
          const booking = bookingData.booking || bookingData.data?.booking || bookingData;
          finalRoomId = booking.callRoomId || booking.roomId;
        } else {
          const errorData = await bookingResponse.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.message || 'Failed to fetch booking');
        }
      }

      // Step 2: Create room if it doesn't exist
      if (!finalRoomId && bookingId) {
        
        const roomResponse = await fetch('/api/100ms-room/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `therabook-${bookingId}-${Date.now()}`,
            description: `Therapy session for booking ${bookingId}`,
            template_id: process.env.NEXT_PUBLIC_HMS_TEMPLATE_ID,
            region: 'auto'
          }),
        });

        const roomData = await roomResponse.json();
        
        if (roomData.success && roomData.room && roomData.room.id) {
          finalRoomId = roomData.room.id;
          
          // Update booking with roomId
          if (bookingId) {
            try {
              await fetch(`/api/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ callRoomId: finalRoomId })
              });
            } catch (e) {
              console.warn('[Session] Could not update booking with roomId:', e);
            }
          }
        } else {
          throw new Error(roomData.error || roomData.message || 'Failed to create room');
        }
      }

      if (!finalRoomId) {
        throw new Error('No room ID available. Please ensure the booking has a video room.');
      }

      // Step 3: Check if user has already joined this session
      if (bookingId && token) {
        const checkJoinResponse = await fetch(`/api/bookings/${bookingId}/check-join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId: user._id })
        });

        if (checkJoinResponse.ok) {
          const checkData = await checkJoinResponse.json();
          if (checkData.alreadyJoined) {
            throw new Error('You have already joined this session. Please refresh the page if you need to rejoin.');
          }
        }
      }

      // Step 4: Generate token
      const userRole = user.userType === 'therapist' ? 'host' : 'guest';
      const userName = user.name || 'user';
      const userId = `${userName.replace(/\s+/g, '_')}_${Date.now()}`;

      
      const tokenResponse = await fetch('/api/100ms-room/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          role: userRole,
          room_id: finalRoomId,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.success && tokenData.token) {
        
        // Mark user as joined in booking
        if (bookingId && token) {
          try {
            await fetch(`/api/bookings/${bookingId}/mark-joined`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ userId: user._id })
            });
          } catch (e) {
            console.warn('[Session] Could not mark user as joined:', e);
          }
        }
        
        setTokenData({
          token: tokenData.token,
          roomId: tokenData.room_id || finalRoomId,
          role: tokenData.role || userRole,
        });
        setSessionStarted(true);
      } else {
        throw new Error(tokenData.error || tokenData.message || 'Failed to generate token');
      }
    } catch (err: any) {
      console.error('Join session error:', err);
      const errorMsg = err.message || 'Failed to join session';
      setError(errorMsg);
      toast.error("Failed to join session", { description: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    // Mark booking as completed if session was active
    if (bookingId && token) {
      try {
        await fetch(`/api/bookings/${bookingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            status: 'completed'
          })
        });
      } catch (e) {
        console.warn('Failed to update booking status:', e);
      }
    }
    
    setSessionStarted(false);
    setTokenData(null);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Redirect based on user role
    if (user?.userType === 'therapist') {
      router.push(`/therabook/dashboard/therapist`);
    } else {
      router.push(`/therabook/therapists/${id}/book/session/feedback?bookingId=${bookingId}`);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated && !authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <CardTitle className="text-2xl">Authentication Required</CardTitle>
            <CardDescription>Please log in to join your session</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
              className="w-full"
              size="lg"
            >
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle redirect to feedback when therapist ends session
  const handleSessionEnded = () => {
    if (user?.userType !== 'therapist' && bookingId) {
      // Patient: redirect to feedback page
      router.push(`/therabook/therapists/${id}/book/session/feedback?bookingId=${bookingId}`);
    }
  };

  // Session started - show video room
  if (sessionStarted && tokenData) {
    return (
      <HMSRoomProvider>
        <VideoRoomJoinWrapper
          key={`wrapper-${sessionStarted}`}
          token={tokenData.token}
          userName={tokenData.role === 'host' ? 'Therapist' : 'Patient'}
          onJoinComplete={() => {}}
          onLeave={handleLeave}
        />
        <VideoRoomContent 
          onLeave={handleLeave} 
          therapistName={tokenData.role === 'host' ? 'Therapist' : 'Patient'}
          userRole={tokenData.role}
          bookingId={bookingId || undefined}
          therapistId={id}
          onSessionEnded={handleSessionEnded}
        />
        <Toaster />
      </HMSRoomProvider>
    );
  }

  // Instructions Modal - render on top of everything
  const renderInstructionsModal = () => (
    <Dialog open={showInstructions && !hasSeenInstructions} onOpenChange={(open) => {
      if (!open) {
        setShowInstructions(false);
        // Auto-join when modal is closed
        if (!hasSeenInstructions) {
          handleJoinSession();
        }
      }
    }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Video className="w-6 h-6 text-blue-600" />
              Pre-Session Instructions
            </DialogTitle>
            <DialogDescription className="text-base">
              Please review these important details before joining your session
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Session Info - Show different info for therapist vs patient */}
            {bookingData && (
              <Card className="border-2 border-blue-100">
            <CardHeader>
                  <CardTitle className="text-lg">
                    {user?.userType === 'therapist' ? 'Patient Details' : 'Session Details'}
                  </CardTitle>
            </CardHeader>
                <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                      {user?.userType === 'therapist' ? (
                        <>
                          <AvatarImage src={bookingData.user?.image} />
                          <AvatarFallback>
                            {bookingData.user?.name?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src={bookingData.therapist?.image} />
                          <AvatarFallback>
                            {bookingData.therapist?.name?.charAt(0) || 'T'}
                          </AvatarFallback>
                        </>
                      )}
                </Avatar>
                <div>
                      {user?.userType === 'therapist' ? (
                        <>
                          <h3 className="font-semibold text-lg">
                            {bookingData.user?.name || 'Patient'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {bookingData.user?.email || 'No email provided'}
                          </p>
                          {bookingData.user?.phone && (
                            <p className="text-sm text-gray-600">
                              Phone: {bookingData.user.phone}
                            </p>
                          )}
                          {bookingData.notes && (() => {
                            try {
                              const notesData = JSON.parse(bookingData.notes);
                              return (
                                <div className="mt-2 space-y-1">
                                  {notesData.age && (
                                    <p className="text-xs text-gray-500">Age: {notesData.age}</p>
                                  )}
                                  {notesData.concerns && (
                                    <p className="text-xs text-gray-500">Concerns: {notesData.concerns}</p>
                                  )}
                                  {notesData.language && (
                                    <p className="text-xs text-gray-500">Language: {notesData.language}</p>
                                  )}
                                </div>
                              );
                            } catch {
                              return bookingData.notes ? (
                                <p className="text-xs text-gray-500 mt-2">Notes: {bookingData.notes}</p>
                              ) : null;
                            }
                          })()}
                        </>
                      ) : (
                        <>
                          <h3 className="font-semibold text-lg">
                            {bookingData.therapist?.name || 'Therapist'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {bookingData.therapist?.title || 'Licensed Professional'}
                          </p>
                        </>
                      )}
                      <div className="flex gap-2 mt-2">
                        {bookingData.appointmentDate && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(bookingData.appointmentDate).toLocaleDateString()}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {bookingData.duration || 50} minutes
                        </Badge>
                      </div>
                </div>
              </div>
                </CardContent>
              </Card>
            )}

            {/* Checklist */}
            <Card className="border-2 border-purple-100">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  Pre-Session Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Find a quiet, private space</p>
                      <p className="text-sm text-gray-600">Ensure you won't be interrupted during the session</p>
                </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Check your internet connection</p>
                      <p className="text-sm text-gray-600">A stable connection ensures the best experience</p>
                </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Test your camera and microphone</p>
                      <p className="text-sm text-gray-600">You'll be prompted to allow access when joining</p>
                </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Have your notes ready</p>
                      <p className="text-sm text-gray-600">Prepare any questions or topics you want to discuss</p>
              </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Secure & Private</h3>
                    <p className="text-sm text-blue-800">
                      Your session is encrypted and completely private. We never record sessions without explicit consent. 
                      All communications are HIPAA-compliant and secure.
                    </p>
                  </div>
              </div>
            </CardContent>
          </Card>
        </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowInstructions(false);
                router.push('/therabook');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowInstructions(false);
                handleJoinSession();
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              <Video className="w-5 h-5 mr-2" />
              Join Session Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );

  // Pre-join screen
  return (
    <>
      {renderInstructionsModal()}
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
            <Video className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Join Your Session</h1>
          <p className="text-lg text-gray-600">Your therapy session is ready to begin</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Session Info Card */}
          <Card className="border-2 border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Session Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bookingData ? (
                <>
        <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      {user?.userType === 'therapist' ? (
                        <>
                          <AvatarImage src={bookingData.user?.image} />
                          <AvatarFallback>
                            {bookingData.user?.name?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src={bookingData.therapist?.image} />
                          <AvatarFallback>
                            {bookingData.therapist?.name?.charAt(0) || 'T'}
                          </AvatarFallback>
                        </>
                      )}
          </Avatar>
          <div>
                      {user?.userType === 'therapist' ? (
                        <>
                          <h3 className="font-semibold text-lg">
                            {bookingData.user?.name || 'Patient'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {bookingData.user?.email || 'No email provided'}
                          </p>
                          {bookingData.user?.phone && (
                            <p className="text-sm text-gray-600">
                              Phone: {bookingData.user.phone}
                            </p>
                          )}
                          {bookingData.notes && (() => {
                            try {
                              const notesData = JSON.parse(bookingData.notes);
                              return (
                                <div className="mt-2 space-y-1">
                                  {notesData.age && (
                                    <p className="text-xs text-gray-500">Age: {notesData.age}</p>
                                  )}
                                  {notesData.concerns && (
                                    <p className="text-xs text-gray-500">Concerns: {notesData.concerns}</p>
                                  )}
                                  {notesData.language && (
                                    <p className="text-xs text-gray-500">Language: {notesData.language}</p>
                                  )}
                                </div>
                              );
                            } catch {
                              return bookingData.notes ? (
                                <p className="text-xs text-gray-500 mt-2">Notes: {bookingData.notes}</p>
                              ) : null;
                            }
                          })()}
                        </>
                      ) : (
                        <>
                          <h3 className="font-semibold text-lg">
                            {bookingData.therapist?.name || 'Therapist'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {bookingData.therapist?.title || 'Licensed Professional'}
                          </p>
                        </>
                      )}
          </div>
        </div>
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {bookingData.appointmentDate ? new Date(bookingData.appointmentDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{bookingData.duration || 50} minutes</span>
          </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <Badge variant="outline" className="capitalize">
                        {bookingData.sessionType || 'video'}
          </Badge>
        </div>
      </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Loading session details...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pre-Join Checklist */}
          <Card className="border-2 border-purple-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                Pre-Session Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Find a quiet, private space</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Ensure good internet connection</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Test your camera and microphone</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Have any notes or questions ready</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Secure & Private</h3>
                <p className="text-sm text-blue-800">
                  Your session is encrypted and completely private. We never record sessions without explicit consent.
                </p>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                  <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
            </CardContent>
          </Card>
        )}

        {/* Join Button */}
        <div className="text-center">
          <Button
            onClick={handleJoinSession}
            size="lg"
            className="px-12 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
            disabled={loading || !token}
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Joining Session...
              </>
            ) : (
              <>
                <Video className="w-6 h-6 mr-3" />
                Join Session Now
              </>
            )}
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            By joining, you agree to our terms of service and privacy policy
        </p>
        </div>
      </div>
      <Toaster />
    </div>
    </>
  );
}
