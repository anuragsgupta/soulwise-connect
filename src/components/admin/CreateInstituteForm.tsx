'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, Check, RefreshCw, AlertCircle } from 'lucide-react';

interface CreateInstituteFormProps {
  universityId: string;
  universityName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface InstituteFormData {
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  fieldId: string;
  aisheCode?: string;
}

interface Field {
  id: string;
  name: string;
  description?: string;
}

const CreateInstituteForm: React.FC<CreateInstituteFormProps> = ({
  universityId,
  universityName,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<InstituteFormData>({
    code: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    fieldId: '',
  });

  const [fields, setFields] = useState<Field[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof InstituteFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(true);
  const [isFetchingAISHE, setIsFetchingAISHE] = useState(false);
  const [aisheError, setAisheError] = useState<string | null>(null);
  const [aisheSuccess, setAisheSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      const response = await fetch('/api/fields');
      const result = await response.json();
      
      if (result.success) {
        setFields(result.data.fields);
      }
    } catch (error) {
      console.error('Error loading fields:', error);
      toast({
        title: 'Warning',
        description: 'Could not load fields. Using default options.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingFields(false);
    }
  };

  const handleFetchAISHE = async () => {
    if (!formData.aisheCode?.trim()) {
      toast({
        title: 'AISHE Code Required',
        description: 'Please enter an AISHE code to fetch data',
        variant: 'destructive',
      });
      return;
    }

    // Validate AISHE code format for Institute (must start with C-)
    const code = formData.aisheCode.trim().toUpperCase();
    if (!code.startsWith('C-')) {
      toast({
        title: 'Invalid AISHE Code',
        description: 'College/Institute AISHE codes must start with "C-" (e.g., C-36022). University codes start with "U-".',
        variant: 'destructive',
      });
      return;
    }

    setIsFetchingAISHE(true);
    setAisheError(null);
    setAisheSuccess(false);

    try {
      const response = await fetch(`/api/institutes/fetch-aishe?code=${encodeURIComponent(code)}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch AISHE data');
      }

      // Auto-fill form with AISHE data
      setFormData(prev => ({
        ...prev,
        code: code, // Use AISHE code as institute code
        name: result.data.name || prev.name,
        email: result.data.email || prev.email,
        phone: result.data.phone || prev.phone,
        address: result.data.address || prev.address,
      }));

      setAisheSuccess(true);
      toast({
        title: 'Success!',
        description: 'Institute details fetched and auto-filled from AISHE database',
      });

      // Clear success message after 3 seconds
      setTimeout(() => setAisheSuccess(false), 3000);
    } catch (error) {
      console.error('Error fetching AISHE data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch AISHE data';
      setAisheError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsFetchingAISHE(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof InstituteFormData, string>> = {};

    if (!formData.code.trim()) newErrors.code = 'Institute code is required';
    if (!formData.name.trim()) newErrors.name = 'Institute name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.fieldId) newErrors.fieldId = 'Field is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof InstituteFormData, value: string) => {
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
      const token = localStorage.getItem('auth-token');
      
      const response = await fetch('/api/institutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          universityId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create institute');
      }

      setIsSuccess(true);
      toast({
        title: 'Success!',
        description: 'Institute created successfully',
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('Error creating institute:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create institute',
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
          <h3 className="text-lg font-semibold text-green-800">Institute Created Successfully!</h3>
          <p className="text-sm text-green-600 mt-1">Closing...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert>
        <AlertDescription>
          Creating institute for <strong>{universityName}</strong>
        </AlertDescription>
      </Alert>

      {/* AISHE Code with Auto-fetch */}
      <div className="space-y-2">
        <Label htmlFor="aisheCode">AISHE Code (Optional - Auto-fill)</Label>
        <div className="flex gap-2">
          <Input
            id="aisheCode"
            type="text"
            placeholder="e.g., C-36022"
            value={formData.aisheCode || ''}
            onChange={(e) => handleInputChange('aisheCode', e.target.value.toUpperCase())}
            disabled={isFetchingAISHE}
          />
          <Button
            type="button"
            onClick={handleFetchAISHE}
            disabled={isFetchingAISHE || !formData.aisheCode?.trim()}
            variant="outline"
          >
            {isFetchingAISHE ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
        {aisheSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Institute details fetched successfully from AISHE database!
            </AlertDescription>
          </Alert>
        )}
        {aisheError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{aisheError}</AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">
          Enter AISHE code (starts with C-) to auto-fill institute details. Leave blank to enter manually.
        </p>
      </div>

      {/* Institute Code */}
      <div className="space-y-2">
        <Label htmlFor="code">Institute Code *</Label>
        <Input
          id="code"
          type="text"
          placeholder="e.g., ENGCOL001 or C-36022"
          value={formData.code}
          onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
          className={errors.code ? 'border-red-500' : ''}
        />
        {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
        <p className="text-xs text-muted-foreground">
          Unique code for the institute (auto-filled from AISHE if fetched)
        </p>
      </div>

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
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Field */}
      <div className="space-y-2">
        <Label htmlFor="fieldId">Field *</Label>
        <Select
          value={formData.fieldId}
          onValueChange={(value) => handleInputChange('fieldId', value)}
          disabled={isLoadingFields}
        >
          <SelectTrigger className={errors.fieldId ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {fields.map((field) => (
              <SelectItem key={field.id} value={field.id}>
                {field.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.fieldId && <p className="text-sm text-red-500">{errors.fieldId}</p>}
        <p className="text-xs text-muted-foreground">Academic field (Engineering, Medical, Arts, etc.)</p>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="e.g., engineering@university.edu"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
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
              Creating Institute...
            </>
          ) : (
            <>
              <Building2 className="mr-2 h-4 w-4" />
              Create Institute
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreateInstituteForm;
