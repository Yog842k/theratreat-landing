"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Copy,
  ExternalLink,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';

export default function HMSConfigPage() {
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [testRoomCode, setTestRoomCode] = useState('demo-room-' + Date.now());

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/hms/config-check');
      const data = await response.json();
      setConfigStatus(data);
    } catch (error) {
      setConfigStatus({
        isValid: false,
        errors: ['Failed to check configuration'],
        warnings: [],
        configured: false
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateRoomCode = () => {
    setTestRoomCode('therabook-' + Math.random().toString(36).substring(2, 8));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 text-blue-600 mr-2" />
              <CardTitle className="text-2xl">100ms Configuration</CardTitle>
            </div>
            <p className="text-gray-600">
              Manage your 100ms API keys and test video call configuration
            </p>
          </CardHeader>
        </Card>

        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Configuration Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {configStatus ? (
              <>
                <div className="flex items-center space-x-2">
                  {configStatus.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    Configuration {configStatus.isValid ? 'Valid' : 'Invalid'}
                  </span>
                  <Badge variant={configStatus.isValid ? 'default' : 'destructive'}>
                    {configStatus.configured ? 'Configured' : 'Not Configured'}
                  </Badge>
                </div>

                {configStatus.errors?.length > 0 && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Errors:</strong>
                      <ul className="mt-2 list-disc list-inside">
                        {configStatus.errors.map((error: string, index: number) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {configStatus.warnings?.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Warnings:</strong>
                      <ul className="mt-2 list-disc list-inside">
                        {configStatus.warnings.map((warning: string, index: number) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-gray-600">Checking configuration...</p>
              </div>
            )}

            <Button onClick={checkConfiguration} variant="outline" className="w-full">
              Refresh Configuration
            </Button>
          </CardContent>
        </Card>

        {/* Environment Variables Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Required Environment Variables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm">Environment Variables</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              
              <div className="space-y-2 font-mono text-sm">
                <div className="flex items-center justify-between">
                  <span>HMS_ACCESS_KEY=</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard('HMS_ACCESS_KEY=your_access_key_here')}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>HMS_SECRET=</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard('HMS_SECRET=your_secret_here')}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>HMS_TEMPLATE_ID=</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard('HMS_TEMPLATE_ID=your_template_id_here')}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>HMS_SUBDOMAIN=</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard('HMS_SUBDOMAIN=your_subdomain_here')}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Add these variables to your <code>.env.local</code> file. 
                Get the values from your{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => window.open('https://dashboard.100ms.live/', '_blank')}
                >
                  100ms Dashboard
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Test Room */}
        <Card>
          <CardHeader>
            <CardTitle>Test Video Call</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roomCode">Room Code</Label>
              <div className="flex space-x-2">
                <Input
                  id="roomCode"
                  value={testRoomCode}
                  onChange={(e) => setTestRoomCode(e.target.value)}
                  placeholder="Enter room code"
                />
                <Button onClick={generateRoomCode} variant="outline">
                  Generate
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => window.open(`/video-call/room?roomCode=${testRoomCode}&userName=Test%20Therapist&userRole=therapist`, '_blank')}
                className="w-full"
              >
                Test as Therapist
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
              
              <Button
                onClick={() => window.open(`/video-call/room?roomCode=${testRoomCode}&userName=Test%20Client&userRole=client`, '_blank')}
                variant="outline"
                className="w-full"
              >
                Test as Client
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Note:</strong> Basic video calls work without API keys using room codes. 
                API keys are needed for server-side room creation and management.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                onClick={() => window.open('https://dashboard.100ms.live/', '_blank')}
                className="h-auto p-4 flex flex-col space-y-2"
              >
                <Settings className="w-6 h-6" />
                <span>100ms Dashboard</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => window.open('https://docs.100ms.live/', '_blank')}
                className="h-auto p-4 flex flex-col space-y-2"
              >
                <Settings className="w-6 h-6" />
                <span>Documentation</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => window.open('/video-call/quick-test?roomCode=demo-room&userName=Test%20User&userRole=therapist', '_blank')}
                className="h-auto p-4 flex flex-col space-y-2"
              >
                <Settings className="w-6 h-6" />
                <span>Quick Test</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => window.open('/100MS_API_SETUP.md', '_blank')}
                className="h-auto p-4 flex flex-col space-y-2"
              >
                <Settings className="w-6 h-6" />
                <span>Setup Guide</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
