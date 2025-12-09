import { Card, CardContent } from "@/components/ui/card";
import { Heart, Phone, AlertTriangle, Brain, Calendar } from "lucide-react";

const CrisisSupportCard = () => (
  <Card className="bg-glacier/50 backdrop-blur-sm shadow-md">
    <CardContent className="pt-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-medicalBlue rounded-full flex items-center justify-center">
            <Phone className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-primary mb-3 flex items-center">
            <Heart className="w-4 h-4 mr-2 text-red-500" />
            You're Worth the Call
          </h3>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            Taking care of your mental health is one of the strongest things you can do. 
            If you're struggling, reaching out is a sign of <strong>courage, not weakness</strong>.
          </p>
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-r-lg">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <span className="font-semibold text-red-800">Crisis Support - Available 24/7</span>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-red-700">
                📞 1800-599-0019
              </p>
              <p className="text-sm text-red-600">
                KIRAN Mental Health Helpline
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  ✓ Free & Confidential
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  ✓ Trained Professionals
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <Brain className="w-4 h-4 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800 text-sm">Campus Counseling</span>
              </div>
              <p className="text-xs text-blue-600">Professional support on campus</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <Calendar className="w-4 h-4 text-green-600 mr-2" />
                <span className="font-medium text-green-800 text-sm">Book Appointment</span>
              </div>
              <p className="text-xs text-green-600">Schedule with a counselor</p>
            </div>
          </div>
          <div className="bg-primary/5 rounded-lg p-3 border border-primary/20 text-center">
            <p className="text-sm text-primary font-medium">
              💡 Remember: Every step toward getting help is a victory. You're not alone! 🌈
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default CrisisSupportCard;
