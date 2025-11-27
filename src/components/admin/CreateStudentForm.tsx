'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check } from 'lucide-react';

interface CreateStudentFormProps {
  instituteId: string;
  universityId: string;
  instituteName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface StudentFormData {
  name: string;
  email: string;
  password: string;
  enrollmentId: string;
  rollNumber: string;
  phone: string;
  parentPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  departmentId: string;
  batchId: string;
  currentSemester: string;
  admissionYear: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Batch {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
}

const CreateStudentForm: React.FC<CreateStudentFormProps> = ({
  instituteId,
  universityId,
  instituteName,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    email: '',
    password: '',
    enrollmentId: '',
    rollNumber: '',
    phone: '',
    parentPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    departmentId: '',
    batchId: '',
    currentSemester: '1',
    admissionYear: new Date().getFullYear().toString(),
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDepartments();
  }, [instituteId]);

  useEffect(() => {
    if (formData.departmentId) {
      loadBatches(formData.departmentId);
    }
  }, [formData.departmentId]);

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
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const loadBatches = async (departmentId: string) => {
    try {
      setIsLoadingBatches(true);
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/batches?departmentId=${departmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      
      if (result.success) {
        setBatches(result.data.batches);
      }
    } catch (error) {
      console.error('Error loading batches:', error);
    } finally {
      setIsLoadingBatches(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof StudentFormData, string>> = {};

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
    if (!formData.enrollmentId.trim()) newErrors.enrollmentId = 'Enrollment ID is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.departmentId) newErrors.departmentId = 'Department is required';
    if (!formData.batchId) newErrors.batchId = 'Batch is required';
    if (!formData.currentSemester) newErrors.currentSemester = 'Current semester is required';
    if (!formData.admissionYear) newErrors.admissionYear = 'Admission year is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
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
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          instituteId,
          universityId,
          currentSemester: parseInt(formData.currentSemester),
          admissionYear: parseInt(formData.admissionYear),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        toast({
          title: 'Success',
          description: 'Student created successfully',
        });
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to create student',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Student creation error:', error);
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
        <h3 className="text-lg font-semibold mb-2">Student Created!</h3>
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert>
        <AlertDescription>
          Creating student for <strong>{instituteName}</strong>
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
            placeholder="student@example.com"
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

        {/* Enrollment ID */}
        <div className="space-y-2">
          <Label htmlFor="enrollmentId">Enrollment ID *</Label>
          <Input
            id="enrollmentId"
            value={formData.enrollmentId}
            onChange={(e) => handleInputChange('enrollmentId', e.target.value)}
            placeholder="e.g., 2024CS001"
            className={errors.enrollmentId ? 'border-red-500' : ''}
          />
          {errors.enrollmentId && <p className="text-sm text-red-500">{errors.enrollmentId}</p>}
        </div>

        {/* Roll Number */}
        <div className="space-y-2">
          <Label htmlFor="rollNumber">Roll Number</Label>
          <Input
            id="rollNumber"
            value={formData.rollNumber}
            onChange={(e) => handleInputChange('rollNumber', e.target.value)}
            placeholder="e.g., CS001"
          />
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

        {/* Parent Phone */}
        <div className="space-y-2">
          <Label htmlFor="parentPhone">Parent Phone</Label>
          <Input
            id="parentPhone"
            value={formData.parentPhone}
            onChange={(e) => handleInputChange('parentPhone', e.target.value)}
            placeholder="+91 1234567890"
          />
        </div>

        {/* Emergency Contact Name */}
        <div className="space-y-2">
          <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
          <Input
            id="emergencyContactName"
            value={formData.emergencyContactName}
            onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
            placeholder="Contact person name"
          />
        </div>

        {/* Emergency Contact Phone */}
        <div className="space-y-2">
          <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
          <Input
            id="emergencyContactPhone"
            value={formData.emergencyContactPhone}
            onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
            placeholder="+91 1234567890"
          />
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

        {/* Batch */}
        <div className="space-y-2">
          <Label htmlFor="batchId">Batch *</Label>
          <Select
            value={formData.batchId}
            onValueChange={(value) => handleInputChange('batchId', value)}
            disabled={!formData.departmentId || isLoadingBatches}
          >
            <SelectTrigger className={errors.batchId ? 'border-red-500' : ''}>
              <SelectValue placeholder={
                !formData.departmentId ? 'Select department first' :
                isLoadingBatches ? 'Loading...' : 'Select batch'
              } />
            </SelectTrigger>
            <SelectContent>
              {batches.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  No batches available
                </div>
              ) : (
                batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name} ({batch.startYear}-{batch.endYear})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.batchId && <p className="text-sm text-red-500">{errors.batchId}</p>}
        </div>

        {/* Current Semester */}
        <div className="space-y-2">
          <Label htmlFor="currentSemester">Current Semester *</Label>
          <Select
            value={formData.currentSemester}
            onValueChange={(value) => handleInputChange('currentSemester', value)}
          >
            <SelectTrigger className={errors.currentSemester ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <SelectItem key={sem} value={sem.toString()}>
                  Semester {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.currentSemester && <p className="text-sm text-red-500">{errors.currentSemester}</p>}
        </div>

        {/* Admission Year */}
        <div className="space-y-2">
          <Label htmlFor="admissionYear">Admission Year *</Label>
          <Input
            id="admissionYear"
            type="number"
            min="2000"
            max="2030"
            value={formData.admissionYear}
            onChange={(e) => handleInputChange('admissionYear', e.target.value)}
            className={errors.admissionYear ? 'border-red-500' : ''}
          />
          {errors.admissionYear && <p className="text-sm text-red-500">{errors.admissionYear}</p>}
        </div>
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
            'Create Student'
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreateStudentForm;

