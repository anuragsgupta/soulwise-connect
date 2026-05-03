import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to fetch university/institute details from SIH AISHE database
 * Uses the AISHE code (e.g., "C-36022") to retrieve official data
 */

interface AISHEResponse {
  NAME: string;
  STATE: string;
  DISTRICT: string;
  CITY: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  PHONE: string;
  EMAIL: string;
  ID: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const aisheCode = searchParams.get('code');

    if (!aisheCode) {
      return NextResponse.json(
        { success: false, message: 'AISHE code is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching AISHE data for code:', aisheCode);

    // Fetch data from SIH AISHE database
    const response = await fetch(
      `https://www.sih.gov.in/searchcollegename?id=${aisheCode}`,
      {
        headers: {
          'Accept': '*/*',
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          'X-Requested-With': 'XMLHttpRequest',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch from AISHE database: ${response.status}`);
    }

    const data: AISHEResponse = await response.json();

    if (!data || !data.NAME) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No data found for this AISHE code. Please verify the code and try again.' 
        },
        { status: 404 }
      );
    }

    console.log('✅ AISHE data fetched successfully:', data.NAME);

    // Transform AISHE data to our university format
    const universityData = {
      aisheCode: aisheCode,
      name: data.NAME.trim(),
      email: data.EMAIL || '',
      phone: data.PHONE || '',
      state: data.STATE || '',
      district: data.DISTRICT || '',
      city: data.CITY || '',
      address: data.NAME.includes(',') 
        ? data.NAME.split(',').slice(1).join(',').trim() 
        : '',
      contactFirstName: data.FIRST_NAME || '',
      contactLastName: data.LAST_NAME || '',
      // Generate domain suggestion from name
      domain: data.EMAIL 
        ? data.EMAIL.split('@')[1] 
        : generateDomainFromName(data.NAME),
    };

    return NextResponse.json({
      success: true,
      data: universityData,
      message: 'University data fetched successfully from AISHE database'
    });

  } catch (error) {
    console.error('❌ Error fetching AISHE data:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch AISHE data',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Generate a domain suggestion from university name
 * Example: "Delhi University" -> "du.ac.in"
 */
function generateDomainFromName(name: string): string {
  // Extract abbreviation from name
  const words = name.split(/[\s,]+/).filter(w => 
    w.length > 2 && 
    !['of', 'and', 'the', 'for'].includes(w.toLowerCase())
  );
  
  // Take first letters of first 2-3 significant words
  const abbr = words
    .slice(0, Math.min(3, words.length))
    .map(w => w[0].toLowerCase())
    .join('');
  
  return `${abbr}.ac.in`;
}
