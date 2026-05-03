'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, Check } from 'lucide-react';

interface Field {
  id: string;
  name: string;
}

interface Institute {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  fieldId: string;
  status: string;
}

interface EditInstituteFormProps {
  institute: Institute;
  onSuccess: () => void;
  onCancel: () => void;
}

interface InstituteFormData {
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  fieldId: string;
  status: string;
}

interface InstituteFormErrors {
  name?: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  fieldId?: string;
}

export default function EditInstituteForm({ institute, onSuccess, onCancel }: EditInstituteFormProps) {
  const [formData, setFormData] = useState<InstituteFormData>({
    name: institute.name,
    code: institute.code,
    email: institute.email,
    phone: institute.phone,
    address: institute.address,
    fieldId: institute.fieldId,
    status: institute.status,
  });

  const [fields, setFields] = useState<Field[]>([]);
  const [errors, setErrors] = useState<InstituteFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      setIsLoadingFields(true);
      const response = await fetch('/api/fields');
      const result = await response.json();
      
      if (result.success) {
        setFields(result.data.fields);
      }
    } catch (error) {
      console.error('Failed to load fields:', error);
      toast({
        title: 'Error',
        description: 'Failed to load academic fields',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingFields(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: InstituteFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Institute name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Institute code is required';
    } else if (formData.code.trim().length < 2) {
      newErrors.code = 'Institute code must be at least 2 characters';
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

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.fieldId) {
      newErrors.fieldId = 'Academic field is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof InstituteFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field as keyof InstituteFormErrors]) {
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
      const response = await fetch(`/api/institutes/${institute.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update institute');
      }

      setIsSuccess(true);
      toast({
        title: 'Success!',
        description: 'Institute updated successfully',
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('Error updating institute:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update institute',
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
          <h3 className="text-lg font-semibold text-green-800">Institute Updated Successfully!</h3>
          <p className="text-sm text-green-600 mt-1">Changes have been saved.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Institute Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Institute Name *</Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g., College of Engineering"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Institute Code */}
        <div className="space-y-2">
          <Label htmlFor="code">Institute Code *</Label>
          <Input
            id="code"
            type="text"
            placeholder="e.g., COE"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
            className={errors.code ? 'border-red-500' : ''}
            maxLength={10}
          />
          {errors.code && (
            <p className="text-sm text-red-500">{errors.code}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Unique identifier for this institute (e.g., COE, CBA)
          </p>
        </div>

        {/* Academic Field */}
        <div className="space-y-2">
          <Label htmlFor="fieldId">Academic Field *</Label>
          <Select
            value={formData.fieldId}
            onValueChange={(value) => handleInputChange('fieldId', value)}
            disabled={isLoadingFields}
          >
            <SelectTrigger className={errors.fieldId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select academic field" />
            </SelectTrigger>
            <SelectContent>
              {fields.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.fieldId && (
            <p className="text-sm text-red-500">{errors.fieldId}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Institute Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="e.g., engineering@university.edu"
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
            placeholder="e.g., +1 (510) 642-5771"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Textarea
            id="address"
            placeholder="Full address of the institute"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className={errors.address ? 'border-red-500' : ''}
            rows={3}
          />
          {errors.address && (
            <p className="text-sm text-red-500">{errors.address}</p>
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
              <Building2 className="mr-2 h-4 w-4" />
              Update Institute
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
