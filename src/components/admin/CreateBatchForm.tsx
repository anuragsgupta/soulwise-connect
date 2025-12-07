'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, Calendar } from 'lucide-react';

interface CreateBatchFormProps {
  instituteId: string;
  instituteName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface BatchFormData {
  name: string;
  startYear: string;
  endYear: string;
  currentSemester: string;
  departmentId: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

const CreateBatchForm: React.FC<CreateBatchFormProps> = ({
  instituteId,
  instituteName,
  onSuccess,
  onCancel
}) => {
  const currentYear = new Date().getFullYear();
  
  const [formData, setFormData] = useState<BatchFormData>({
    name: '',
    startYear: currentYear.toString(),
    endYear: (currentYear + 4).toString(),
    currentSemester: '1',
    departmentId: '',
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BatchFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDepartments();
  }, [instituteId]);

  useEffect(() => {
    // Auto-generate batch name when years are selected
    if (formData.startYear && formData.endYear) {
      const name = `${formData.startYear}-${formData.endYear}`;
      setFormData(prev => ({ ...prev, name }));
    }
  }, [formData.startYear, formData.endYear]);

  const loadDepartments = async () => {
    try {
      setIsLoadingDepartments(true);
      const response = await fetch(`/api/departments?instituteId=${instituteId}`, {
        credentials: 'include', // Use cookies for auth
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

  const calculateCurrentSemester = (startYear: number): number => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 0-indexed, so add 1
    
    // Calculate years passed since start
    const yearsPassed = currentYear - startYear;
    
    // Determine semester based on month (assuming: Jan-Jun = odd semester, Jul-Dec = even semester)
    // Adjust this logic based on your institution's academic calendar
    const semesterInCurrentYear = currentMonth >= 7 ? 1 : 2; // July onwards is semester 1 (odd), before July is semester 2 (even)
    
    // Calculate total semester: (yearsPassed * 2) + current semester offset
    let semester = (yearsPassed * 2) + semesterInCurrentYear;
    
    // Ensure semester is within valid range (1-8)
    if (semester < 1) semester = 1;
    if (semester > 8) semester = 8;
    
    return semester;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BatchFormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = 'Batch name is required';
    if (!formData.startYear) newErrors.startYear = 'Start year is required';
    if (!formData.endYear) newErrors.endYear = 'End year is required';
    if (!formData.currentSemester) newErrors.currentSemester = 'Current semester is required';
    if (!formData.departmentId) newErrors.departmentId = 'Department is required';

    const startYearNum = parseInt(formData.startYear);
    const endYearNum = parseInt(formData.endYear);
    const semesterNum = parseInt(formData.currentSemester);

    if (isNaN(startYearNum) || startYearNum < 2000 || startYearNum > 2100) {
      newErrors.startYear = 'Invalid start year';
    }
    if (isNaN(endYearNum) || endYearNum < 2000 || endYearNum > 2100) {
      newErrors.endYear = 'Invalid end year';
    }
    if (startYearNum >= endYearNum) {
      newErrors.endYear = 'End year must be after start year';
    }
    if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
      newErrors.currentSemester = 'Semester must be between 1 and 8';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof BatchFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
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
      // Calculate current semester based on start year
      const calculatedSemester = calculateCurrentSemester(parseInt(formData.startYear));
      
      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Use cookies for auth
        body: JSON.stringify({
          name: formData.name,
          startYear: parseInt(formData.startYear),
          endYear: parseInt(formData.endYear),
          currentSemester: parseInt(formData.currentSemester),
          departmentId: formData.departmentId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create batch');
      }

      setIsSuccess(true);
      toast({
        title: 'Success!',
        description: 'Batch created successfully',
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('Error creating batch:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create batch',
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
          <h3 className="text-lg font-semibold text-green-800">Batch Created Successfully!</h3>
          <p className="text-sm text-green-600 mt-1">Closing...</p>
        </div>
      </div>
    );
  }

  const yearOptions = Array.from({ length: 21 }, (_, i) => currentYear - 5 + i);
  const semesterOptions = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert>
        <AlertDescription>
          Creating batch for <strong>{instituteName}</strong>
        </AlertDescription>
      </Alert>

      <Alert>
        <AlertDescription>
          ℹ️ Current semester will be automatically calculated based on the start year and current date.
        </AlertDescription>
      </Alert>

      {/* Department Selection */}
      <div className="space-y-2">
        <Label htmlFor="departmentId">
          Department <span className="text-red-500">*</span>
        </Label>
        {isLoadingDepartments ? (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading departments...</span>
          </div>
        ) : (
          <Select
            value={formData.departmentId}
            onValueChange={(value) => handleInputChange('departmentId', value)}
          >
            <SelectTrigger id="departmentId" className={errors.departmentId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.departmentId && (
          <p className="text-sm text-red-500">{errors.departmentId}</p>
        )}
      </div>

      {/* Start Year */}
      <div className="space-y-2">
        <Label htmlFor="startYear">
          Start Year <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.startYear}
          onValueChange={(value) => handleInputChange('startYear', value)}
        >
          <SelectTrigger id="startYear" className={errors.startYear ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select start year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.startYear && (
          <p className="text-sm text-red-500">{errors.startYear}</p>
        )}
      </div>

      {/* End Year */}
      <div className="space-y-2">
        <Label htmlFor="endYear">
          End Year <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.endYear}
          onValueChange={(value) => handleInputChange('endYear', value)}
        >
          <SelectTrigger id="endYear" className={errors.endYear ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select end year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.endYear && (
          <p className="text-sm text-red-500">{errors.endYear}</p>
        )}
      </div>

      {/* Batch Name (Auto-generated, editable) */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Batch Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="e.g., 2024-2028"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
        )}
        <p className="text-xs text-muted-foreground">Auto-generated from years, can be edited</p>
      </div>

      {/* Current Semester */}
      <div className="space-y-2">
        <Label htmlFor="currentSemester">
          Current Semester <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.currentSemester}
          onValueChange={(value) => handleInputChange('currentSemester', value)}
        >
          <SelectTrigger id="currentSemester" className={errors.currentSemester ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select current semester" />
          </SelectTrigger>
          <SelectContent>
            {semesterOptions.map((sem) => (
              <SelectItem key={sem} value={sem.toString()}>
                Semester {sem}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.currentSemester && (
          <p className="text-sm text-red-500">{errors.currentSemester}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Batch...
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Create Batch
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default CreateBatchForm;
