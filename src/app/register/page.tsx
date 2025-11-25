'use client';

import React from 'react';
import AdminRegistrationForm from '@/components/auth/AdminRegistrationForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mann Mitra</h1>
          <p className="text-muted-foreground mt-2">Admin Registration</p>
        </div>
        <AdminRegistrationForm />
      </div>
    </div>
  );
}
