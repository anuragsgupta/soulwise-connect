'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check } from 'lucide-react';

interface CreateFacultyFormProps {
  instituteId: string;
  universityId: string;
  instituteName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FacultyFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  jobTitle: string;
  facultyType: 'HOD' | 'MENTOR_SUPERVISOR' | 'MENTOR' | 'FACULTY' | 'COUNSELOR';
  departmentId: string;
  yearsOfExperience: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

const CreateFacultyForm: React.FC<CreateFacultyFormProps> = ({
  instituteId,
  universityId,
  instituteName,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<FacultyFormData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    jobTitle: '',
    facultyType: 'FACULTY',
    departmentId: '',
    yearsOfExperience: '',
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FacultyFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDepartments();
  }, [instituteId]);

  const loadDepartments = async () => {
    try {
      setIsLoadingDepartments(true);
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/departments?instituteId=${instituteId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      
      if (result.success) {
        setDepartments(result.data.departments);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      toast({
        title: 'Warning',
        description: 'Could not load departments',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FacultyFormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.departmentId) newErrors.departmentId = 'Department is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FacultyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/faculties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          instituteId,
          universityId,
          yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        toast({
          title: 'Success',
          description: 'Faculty member created successfully',
        });
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to create faculty member',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Faculty creation error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="rounded-full bg-green-100 p-3 mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Faculty Member Created!</h3>
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert>
        <AlertDescription>
          Creating faculty member for <strong>{instituteName}</strong>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter full name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="faculty@example.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Min. 8 characters"
            className={errors.password ? 'border-red-500' : ''}
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+91 1234567890"
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
        </div>

        {/* Job Title */}
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input
            id="jobTitle"
            value={formData.jobTitle}
            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
            placeholder="e.g., Professor, Assistant Professor"
          />
        </div>

        {/* Faculty Type */}
        <div className="space-y-2">
          <Label htmlFor="facultyType">Faculty Type *</Label>
          <Select
            value={formData.facultyType}
            onValueChange={(value) => handleInputChange('facultyType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select faculty type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FACULTY">Faculty</SelectItem>
              <SelectItem value="MENTOR">Mentor</SelectItem>
              <SelectItem value="MENTOR_SUPERVISOR">Mentor Supervisor</SelectItem>
              <SelectItem value="HOD">Head of Department</SelectItem>
              <SelectItem value="SENIOR">Senior</SelectItem>
              <SelectItem value="COUNSELOR">Counselor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label htmlFor="departmentId">Department *</Label>
          <Select
            value={formData.departmentId}
            onValueChange={(value) => handleInputChange('departmentId', value)}
            disabled={isLoadingDepartments}
          >
            <SelectTrigger className={errors.departmentId ? 'border-red-500' : ''}>
              <SelectValue placeholder={isLoadingDepartments ? 'Loading...' : 'Select department'} />
            </SelectTrigger>
            <SelectContent>
              {departments.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  No departments available
                </div>
              ) : (
                departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.departmentId && <p className="text-sm text-red-500">{errors.departmentId}</p>}
        </div>

        {/* Years of Experience */}
        <div className="space-y-2">
          <Label htmlFor="yearsOfExperience">Years of Experience</Label>
          <Input
            id="yearsOfExperience"
            type="number"
            min="0"
            max="50"
            value={formData.yearsOfExperience}
            onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Full address"
          className={errors.address ? 'border-red-500' : ''}
        />
        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Faculty'
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreateFacultyForm;
