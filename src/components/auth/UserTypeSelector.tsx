import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Shield, Heart } from "lucide-react";

interface UserTypeSelectorProps {
  onSelectUserType: (type: 'student' | 'admin') => void;
}

export const UserTypeSelector = ({ onSelectUserType }: UserTypeSelectorProps) => {
  const [selectedType, setSelectedType] = useState<'student' | 'admin'>('student');

  const handleSubmit = () => {
    onSelectUserType(selectedType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-peach-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Welcome to MANN MITRA
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Please select your role to continue
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Button
              onClick={() => setSelectedType('student')}
              variant={selectedType === 'student' ? 'default' : 'outline'}
              className={`w-full p-6 h-auto flex items-center justify-start gap-4 ${
                selectedType === 'student' 
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white' 
                  : 'border-teal-200 hover:border-teal-300'
              }`}
            >
              <Users className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold">Student</div>
                <div className="text-sm opacity-90">Access mental health support and resources</div>
              </div>
            </Button>

            <Button
              onClick={() => setSelectedType('admin')}
              variant={selectedType === 'admin' ? 'default' : 'outline'}
              className={`w-full p-6 h-auto flex items-center justify-start gap-4 ${
                selectedType === 'admin' 
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white' 
                  : 'border-teal-200 hover:border-teal-300'
              }`}
            >
              <Shield className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold">Admin/Counselor</div>
                <div className="text-sm opacity-90">Manage platform and provide support</div>
              </div>
            </Button>
          </div>

          <Button 
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
          >
            Continue as {selectedType === 'student' ? 'Student' : 'Admin'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};