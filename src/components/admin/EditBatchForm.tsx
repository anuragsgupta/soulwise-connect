'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, Check } from 'lucide-react';

interface Batch {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  totalSeats: number;
  currentStrength: number;
}

interface EditBatchFormProps {
  batch: Batch;
  onSuccess: () => void;
  onCancel: () => void;
}

interface BatchFormData {
  name: string;
  startYear: number;
  endYear: number;
  totalSeats: number;
  currentStrength: number;
}

interface BatchFormErrors {
  name?: string;
  startYear?: string;
  endYear?: string;
  totalSeats?: string;
  currentStrength?: string;
}

export default function EditBatchForm({ batch, onSuccess, onCancel }: EditBatchFormProps) {
  const [formData, setFormData] = useState<BatchFormData>({
    name: batch.name,
    startYear: batch.startYear,
    endYear: batch.endYear,
    totalSeats: batch.totalSeats,
    currentStrength: batch.currentStrength,
  });

  const [errors, setErrors] = useState<BatchFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: BatchFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Batch name is required';
    }

    if (formData.startYear < 2000 || formData.startYear > 2100) {
      newErrors.startYear = 'Start year must be between 2000 and 2100';
    }

    if (formData.endYear < 2000 || formData.endYear > 2100) {
      newErrors.endYear = 'End year must be between 2000 and 2100';
    }

    if (formData.endYear <= formData.startYear) {
      newErrors.endYear = 'End year must be after start year';
    }

    if (formData.totalSeats < 1) {
      newErrors.totalSeats = 'Total seats must be at least 1';
    }

    if (formData.currentStrength < 0) {
      newErrors.currentStrength = 'Current strength cannot be negative';
    }

    if (formData.currentStrength > formData.totalSeats) {
      newErrors.currentStrength = 'Current strength cannot exceed total seats';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof BatchFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field as keyof BatchFormErrors]) {
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
      const response = await fetch(`/api/batches/${batch.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update batch');
      }

      setIsSuccess(true);
      toast({
        title: 'Success!',
        description: 'Batch updated successfully',
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('Error updating batch:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update batch',
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
          <h3 className="text-lg font-semibold text-green-800">Batch Updated Successfully!</h3>
          <p className="text-sm text-green-600 mt-1">Changes have been saved.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Batch Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Batch Name *</Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g., 2023-2027"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Start Year */}
        <div className="space-y-2">
          <Label htmlFor="startYear">Start Year *</Label>
          <Input
            id="startYear"
            type="number"
            min="2000"
            max="2100"
            value={formData.startYear}
            onChange={(e) => handleInputChange('startYear', parseInt(e.target.value) || 2023)}
            className={errors.startYear ? 'border-red-500' : ''}
          />
          {errors.startYear && (
            <p className="text-sm text-red-500">{errors.startYear}</p>
          )}
        </div>

        {/* End Year */}
        <div className="space-y-2">
          <Label htmlFor="endYear">End Year *</Label>
          <Input
            id="endYear"
            type="number"
            min="2000"
            max="2100"
            value={formData.endYear}
            onChange={(e) => handleInputChange('endYear', parseInt(e.target.value) || 2027)}
            className={errors.endYear ? 'border-red-500' : ''}
          />
          {errors.endYear && (
            <p className="text-sm text-red-500">{errors.endYear}</p>
          )}
        </div>

        {/* Total Seats */}
        <div className="space-y-2">
          <Label htmlFor="totalSeats">Total Seats *</Label>
          <Input
            id="totalSeats"
            type="number"
            min="1"
            value={formData.totalSeats}
            onChange={(e) => handleInputChange('totalSeats', parseInt(e.target.value) || 60)}
            className={errors.totalSeats ? 'border-red-500' : ''}
          />
          {errors.totalSeats && (
            <p className="text-sm text-red-500">{errors.totalSeats}</p>
          )}
        </div>

        {/* Current Strength */}
        <div className="space-y-2">
          <Label htmlFor="currentStrength">Current Strength *</Label>
          <Input
            id="currentStrength"
            type="number"
            min="0"
            value={formData.currentStrength}
            onChange={(e) => handleInputChange('currentStrength', parseInt(e.target.value) || 0)}
            className={errors.currentStrength ? 'border-red-500' : ''}
          />
          {errors.currentStrength && (
            <p className="text-sm text-red-500">{errors.currentStrength}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Current number of students in this batch
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
              <Calendar className="mr-2 h-4 w-4" />
              Update Batch
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
