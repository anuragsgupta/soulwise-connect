'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Check } from 'lucide-react';

interface CreateAdminFormProps {
  universityId: string;
  universityName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface AdminFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  adminType: 'UNIVERSITY_ADMIN' | 'INSTITUTE_ADMIN';
  instituteId?: string;
}

interface Institute {
  id: string;
  name: string;
  code: string;
}

const CreateAdminForm: React.FC<CreateAdminFormProps> = ({
  universityId,
  universityName,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<AdminFormData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    adminType: 'UNIVERSITY_ADMIN',
  });

  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [isLoadingInstitutes, setIsLoadingInstitutes] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof AdminFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (formData.adminType === 'INSTITUTE_ADMIN') {
      loadInstitutes();
    }
  }, [formData.adminType, universityId]);

  const loadInstitutes = async () => {
    try {
      setIsLoadingInstitutes(true);
      const response = await fetch(`/api/institutes?universityId=${universityId}`);
      const result = await response.json();
      
      if (result.success) {
        setInstitutes(result.data.institutes);
      }
    } catch (error) {
      console.error('Error loading institutes:', error);
      toast({
        title: 'Warning',
        description: 'Could not load institutes',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingInstitutes(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AdminFormData, string>> = {};

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
    if (formData.adminType === 'INSTITUTE_ADMIN' && !formData.instituteId) {
      newErrors.instituteId = 'Institute is required for Institute Admin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof AdminFormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Reset instituteId when switching to UNIVERSITY_ADMIN
      if (field === 'adminType' && value === 'UNIVERSITY_ADMIN') {
        updated.instituteId = undefined;
      }
      return updated;
    });
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
      // Don't send Authorization header - use cookies instead
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies automatically
        body: JSON.stringify({
          ...formData,
          universityId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create admin');
      }

      setIsSuccess(true);
      toast({
        title: 'Success!',
        description: `${formData.adminType === 'UNIVERSITY_ADMIN' ? 'University' : 'Institute'} admin created successfully`,
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('Error creating admin:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create admin',
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
          <h3 className="text-lg font-semibold text-green-800">Admin Created Successfully!</h3>
          <p className="text-sm text-green-600 mt-1">Closing...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert>
        <AlertDescription>
          Creating admin for <strong>{universityName}</strong>
        </AlertDescription>
      </Alert>

      {/* Admin Type */}
      <div className="space-y-2">
        <Label htmlFor="adminType">Admin Type *</Label>
        <Select
          value={formData.adminType}
          onValueChange={(value) => handleInputChange('adminType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select admin type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UNIVERSITY_ADMIN">University Admin</SelectItem>
            <SelectItem value="INSTITUTE_ADMIN">Institute Admin</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          University admins can manage all institutes. Institute admins manage specific institutes.
        </p>
      </div>

      {/* Institute Selection (only for INSTITUTE_ADMIN) */}
      {formData.adminType === 'INSTITUTE_ADMIN' && (
        <div className="space-y-2">
          <Label htmlFor="instituteId">Institute *</Label>
          <Select
            value={formData.instituteId || ''}
            onValueChange={(value) => handleInputChange('instituteId', value)}
            disabled={isLoadingInstitutes}
          >
            <SelectTrigger className={errors.instituteId ? 'border-red-500' : ''}>
              <SelectValue placeholder={isLoadingInstitutes ? 'Loading institutes...' : 'Select institute'} />
            </SelectTrigger>
            <SelectContent>
              {institutes.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  No institutes available
                </div>
              ) : (
                institutes.map((institute) => (
                  <SelectItem key={institute.id} value={institute.id}>
                    {institute.name} ({institute.code})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.instituteId && <p className="text-sm text-red-500">{errors.instituteId}</p>}
          <p className="text-xs text-muted-foreground">
            Select the institute this admin will manage
          </p>
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          type="text"
          placeholder="e.g., John Doe"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
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
          placeholder="e.g., admin@university.edu"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
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
          placeholder="Minimum 8 characters"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          className={errors.password ? 'border-red-500' : ''}
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="e.g., +91-9876543210"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className={errors.phone ? 'border-red-500' : ''}
        />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Input
          id="address"
          type="text"
          placeholder="Full address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          className={errors.address ? 'border-red-500' : ''}
        />
        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
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
              Creating Admin...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Admin
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreateAdminForm;
