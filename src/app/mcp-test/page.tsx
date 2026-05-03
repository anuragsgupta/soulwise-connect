import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, MessageCircle, Shield } from 'lucide-react';

export default function MCPTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary">Mann Mitra MCP System</h1>
        <p className="text-muted-foreground text-lg">
          Mental Crisis Protocol - SMS Alert System Testing
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              System Status
            </CardTitle>
            <CardDescription>
              Crisis detection and alert system overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>SMS Service</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <div className="flex justify-between">
                <span>Crisis Detection</span>
                <span className="text-green-600 font-medium">Enabled</span>
              </div>
              <div className="flex justify-between">
                <span>Counselor Alerts</span>
                <span className="text-green-600 font-medium">Ready</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              Test ChatBot
            </CardTitle>
            <CardDescription>
              Try the crisis detection system in action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Go to the ChatBot and try these test messages to see crisis detection in action:
              </p>
              
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-red-50 rounded border-l-4 border-red-400">
                  <strong>Critical:</strong> "I want to end my life"
                </div>
                <div className="p-2 bg-orange-50 rounded border-l-4 border-orange-400">
                  <strong>High:</strong> "I'm thinking of hurting myself"
                </div>
                <div className="p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                  <strong>Medium:</strong> "I feel hopeless and can't cope"
                </div>
                <div className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                  <strong>Low:</strong> "I'm feeling really sad today"
                </div>
              </div>

              <Link href="/dashboard">
                <Button className="w-full">
                  Go to ChatBot
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crisis Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Crisis Detection Levels
          </CardTitle>
          <CardDescription>
            How the system categorizes and responds to different crisis levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="w-full h-2 bg-red-500 rounded"></div>
              <h4 className="font-semibold text-red-700">Critical</h4>
              <p className="text-xs text-muted-foreground">
                Immediate suicide risk. Instant SMS alert sent. Emergency resources provided.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="w-full h-2 bg-orange-500 rounded"></div>
              <h4 className="font-semibold text-orange-700">High</h4>
              <p className="text-xs text-muted-foreground">
                Self-harm indicators. SMS alert sent. Crisis resources provided.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="w-full h-2 bg-yellow-500 rounded"></div>
              <h4 className="font-semibold text-yellow-700">Medium</h4>
              <p className="text-xs text-muted-foreground">
                Mental health concerns. SMS alert sent. Support resources offered.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="w-full h-2 bg-blue-500 rounded"></div>
              <h4 className="font-semibold text-blue-700">Low</h4>
              <p className="text-xs text-muted-foreground">
                Mild distress. No SMS alert. Self-care suggestions provided.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-purple-600" />
            SMS API Configuration
          </CardTitle>
          <CardDescription>
            Fast2SMS integration details
          </CardDescription>
          </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Endpoint:</strong>
                <code className="block mt-1 p-2 bg-muted rounded text-xs">
                  POST /api/mcp/sms-alert
                </code>
              </div>
              <div>
                <strong>Provider:</strong>
                <code className="block mt-1 p-2 bg-muted rounded text-xs">
                  Fast2SMS API
                </code>
              </div>
            </div>
            
            <div>
              <strong>SMS Format:</strong>
              <code className="block mt-1 p-2 bg-muted rounded text-xs whitespace-pre-wrap">
{`🚨 MANN MITRA CRISIS ALERT 🚨
Time: [timestamp]
Severity: [LEVEL]
Patient: [session_id]

Message: [user_message]

Please respond immediately.`}
              </code>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 text-xs">
              <div>
                <strong>Flash Messages:</strong> Enabled for urgency
              </div>
              <div>
                <strong>Language:</strong> English (auto-detect Unicode)
              </div>
              <div>
                <strong>Route:</strong> Quick SMS (q)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}