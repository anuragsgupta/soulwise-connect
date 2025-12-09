'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Clock, UserCircle, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Request {
  id: string;
  anonymous_name: string;
  message: string;
  topic: string | null;
  status: string;
  created_at: string;
  responded_at: string | null;
  response_message: string | null;
}

export default function AnonymousRequests() {
  const router = useRouter();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
    
    // Poll for new requests every 10 seconds
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/anonymous-mentoring/requests?status=PENDING', {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setRequests(result.data.requests);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!selectedRequest) return;

    setProcessing(true);

    try {
      const response = await fetch(
        `/api/anonymous-mentoring/requests/${selectedRequest.id}/accept`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            responseMessage: responseMessage.trim() || 'Request accepted'
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Request Accepted',
          description: 'Anonymous chat session has been created'
        });
        setShowAcceptDialog(false);
        setResponseMessage('');
        fetchRequests();
        
        // Navigate to the new session
        router.push(`/faculty/anonymous-mentoring/chat/${result.data.session.id}`);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to accept request'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to accept request'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeclineRequest = async () => {
    if (!selectedRequest) return;

    if (!declineReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide a reason for declining'
      });
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(
        `/api/anonymous-mentoring/requests/${selectedRequest.id}/decline`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            reason: declineReason.trim()
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Request Declined',
          description: 'The student has been notified'
        });
        setShowDeclineDialog(false);
        setDeclineReason('');
        fetchRequests();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to decline request'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to decline request'
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Anonymous Mentoring Requests</h1>
        <p className="text-purple-100">Review and respond to anonymous chat requests from students</p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No pending requests</p>
            <p className="text-sm text-gray-500 mt-2">
              You'll see new anonymous chat requests here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <UserCircle className="h-10 w-10 text-purple-600" />
                    <div>
                      <CardTitle className="text-xl">{request.anonymous_name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {request.topic && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Topic</Label>
                    <Badge variant="outline" className="mt-1">
                      {request.topic}
                    </Badge>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Message</Label>
                  <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded-lg">
                    {request.message}
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowAcceptDialog(true);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowDeclineDialog(true);
                    }}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Accept Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Anonymous Request</DialogTitle>
            <DialogDescription>
              Accept the anonymous chat request from {selectedRequest?.anonymous_name}.
              You can add an optional welcome message.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="response">Welcome Message (Optional)</Label>
            <Textarea
              id="response"
              placeholder="I'm happy to help you..."
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              rows={3}
              maxLength={300}
            />
            <p className="text-sm text-gray-500 mt-1">{responseMessage.length}/300 characters</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAcceptDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAcceptRequest}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? 'Accepting...' : 'Accept Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Anonymous Request</DialogTitle>
            <DialogDescription>
              Decline the request from {selectedRequest?.anonymous_name}.
              Please provide a reason that will be shared with the student.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Reason for Declining *</Label>
            <Textarea
              id="reason"
              placeholder="I'm currently unavailable, please try reaching out to another mentor..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={3}
              maxLength={300}
              required
            />
            <p className="text-sm text-gray-500 mt-1">{declineReason.length}/300 characters</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeclineDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeclineRequest}
              disabled={processing || !declineReason.trim()}
              variant="destructive"
            >
              {processing ? 'Declining...' : 'Decline Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
