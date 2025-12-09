"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  UserCircle,
  Briefcase,
  Building2,
  Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface Faculty {
  id: string;
  name: string;
  email: string;
  facultyType: string;
  jobTitle: string | null;
  availabilityStatus: string;
  yearsOfExperience: number | null;
  department: {
    id: string;
    name: string;
    code: string;
  };
}

export default function FacultySelector() {
  const router = useRouter();
  const { toast } = useToast();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");
  const [topic, setTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterAvailability, setFilterAvailability] = useState<string>("ALL");

  useEffect(() => {
    fetchFaculty();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [faculty, filterType, filterAvailability]);

  const fetchFaculty = async () => {
    try {
      const response = await fetch("/api/anonymous-mentoring/faculty", {
        credentials: "include",
      });

      const result = await response.json();

      console.log("Faculty API Response:", result);
      console.log("Faculty data:", result.data);
      console.log("Faculty array:", result.data?.faculty);

      if (result.success) {
        setFaculty(result.data.faculty);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to load faculty",
        });
      }
    } catch (error) {
      console.error("Faculty fetch error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load faculty list",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...faculty];

    if (filterType !== "ALL") {
      filtered = filtered.filter((f) => f.facultyType === filterType);
    }

    if (filterAvailability !== "ALL") {
      filtered = filtered.filter(
        (f) => f.availabilityStatus === filterAvailability
      );
    }

    setFilteredFaculty(filtered);
  };

  const handleStartChat = (facultyMember: Faculty) => {
    setSelectedFaculty(facultyMember);
    setShowRequestDialog(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedFaculty) return;

    if (!initialMessage.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an initial message",
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/anonymous-mentoring/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          mentorId: selectedFaculty.id,
          initialMessage: initialMessage.trim(),
          topic: topic.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description:
            "Anonymous chat request sent! Waiting for faculty to accept.",
        });
        setShowRequestDialog(false);
        setInitialMessage("");
        setTopic("");
        router.push("/student/anonymous-mentoring/sessions");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to send request",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send anonymous chat request",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800";
      case "BUSY":
        return "bg-yellow-100 text-yellow-800";
      case "OFFLINE":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFacultyTypeLabel = (type: string) => {
    return type.replace(/_/g, " ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading faculty...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Anonymous Peer Mentoring</h1>
        <p className="text-purple-100">
          Connect with mentors anonymously for confidential support
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Faculty Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="MENTOR">Mentor</SelectItem>
                  <SelectItem value="COUNSELOR">Counselor</SelectItem>
                  <SelectItem value="HOD">HOD</SelectItem>
                  <SelectItem value="MENTOR_SUPERVISOR">
                    Mentor Supervisor
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Availability</Label>
              <Select
                value={filterAvailability}
                onValueChange={setFilterAvailability}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="BUSY">Busy</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faculty List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaculty.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <UserCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No faculty members found matching your filters
            </p>
          </div>
        ) : (
          filteredFaculty.map((facultyMember) => (
            <Card
              key={facultyMember.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {facultyMember.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {facultyMember.jobTitle ||
                        getFacultyTypeLabel(facultyMember.facultyType)}
                    </CardDescription>
                  </div>
                  <Badge
                    className={getAvailabilityColor(
                      facultyMember.availabilityStatus
                    )}
                  >
                    {facultyMember.availabilityStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="h-4 w-4" />
                  <span>{facultyMember.department.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="h-4 w-4" />
                  <span>{getFacultyTypeLabel(facultyMember.facultyType)}</span>
                </div>
                {facultyMember.yearsOfExperience && (
                  <div className="text-sm text-gray-600">
                    {facultyMember.yearsOfExperience} years of experience
                  </div>
                )}
                <Button
                  onClick={() => handleStartChat(facultyMember)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={facultyMember.availabilityStatus === "OFFLINE"}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Anonymous Chat
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Start Anonymous Chat</DialogTitle>
            <DialogDescription>
              Send an anonymous request to {selectedFaculty?.name}. Your
              identity will remain hidden.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="topic">Topic (Optional)</Label>
              <Input
                id="topic"
                placeholder="e.g., Stress Management, Academic Concerns"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="message">Initial Message *</Label>
              <Textarea
                id="message"
                placeholder="Introduce your concern or question..."
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                rows={4}
                maxLength={500}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {initialMessage.length}/500 characters
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-800">
                <strong>Note:</strong> Your chat will be completely anonymous. A
                random name will be assigned to you.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRequestDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={submitting || !initialMessage.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {submitting ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
