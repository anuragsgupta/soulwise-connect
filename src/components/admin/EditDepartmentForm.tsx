'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, Check } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  code: string;
}

interface EditDepartmentFormProps {
  department: Department;
  onSuccess: () => void;
  onCancel: () => void;
}

interface DepartmentFormData {
  name: string;
  code: string;
}

interface DepartmentFormErrors {
  name?: string;
  code?: string;
}

export default function EditDepartmentForm({ department, onSuccess, onCancel }: EditDepartmentFormProps) {
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: department.name,
    code: department.code,
  });

  const [errors, setErrors] = useState<DepartmentFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: DepartmentFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Department code is required';
    } else if (!/^[A-Z0-9]{2,10}$/.test(formData.code)) {
      newErrors.code = 'Code must be 2-10 uppercase letters/numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof DepartmentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'code' ? value.toUpperCase() : value
    }));

    if (errors[field as keyof DepartmentFormErrors]) {
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
      const response = await fetch(`/api/departments/${department.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update department');
      }

      setIsSuccess(true);
      toast({
        title: 'Success!',
        description: 'Department updated successfully',
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('Error updating department:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update department',
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
          <h3 className="text-lg font-semibold text-green-800">Department Updated Successfully!</h3>
          <p className="text-sm text-green-600 mt-1">Changes have been saved.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Department Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Department Name *</Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g., Computer Science & Engineering"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Department Code */}
        <div className="space-y-2">
          <Label htmlFor="code">Department Code *</Label>
          <Input
            id="code"
            type="text"
            placeholder="e.g., CSE"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            className={errors.code ? 'border-red-500' : ''}
            maxLength={10}
          />
          {errors.code && (
            <p className="text-sm text-red-500">{errors.code}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Use 2-10 uppercase letters/numbers (e.g., CSE, ECE, MECH)
          </p>
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
              <Building2 className="mr-2 h-4 w-4" />
              Update Department
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
