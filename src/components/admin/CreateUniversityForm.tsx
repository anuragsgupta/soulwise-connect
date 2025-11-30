'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, University, Building, Phone, Mail, Globe, Calendar, MapPin, Check, Download, RefreshCw } from 'lucide-react';

interface CreateUniversityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UniversityFormData {
  aisheCode?: string;
  name: string;
  domain: string;
  address: string;
  city: string;
  state: string;
  district?: string;
  email: string;
  phone: string;
  contactFirstName?: string;
  contactLastName?: string;
}

interface UniversityFormErrors {
  aisheCode?: string;
  name?: string;
  domain?: string;
  address?: string;
  city?: string;
  state?: string;
  email?: string;
  phone?: string;
}

const CreateUniversityForm: React.FC<CreateUniversityFormProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<UniversityFormData>({
    aisheCode: '',
    name: '',
    domain: '',
    address: '',
    city: '',
    state: '',
    district: '',
    email: '',
    phone: '',
    contactFirstName: '',
    contactLastName: '',
  });

  const [errors, setErrors] = useState<UniversityFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingAISHE, setIsFetchingAISHE] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [useManualEntry, setUseManualEntry] = useState(false);
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: UniversityFormErrors = {};

    // Required field validations
    if (!formData.name.trim()) {
      newErrors.name = 'University name is required';
    }

    if (!formData.domain.trim()) {
      newErrors.domain = 'Domain is required';
    } else if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.domain)) {
      newErrors.domain = 'Please enter a valid domain (e.g., university.edu)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^[\+]?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UniversityFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field as keyof UniversityFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleFetchAISHE = async () => {
    if (!formData.aisheCode?.trim()) {
      toast({
        title: 'AISHE Code Required',
        description: 'Please enter an AISHE code to fetch data',
        variant: 'destructive',
      });
      return;
    }

    // Validate AISHE code format for University (must start with U-)
    const code = formData.aisheCode.trim().toUpperCase();
    if (!code.startsWith('U-')) {
      toast({
        title: 'Invalid AISHE Code',
        description: 'University AISHE codes must start with "U-" (e.g., U-12345). College/Institute codes start with "C-".',
        variant: 'destructive',
      });
      return;
    }

    setIsFetchingAISHE(true);
    try {
      const response = await fetch(`/api/universities/fetch-aishe?code=${formData.aisheCode}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch AISHE data');
      }

      // Auto-fill form with AISHE data
      setFormData(prev => ({
        ...prev,
        ...result.data,
      }));

      toast({
        title: 'Data Fetched Successfully!',
        description: 'University details have been auto-filled from AISHE database',
      });
    } catch (error) {
      console.error('Error fetching AISHE data:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch AISHE data',
        variant: 'destructive',
      });
    } finally {
      setIsFetchingAISHE(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please correct the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/universities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create university');
      }

      const result = await response.json();
      
      setIsSuccess(true);
      toast({
        title: 'Success!',
        description: 'University created successfully',
      });

      // Reset form after short delay
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          name: '',
          domain: '',
          address: '',
          city: '',
          state: '',
          email: '',
          phone: '',
        });
        onSuccess();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error creating university:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create university',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        aisheCode: '',
        name: '',
        domain: '',
        address: '',
        city: '',
        state: '',
        district: '',
        email: '',
        phone: '',
        contactFirstName: '',
        contactLastName: '',
      });
      setErrors({});
      setIsSuccess(false);
      setUseManualEntry(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <University className="h-5 w-5 text-primary" />
            Create New University
          </DialogTitle>
          <DialogDescription>
            Use AISHE code for auto-fill or enter details manually. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800">University Created Successfully!</h3>
              <p className="text-sm text-green-600 mt-1">Redirecting to dashboard...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* AISHE Code Auto-Fetch Section */}
            <Card className="bg-blue-50/50 border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Download className="h-4 w-4" />
                    Auto-Fill from AISHE Database
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setUseManualEntry(!useManualEntry)}
                  >
                    {useManualEntry ? 'Use AISHE' : 'Manual Entry'}
                  </Button>
                </div>
                <CardDescription>
                  {useManualEntry 
                    ? 'Filling details manually. Click "Use AISHE" to enable auto-fetch.'
                    : 'Enter AISHE code (e.g., C-36022) to automatically fetch university details from the official database'}
                </CardDescription>
              </CardHeader>
              {!useManualEntry && (
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="aisheCode">AISHE Code</Label>
                      <Input
                        id="aisheCode"
                        type="text"
                        placeholder="e.g., U-12345 (University codes start with U-)"
                        value={formData.aisheCode || ''}
                        onChange={(e) => handleInputChange('aisheCode', e.target.value.toUpperCase())}
                        className={errors.aisheCode ? 'border-red-500' : ''}
                      />
                      {errors.aisheCode && (
                        <p className="text-sm text-red-500">{errors.aisheCode}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        University AISHE codes start with U- (e.g., U-12345). College codes start with C-
                      </p>
                    </div>
                    <div className="pt-8">
                      <Button
                        type="button"
                        onClick={handleFetchAISHE}
                        disabled={isFetchingAISHE || !formData.aisheCode?.trim()}
                      >
                        {isFetchingAISHE ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Fetching...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Fetch Details
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <Alert>
                    <AlertDescription className="text-xs">
                      <strong>Tip:</strong> AISHE codes can be found on the{' '}
                      <a 
                        href="https://www.sih.gov.in/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Smart India Hackathon website
                      </a>
                      . This will auto-fill all university details including name, address, and contact information.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              )}
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* University Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">University Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., University of California, Berkeley"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Domain */}
                <div className="space-y-2">
                  <Label htmlFor="domain">Official Domain *</Label>
                  <Input
                    id="domain"
                    type="text"
                    placeholder="e.g., berkeley.edu"
                    value={formData.domain}
                    onChange={(e) => handleInputChange('domain', e.target.value.toLowerCase())}
                    className={errors.domain ? 'border-red-500' : ''}
                  />
                  {errors.domain && (
                    <p className="text-sm text-red-500">{errors.domain}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    This domain will be used for email verification and admin invitations
                  </p>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Street address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={errors.address ? 'border-red-500' : ''}
                    rows={2}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address}</p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="e.g., Berkeley"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={errors.city ? 'border-red-500' : ''}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">{errors.city}</p>
                  )}
                </div>

                {/* State */}
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    type="text"
                    placeholder="e.g., California"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={errors.state ? 'border-red-500' : ''}
                  />
                  {errors.state && (
                    <p className="text-sm text-red-500">{errors.state}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Phone className="h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">University Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g., admin@berkeley.edu"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">University Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g., +1 (510) 642-6000"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Alert>
              <AlertDescription className="text-sm">
                <strong>Security Notice:</strong> The domain you specify will be used for email verification. 
                Only users with email addresses from this domain will be able to register as administrators 
                for this university.
              </AlertDescription>
            </Alert>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating University...
                  </>
                ) : (
                  <>
                    <University className="mr-2 h-4 w-4" />
                    Create University
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateUniversityForm;