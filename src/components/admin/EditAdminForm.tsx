'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCog, Check } from 'lucide-react';

interface Admin {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  adminType: string;
  isSuperAdmin: boolean;
}

interface EditAdminFormProps {
  admin: Admin;
  onSuccess: () => void;
  onCancel: () => void;
}

interface AdminFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
}

interface AdminFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export default function EditAdminForm({ admin, onSuccess, onCancel }: EditAdminFormProps) {
  const [formData, setFormData] = useState<AdminFormData>({
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
    address: admin.address,
    status: admin.status,
  });

  const [errors, setErrors] = useState<AdminFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: AdminFormErrors = {};

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

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof AdminFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field as keyof AdminFormErrors]) {
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
      const response = await fetch(`/api/admins/${admin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update admin');
      }

      setIsSuccess(true);
      toast({
        title: 'Success!',
        description: 'Admin updated successfully',
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('Error updating admin:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update admin',
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
          <h3 className="text-lg font-semibold text-green-800">Admin Updated Successfully!</h3>
          <p className="text-sm text-green-600 mt-1">Changes have been saved.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Admin Type Info (Read-only) */}
        <div className="p-3 bg-muted rounded-lg">
          <Label className="text-sm font-medium">Admin Type</Label>
          <p className="text-sm text-muted-foreground mt-1">
            {admin.isSuperAdmin ? 'Super Admin' : 
             admin.adminType === 'UNIVERSITY_ADMIN' ? 'University Admin' : 
             'Institute Admin'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Admin type cannot be changed after creation
          </p>
        </div>

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
            placeholder="e.g., admin@university.edu"
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

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Textarea
            id="address"
            placeholder="Full address"
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
          <p className="text-xs text-muted-foreground">
            Inactive admins cannot log in to the system
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
              <UserCog className="mr-2 h-4 w-4" />
              Update Admin
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
