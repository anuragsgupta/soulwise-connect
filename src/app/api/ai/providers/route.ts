/**
 * API endpoint to check available AI providers
 */

import { NextResponse } from 'next/server';
import { getAvailableProviders, getProviderConfig } from '@/lib/ai/provider-factory';

export async function GET() {
  try {
    const available = getAvailableProviders();
    const config = getProviderConfig();
    
    // Build response with provider info
    const providers = available.map(name => ({
      name,
      available: true,
      model: config[name]?.model,
    }));
    
    return NextResponse.json({
      success: true,
      available,
      providers,
      default: process.env.NEXT_PUBLIC_AI_PROVIDER || 'gemini',
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check providers',
        available: ['gemini'], // Fallback
      },
      { status: 500 }
    );
  }
}
