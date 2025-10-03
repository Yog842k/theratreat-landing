"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Video, Users, Shield } from "lucide-react";

interface JoinSessionFormProps {
  onJoin: (name: string, role: "therapist" | "patient", sessionId?: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function JoinSessionForm({ onJoin, isLoading = false, error }: JoinSessionFormProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"therapist" | "patient">("patient");
  const [sessionId, setSessionId] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!name.trim()) {
      errors.name = "Name is required";
    } else if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long";
    }

    if (!sessionId.trim()) {
      errors.sessionId = "Session ID is required";
    } else if (sessionId.trim().length < 3) {
      errors.sessionId = "Session ID must be at least 3 characters long";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onJoin(name.trim(), role, sessionId.trim());
  };

  const handleInputChange = (field: string, value: string) => {
    // Clear specific field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    if (field === 'name') setName(value);
    if (field === 'sessionId') setSessionId(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Join Therapy Session
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your details to join the secure video call
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Your Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`transition-colors ${
                  formErrors.name ? "border-red-500 focus:border-red-500" : ""
                }`}
                disabled={isLoading}
              />
              {formErrors.name && (
                <p className="text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            {/* Session ID Input */}
            <div className="space-y-2">
              <Label htmlFor="sessionId" className="text-sm font-medium text-gray-700">
                Session ID
              </Label>
              <Input
                id="sessionId"
                type="text"
                placeholder="Enter session ID or room code"
                value={sessionId}
                onChange={(e) => handleInputChange('sessionId', e.target.value)}
                className={`transition-colors ${
                  formErrors.sessionId ? "border-red-500 focus:border-red-500" : ""
                }`}
                disabled={isLoading}
              />
              {formErrors.sessionId && (
                <p className="text-sm text-red-600">{formErrors.sessionId}</p>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                Join as
              </Label>
              <Select 
                value={role} 
                onValueChange={(value: "therapist" | "patient") => setRole(value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span>Patient</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="therapist">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span>Therapist</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role Description */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                {role === "therapist" ? (
                  <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                ) : (
                  <Users className="w-5 h-5 text-green-500 mt-0.5" />
                )}
                <div>
                  <h4 className="font-medium text-gray-900">
                    {role === "therapist" ? "Therapist" : "Patient"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {role === "therapist" 
                      ? "You will have host privileges and can control the session settings."
                      : "You will join as a participant in the therapy session."
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Joining Session...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  <span>Join Session</span>
                </div>
              )}
            </Button>

            {/* Security Notice */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                🔒 This is a secure, encrypted therapy session
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
