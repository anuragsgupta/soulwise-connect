'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, GraduationCap, Check } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  rollNumber: string;
  currentSemester: number;
  cgpa: number;
  status: string;
}

interface EditStudentFormProps {
  student: Student;
  onSuccess: () => void;
  onCancel: () => void;
}

interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  rollNumber: string;
  currentSemester: number;
  cgpa: number;
  status: string;
}

interface StudentFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  rollNumber?: string;
  currentSemester?: string;
  cgpa?: string;
}

export default function EditStudentForm({ student, onSuccess, onCancel }: EditStudentFormProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    name: student.name,
    email: student.email,
    phone: student.phone,
    rollNumber: student.rollNumber,
    currentSemester: student.currentSemester,
    cgpa: student.cgpa,
    status: student.status,
  });

  const [errors, setErrors] = useState<StudentFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: StudentFormErrors = {};

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

    if (!formData.rollNumber.trim()) {
      newErrors.rollNumber = 'Roll number is required';
    }

    if (formData.currentSemester < 1 || formData.currentSemester > 12) {
      newErrors.currentSemester = 'Semester must be between 1 and 12';
    }

    if (formData.cgpa < 0 || formData.cgpa > 10) {
      newErrors.cgpa = 'CGPA must be between 0 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof StudentFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field as keyof StudentFormErrors]) {
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
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update student');
      }

      setIsSuccess(true);
      toast({
        title: 'Success!',
        description: 'Student updated successfully',
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update student',
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
          <h3 className="text-lg font-semibold text-green-800">Student Updated Successfully!</h3>
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
            placeholder="e.g., Jane Doe"
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
            placeholder="e.g., student@university.edu"
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

        {/* Roll Number */}
        <div className="space-y-2">
          <Label htmlFor="rollNumber">Roll Number *</Label>
          <Input
            id="rollNumber"
            type="text"
            placeholder="e.g., CS2023001"
            value={formData.rollNumber}
            onChange={(e) => handleInputChange('rollNumber', e.target.value)}
            className={errors.rollNumber ? 'border-red-500' : ''}
          />
          {errors.rollNumber && (
            <p className="text-sm text-red-500">{errors.rollNumber}</p>
          )}
        </div>

        {/* Current Semester */}
        <div className="space-y-2">
          <Label htmlFor="currentSemester">Current Semester *</Label>
          <Input
            id="currentSemester"
            type="number"
            min="1"
            max="12"
            value={formData.currentSemester}
            onChange={(e) => handleInputChange('currentSemester', parseInt(e.target.value) || 1)}
            className={errors.currentSemester ? 'border-red-500' : ''}
          />
          {errors.currentSemester && (
            <p className="text-sm text-red-500">{errors.currentSemester}</p>
          )}
        </div>

        {/* CGPA */}
        <div className="space-y-2">
          <Label htmlFor="cgpa">CGPA</Label>
          <Input
            id="cgpa"
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={formData.cgpa}
            onChange={(e) => handleInputChange('cgpa', parseFloat(e.target.value) || 0)}
            className={errors.cgpa ? 'border-red-500' : ''}
          />
          {errors.cgpa && (
            <p className="text-sm text-red-500">{errors.cgpa}</p>
          )}
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
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="GRADUATED">Graduated</SelectItem>
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
              <GraduationCap className="mr-2 h-4 w-4" />
              Update Student
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
