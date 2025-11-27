'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCog, Check } from 'lucide-react';

interface Faculty {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  facultyType: string;
  status: string;
  yearsOfExperience: number;
}

interface EditFacultyFormProps {
  faculty: Faculty;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FacultyFormData {
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  facultyType: string;
  status: string;
  yearsOfExperience: number;
}

interface FacultyFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  yearsOfExperience?: string;
}

export default function EditFacultyForm({ faculty, onSuccess, onCancel }: EditFacultyFormProps) {
  const [formData, setFormData] = useState<FacultyFormData>({
    name: faculty.name,
    email: faculty.email,
    phone: faculty.phone,
    jobTitle: faculty.jobTitle,
    facultyType: faculty.facultyType,
    status: faculty.status,
    yearsOfExperience: faculty.yearsOfExperience,
  });

  const [errors, setErrors] = useState<FacultyFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: FacultyFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
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

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    if (formData.yearsOfExperience < 0) {
      newErrors.yearsOfExperience = 'Years of experience cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FacultyFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field as keyof FacultyFormErrors]) {
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
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/faculties/${faculty.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update faculty');
      }

      setIsSuccess(true);
      toast({
        title: 'Success!',
        description: 'Faculty updated successfully',
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('Error updating faculty:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update faculty',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-green-800">Faculty Updated Successfully!</h3>
          <p className="text-sm text-green-600 mt-1">Changes have been saved.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g., Dr. John Smith"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="e.g., faculty@university.edu"
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
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="e.g., +1 (555) 123-4567"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* Job Title */}
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title *</Label>
          <Input
            id="jobTitle"
            type="text"
            placeholder="e.g., Professor"
            value={formData.jobTitle}
            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
            className={errors.jobTitle ? 'border-red-500' : ''}
          />
          {errors.jobTitle && (
            <p className="text-sm text-red-500">{errors.jobTitle}</p>
          )}
        </div>

        {/* Years of Experience */}
        <div className="space-y-2">
          <Label htmlFor="yearsOfExperience">Years of Experience</Label>
          <Input
            id="yearsOfExperience"
            type="number"
            min="0"
            value={formData.yearsOfExperience}
            onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value) || 0)}
            className={errors.yearsOfExperience ? 'border-red-500' : ''}
          />
          {errors.yearsOfExperience && (
            <p className="text-sm text-red-500">{errors.yearsOfExperience}</p>
          )}
        </div>

        {/* Faculty Type */}
        <div className="space-y-2">
          <Label htmlFor="facultyType">Faculty Type</Label>
          <Select
            value={formData.facultyType}
            onValueChange={(value) => handleInputChange('facultyType', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERMANENT">Permanent</SelectItem>
              <SelectItem value="VISITING">Visiting</SelectItem>
              <SelectItem value="CONTRACTUAL">Contractual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="ON_LEAVE">On Leave</SelectItem>
              <SelectItem value="RETIRED">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <UserCog className="mr-2 h-4 w-4" />
              Update Faculty
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
