import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'AISHE code is required' },
        { status: 400 }
      );
    }

    // Validate AISHE code format (must start with C for College/Institute)
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode.startsWith('C-')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid AISHE code for Institute. College/Institute AISHE codes must start with "C-" (e.g., C-36022). University codes start with "U-".' 
        },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching AISHE data for code:', trimmedCode);

    // Fetch from SIH AISHE database
    const response = await fetch(`https://www.sih.gov.in/searchcollegename?id=${trimmedCode}`, {
      headers: {
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`SIH API returned ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ AISHE data fetched successfully:', data.NAME);

    // Transform the data to match our format
    const instituteData = {
      name: data.NAME?.trim() || '',
      state: data.STATE?.trim() || '',
      district: data.DISTRICT?.trim() || '',
      city: data.CITY?.trim() || '',
      email: data.EMAIL?.trim() || '',
      phone: data.PHONE?.trim() || '',
      address: data.NAME?.trim() || '', // Full name often includes address
      contactFirstName: data.FIRST_NAME?.trim() || '',
      contactLastName: data.LAST_NAME?.trim() || '',
    };

    return NextResponse.json({
      success: true,
      data: instituteData,
      message: 'AISHE data fetched successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching AISHE data:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch AISHE data. Please check the code and try again.' 
      },
      { status: 500 }
    );
  }
}
