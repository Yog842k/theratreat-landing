"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/components/auth/NewAuthContext";
import { useRouter } from "next/navigation";

export default function DebugPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { login, user, token, isAuthenticated } = useAuth();
  const router = useRouter();

  const [loginData, setLoginData] = useState({
    email: "test@theratreat.com",
    password: "Test123!"
  });

  const createTestUser = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const userData = {
        name: "Test User",
        email: "test@theratreat.com",
        password: "Test123!"
      };

      const response = await fetch('/api/debug/create-test-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage("Test user created successfully! Email: test@theratreat.com, Password: Test123!");
      } else {
        setError(data.message || "Failed to create test user");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create test user");
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        login(data.token, data.user);
        setMessage("Logged in successfully!");
        setTimeout(() => {
          router.push('/therabook/profile/user');
        }, 1000);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    try {
      setError("");
      setMessage("");

      const response = await fetch('/api/debug/auth', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setMessage(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setError(err.message || "Auth test failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Debug Profile Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auth Status */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Current Auth Status:</h3>
              <div className="text-sm space-y-1">
                <div>Authenticated: {isAuthenticated ? "Yes" : "No"}</div>
                <div>Token: {token ? "Present" : "Missing"}</div>
                <div>User: {user?.name || "None"}</div>
                <div>Email: {user?.email || "None"}</div>
              </div>
            </div>

            {/* Create Test User */}
            <div className="space-y-4">
              <h3 className="font-semibold">Step 1: Create Test User</h3>
              <Button 
                onClick={createTestUser} 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Creating..." : "Create Test User"}
              </Button>
            </div>

            {/* Login */}
            <div className="space-y-4">
              <h3 className="font-semibold">Step 2: Login</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input 
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({...prev, email: e.target.value}))}
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input 
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({...prev, password: e.target.value}))}
                  />
                </div>
              </div>
              <Button 
                onClick={testLogin} 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>

            {/* Test Auth */}
            <div className="space-y-4">
              <h3 className="font-semibold">Step 3: Test Authentication</h3>
              <Button 
                onClick={testAuth} 
                disabled={!token}
                variant="outline"
                className="w-full"
              >
                Test Auth API
              </Button>
            </div>

            {/* Go to Profile */}
            <div className="space-y-4">
              <h3 className="font-semibold">Step 4: View Profile</h3>
              <Button 
                onClick={() => router.push('/therabook/profile/user')} 
                disabled={!isAuthenticated}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Go to Profile Page
              </Button>
            </div>

            {/* Bank Verification Test */}
            <div className="space-y-4">
              <h3 className="font-semibold">Extra: Bank Verification Test</h3>
              <div className="text-sm text-slate-600">Open a test utility to verify bank account + IFSC via IDfy.</div>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => router.push('/debug/bank-verification')} 
                  variant="outline"
                >
                  Open Bank Verification
                </Button>
                <Button 
                  onClick={() => router.push('/debug/idfy')} 
                  variant="outline"
                >
                  Open PAN/Aadhaar Test
                </Button>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800 whitespace-pre-wrap">{message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
