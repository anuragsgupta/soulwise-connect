"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, CheckCircle, Phone, Video, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  counselorName: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const AppointmentBooking = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedCounselor, setSelectedCounselor] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [reason, setReason] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      counselorName: 'Dr. Ankita Rai',
      date: '2024-12-15',
      time: '14:00',
      type: 'In-Person',
      status: 'scheduled'
    },
    {
      id: '2',
      counselorName: 'Dr. Ram Gupta',
      date: '2024-12-10',
      time: '10:30',
      type: 'Video Call',
      status: 'completed'
    }
  ]);
  const { toast } = useToast();

  const counselors = [
    { id: 'dr-sarah', name: 'Dr. Ankita Rai', specialty: 'Anxiety & Depression', rating: 4.9 },
    { id: 'dr-michael', name: 'Dr. Ram Gupta', specialty: 'Academic Stress', rating: 4.8 },
    { id: 'dr-priya', name: 'Dr. Priya Sharma', specialty: 'Relationship Counseling', rating: 4.9 },
    { id: 'dr-james', name: 'Dr. Rajesh Sharma', specialty: 'Trauma & PTSD', rating: 4.7 }
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30'
  ];

  const sessionTypes = [
    { id: 'in-person', label: 'In-Person Session', icon: User },
    { id: 'video', label: 'Video Call', icon: Video },
    { id: 'phone', label: 'Phone Call', icon: Phone },
    { id: 'chat', label: 'Text Chat', icon: MessageSquare }
  ];

  const handleBookAppointment = () => {
    if (!selectedDate || !selectedTime || !selectedCounselor || !sessionType) {
      toast({
        title: "Please fill in all required fields",
        description: "We need all the information to book your appointment.",
        variant: "destructive"
      });
      return;
    }

    const counselor = counselors.find(c => c.id === selectedCounselor);
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      counselorName: counselor?.name || '',
      date: selectedDate,
      time: selectedTime,
      type: sessionTypes.find(t => t.id === sessionType)?.label || '',
      status: 'scheduled'
    };

    setAppointments(prev => [...prev, newAppointment]);
    
    toast({
      title: "Appointment booked successfully! 🎉",
      description: `Your session with ${counselor?.name} is scheduled for ${selectedDate} at ${selectedTime}.`,
    });

    // Reset form
    setSelectedDate("");
    setSelectedTime("");
    setSelectedCounselor("");
    setSessionType("");
    setReason("");
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Calendar className="w-6 h-6 mr-3 text-support animate-pulse-soft" />
            Book Counseling Session
          </CardTitle>
          <CardDescription>
            Schedule a confidential session with one of our qualified mental health professionals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Counselor Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">Choose Your Counselor</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {counselors.map((counselor) => (
                <Card
                  key={counselor.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                    selectedCounselor === counselor.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedCounselor(counselor.id)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-primary">{counselor.name}</h3>
                    <p className="text-sm text-muted-foreground">{counselor.specialty}</p>
                    <div className="flex items-center mt-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>⭐</span>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground ml-2">{counselor.rating}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Date & Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="appointment-date" className="text-base font-medium mb-2 block">
                Preferred Date
              </Label>
              <Input
                id="appointment-date"
                type="date"
                value={selectedDate}
                min={getMinDate()}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-base font-medium mb-2 block">Preferred Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Session Type */}
          <div>
            <Label className="text-base font-medium mb-3 block">Session Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sessionTypes.map((type) => (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                    sessionType === type.id 
                      ? 'ring-2 ring-support bg-support/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSessionType(type.id)}
                >
                  <CardContent className="p-4 text-center">
                    <type.icon className={`w-6 h-6 mx-auto mb-2 ${
                      sessionType === type.id ? 'text-support' : 'text-muted-foreground'
                    }`} />
                    <div className="text-sm font-medium">{type.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Reason for Session */}
          <div>
            <Label htmlFor="session-reason" className="text-base font-medium mb-2 block">
              What would you like to discuss? (Optional)
            </Label>
            <Textarea
              id="session-reason"
              placeholder="This helps your counselor prepare for the session. Everything you share is confidential."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <Button 
            onClick={handleBookAppointment}
            className="w-full bg-gradient-to-r from-support to-primary hover:from-support/90 hover:to-primary/90 transition-all duration-300"
            size="lg"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Book Appointment
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-wellness" />
            Your Appointments
          </CardTitle>
          <CardDescription>Manage your scheduled and past counseling sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No appointments scheduled yet. Book your first session above!
              </p>
            ) : (
              appointments.map((appointment) => (
                <Card key={appointment.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-primary">{appointment.counselorName}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(appointment.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Clock className="w-4 h-4 mr-1" />
                          {appointment.time} • {appointment.type}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          appointment.status === 'scheduled' 
                            ? 'bg-blue-100 text-blue-800' 
                            : appointment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status}
                        </span>
                        {appointment.status === 'scheduled' && (
                          <div className="mt-2">
                            <Button variant="outline" size="sm" className="text-xs">
                              Reschedule
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentBooking;