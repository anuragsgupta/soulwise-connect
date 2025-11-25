'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminRegistrationFormProps {
  onSuccess?: () => void;
}

interface University {
  id: string;
  name: string;
  domain: string;
}

interface Institute {
  id: string;
  name: string;
  code: string;
}

export default function AdminRegistrationForm({ onSuccess }: AdminRegistrationFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    universityId: '',
    instituteId: '',
  });
  const [universities, setUniversities] = useState<University[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Load universities if role requires it
  useEffect(() => {
    if (formData.role === 'UNIVERSITY_ADMIN' || formData.role === 'INSTITUTE_ADMIN' || formData.role === 'FACULTY') {
      loadUniversities();
    }
  }, [formData.role]);

  // Load institutes when university is selected
  useEffect(() => {
    if (formData.universityId && (formData.role === 'INSTITUTE_ADMIN' || formData.role === 'FACULTY')) {
      loadInstitutes(formData.universityId);
    }
  }, [formData.universityId, formData.role]);

  const loadUniversities = async () => {
    try {
      const response = await fetch('/api/universities');
      const result = await response.json();
      if (result.success) {
        setUniversities(result.data.universities);
      }
    } catch (error) {
      console.error('Failed to load universities:', error);
    }
  };

  const loadInstitutes = async (universityId: string) => {
    try {
      const response = await fetch(`/api/institutes?universityId=${universityId}`);
      const result = await response.json();
      if (result.success) {
        setInstitutes(result.data.institutes);
      }
    } catch (error) {
      console.error('Failed to load institutes:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = (): string | null => {
    if (!formData.email || !formData.password || !formData.role) {
      return 'Please fill in all required fields';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    if (formData.role === 'UNIVERSITY_ADMIN' && !formData.universityId) {
      return 'Please select a university';
    }

    if ((formData.role === 'INSTITUTE_ADMIN' || formData.role === 'FACULTY') && (!formData.universityId || !formData.instituteId)) {
      return 'Please select both university and institute';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          universityId: formData.universityId || null,
          instituteId: formData.instituteId || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        toast({
          title: 'Registration Successful',
          description: 'Admin account created successfully. You can now login.',
        });
        
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push('/login');
          }
        }, 2000);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold">Registration Successful!</h3>
            <p className="text-muted-foreground">Redirecting to login page...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Admin Registration</CardTitle>
        <CardDescription>Create a new admin account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password (min 8 characters)"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="UNIVERSITY_ADMIN">University Admin</SelectItem>
                <SelectItem value="INSTITUTE_ADMIN">Institute Admin</SelectItem>
                <SelectItem value="FACULTY">Faculty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.role === 'UNIVERSITY_ADMIN' || formData.role === 'INSTITUTE_ADMIN' || formData.role === 'FACULTY') && (
            <div className="space-y-2">
              <Label htmlFor="university">University *</Label>
              <Select value={formData.universityId} onValueChange={(value) => handleChange('universityId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((uni) => (
                    <SelectItem key={uni.id} value={uni.id}>
                      {uni.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(formData.role === 'INSTITUTE_ADMIN' || formData.role === 'FACULTY') && formData.universityId && (
            <div className="space-y-2">
              <Label htmlFor="institute">Institute *</Label>
              <Select value={formData.instituteId} onValueChange={(value) => handleChange('instituteId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select institute" />
                </SelectTrigger>
                <SelectContent>
                  {institutes.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.name} ({inst.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Register'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.push('/login')}
          >
            Back to Login
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
