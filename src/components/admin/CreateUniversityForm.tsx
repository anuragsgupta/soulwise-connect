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
import { Loader2, University, Building, Phone, Mail, Globe, Calendar, MapPin, Check } from 'lucide-react';

interface CreateUniversityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UniversityFormData {
  name: string;
  domain: string;
  address: string;
  establishedYear: number;
  contactEmail: string;
  contactPhone: string;
  website: string;
}

interface UniversityFormErrors {
  name?: string;
  domain?: string;
  address?: string;
  establishedYear?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
}

const CreateUniversityForm: React.FC<CreateUniversityFormProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<UniversityFormData>({
    name: '',
    domain: '',
    address: '',
    establishedYear: new Date().getFullYear(),
    contactEmail: '',
    contactPhone: '',
    website: ''
  });

  const [errors, setErrors] = useState<UniversityFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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

    if (!formData.establishedYear) {
      newErrors.establishedYear = 'Established year is required';
    } else if (formData.establishedYear < 1800 || formData.establishedYear > new Date().getFullYear()) {
      newErrors.establishedYear = 'Please enter a valid year';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    } else if (!/^[\+]?[\d\s\-\(\)]+$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Please enter a valid phone number';
    }

    // Optional website validation
    if (formData.website && formData.website.trim()) {
      if (!/^https?:\/\/.+\..+/.test(formData.website)) {
        newErrors.website = 'Please enter a valid website URL (including http:// or https://)';
      }
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
          establishedYear: new Date().getFullYear(),
          contactEmail: '',
          contactPhone: '',
          website: ''
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
        name: '',
        domain: '',
        address: '',
        establishedYear: new Date().getFullYear(),
        contactEmail: '',
        contactPhone: '',
        website: ''
      });
      setErrors({});
      setIsSuccess(false);
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
            Add a new university to the system. All fields marked with * are required.
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
                    placeholder="Complete university address including city, state, and postal code"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={errors.address ? 'border-red-500' : ''}
                    rows={3}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address}</p>
                  )}
                </div>

                {/* Established Year */}
                <div className="space-y-2">
                  <Label htmlFor="establishedYear">Established Year *</Label>
                  <Input
                    id="establishedYear"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    placeholder="e.g., 1868"
                    value={formData.establishedYear}
                    onChange={(e) => handleInputChange('establishedYear', parseInt(e.target.value) || 0)}
                    className={errors.establishedYear ? 'border-red-500' : ''}
                  />
                  {errors.establishedYear && (
                    <p className="text-sm text-red-500">{errors.establishedYear}</p>
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
                {/* Contact Email */}
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="e.g., admin@berkeley.edu"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    className={errors.contactEmail ? 'border-red-500' : ''}
                  />
                  {errors.contactEmail && (
                    <p className="text-sm text-red-500">{errors.contactEmail}</p>
                  )}
                </div>

                {/* Contact Phone */}
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone *</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="e.g., +1 (510) 642-6000"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    className={errors.contactPhone ? 'border-red-500' : ''}
                  />
                  {errors.contactPhone && (
                    <p className="text-sm text-red-500">{errors.contactPhone}</p>
                  )}
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="e.g., https://www.berkeley.edu"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className={errors.website ? 'border-red-500' : ''}
                  />
                  {errors.website && (
                    <p className="text-sm text-red-500">{errors.website}</p>
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