'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check } from 'lucide-react';

interface CreateDepartmentFormProps {
  instituteId: string;
  instituteName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface DepartmentFormData {
  name: string;
  code: string;
}

const CreateDepartmentForm: React.FC<CreateDepartmentFormProps> = ({
  instituteId,
  instituteName,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    code: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DepartmentFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DepartmentFormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = 'Department name is required';
    if (!formData.code.trim()) {
      newErrors.code = 'Department code is required';
    } else if (!/^[A-Z0-9]{2,10}$/.test(formData.code)) {
      newErrors.code = 'Code must be 2-10 uppercase letters/numbers (e.g., CS, ECE)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof DepartmentFormData, value: string) => {
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
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Use cookies for auth
        body: JSON.stringify({
          ...formData,
          instituteId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        toast({
          title: 'Success',
          description: 'Department created successfully',
        });
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to create department',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Department creation error:', error);
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
        <h3 className="text-lg font-semibold mb-2">Department Created!</h3>
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert>
        <AlertDescription>
          Creating department for <strong>{instituteName}</strong>
        </AlertDescription>
      </Alert>

      {/* Department Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Department Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="e.g., Computer Science, Electronics"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Department Code */}
      <div className="space-y-2">
        <Label htmlFor="code">Department Code *</Label>
        <Input
          id="code"
          value={formData.code}
          onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
          placeholder="e.g., CS, ECE, ME"
          className={errors.code ? 'border-red-500' : ''}
          maxLength={10}
        />
        {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
        <p className="text-xs text-muted-foreground">
          Use uppercase letters and numbers only (e.g., CS, ECE, ME)
        </p>
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
            'Create Department'
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreateDepartmentForm;
