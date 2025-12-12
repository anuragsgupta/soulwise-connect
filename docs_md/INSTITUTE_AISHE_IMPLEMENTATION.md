# Institute AISHE Auto-Fetch Implementation

## ✅ Completed Features

### Database Changes
- Added `aisheCode` field to `Institute` model in Prisma schema
- Applied migration: `20251130204951_add_aishe_code_to_institute`
- Field is optional and unique (prevents duplicate AISHE codes)

### API Endpoint
**Route**: `/api/institutes/fetch-aishe`

**Method**: GET

**Parameters**: 
- `code` - AISHE code (required, must start with C-)

**Example Request**:
```bash
curl 'http://localhost:3000/api/institutes/fetch-aishe?code=C-36022'
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "name": "Lakshmi Narain College of Technology, Kalchuri Nagar, Raisen Road, Post Klua, Bhopal-462021",
    "state": "Madhya Pradesh",
    "district": "Bhopal",
    "city": "Bhopal",
    "address": "Lakshmi Narain College of Technology, Kalchuri Nagar, Raisen Road, Post Klua, Bhopal-462021",
    "email": "vivekr@lnct.ac.in",
    "phone": "9826856015",
    "contactFirstName": "Dr. Vivek",
    "contactLastName": "Richhariya"
  },
  "message": "AISHE data fetched successfully"
}
```

**Features**:
- ✅ Validates AISHE code format (must start with C-)
- ✅ Fetches from official SIH AISHE database
- ✅ Transforms data to match application format
- ✅ Error handling with helpful messages

### Frontend Form (CreateInstituteForm)

**New Features**:
1. **AISHE Code Input**:
   - Optional field at the top of the form
   - Auto-converts to uppercase
   - Validates C- prefix before fetching

2. **Fetch Button**:
   - Refresh icon (⟳) button next to AISHE input
   - Disabled when no code entered or while fetching
   - Shows spinner animation during fetch

3. **Auto-Fill**:
   - Populates: code, name, email, phone, address
   - User can edit any auto-filled field
   - AISHE code becomes the institute code

4. **Visual Feedback**:
   - ✅ Success alert (green) when data fetched
   - ❌ Error alert (red) if fetch fails
   - ⏳ Loading state on button
   - Help text guides user

5. **Validation**:
   - Frontend validates C- prefix before API call
   - Shows toast error if wrong prefix (e.g., U- for university)
   - Backend also validates for security

### User Flow

1. **Super Admin** creates University (or uses existing)
2. **Super/University Admin** clicks "Add Institute"
3. **Dialog opens** with Create Institute form
4. **User enters** AISHE code (e.g., C-36022)
5. **User clicks** refresh button (⟳)
6. **System validates** code format (C- prefix)
7. **API fetches** data from SIH database
8. **Form auto-fills** with institute details
9. **User selects** field (Engineering, Medical, etc.)
10. **User reviews** and edits if needed
11. **User submits** form
12. **Institute created** with AISHE code stored

### Benefits

1. **Accuracy**: Data comes from official AISHE database
2. **Speed**: One-click auto-fill vs manual entry
3. **Standardization**: Ensures consistent naming
4. **Validation**: Prevents wrong institution types
5. **User Experience**: Simple, intuitive interface
6. **Flexibility**: Can still enter manually if AISHE unavailable

## Testing

### Test Case 1: Valid AISHE Code
```bash
# Input: C-36022
# Expected: Success, form auto-filled with LNCT Bhopal details
curl 'http://localhost:3000/api/institutes/fetch-aishe?code=C-36022'
```

### Test Case 2: Invalid Prefix (University Code)
```bash
# Input: U-12345
# Expected: Error "Must start with C-"
curl 'http://localhost:3000/api/institutes/fetch-aishe?code=U-12345'
```

### Test Case 3: Non-existent Code
```bash
# Input: C-99999
# Expected: Error from SIH API
curl 'http://localhost:3000/api/institutes/fetch-aishe?code=C-99999'
```

### Test Case 4: Create Institute with AISHE
1. Login as Super Admin or University Admin
2. Go to University dashboard
3. Click "Add Institute"
4. Enter AISHE code: C-36022
5. Click refresh button
6. Verify form fields populated
7. Select field
8. Submit
9. Verify institute created with AISHE code in database

## Code Files Modified

1. **Prisma Schema**: `prisma/schema.prisma`
   - Added `aisheCode String? @unique` to Institute model

2. **API Route**: `src/app/api/institutes/fetch-aishe/route.ts`
   - New GET endpoint for fetching AISHE data

3. **Institutes API**: `src/app/api/institutes/route.ts`
   - Added `aisheCode` to request body destructuring
   - Added AISHE code prefix validation
   - Check for duplicate AISHE codes
   - Save `aisheCode` when creating institute

4. **CreateInstituteForm**: `src/components/admin/CreateInstituteForm.tsx`
   - Added AISHE code input field
   - Added fetch button with loading state
   - Added `handleFetchAISHE` function
   - Added success/error alerts
   - Auto-fill form fields on successful fetch
   - Added validation for C- prefix

5. **Documentation**: 
   - `AISHE_CODE_VALIDATION.md` - Updated with institute details
   - `INSTITUTE_AISHE_IMPLEMENTATION.md` - This file

## Database Migration

```sql
-- CreateInstituteAisheCode
ALTER TABLE "institutes" 
ADD COLUMN "aishe_code" TEXT;

ALTER TABLE "institutes" 
ADD CONSTRAINT "institutes_aishe_code_key" 
UNIQUE ("aishe_code");
```

Migration file: `prisma/migrations/20251130204951_add_aishe_code_to_institute/migration.sql`

## Implementation Parity

Both **University** and **Institute** creation now have:
- ✅ AISHE code support
- ✅ Auto-fetch from SIH database
- ✅ Prefix validation (U- vs C-)
- ✅ Visual feedback (success/error alerts)
- ✅ One-click auto-fill
- ✅ Manual override capability
- ✅ Unique constraint on AISHE code
- ✅ Optional field (can create without AISHE)

## Next Steps

If you want to enhance this further:

1. **Add to Institute Details View**:
   - Show AISHE code in institute information card
   - Add badge or link to AISHE portal

2. **Bulk Import**:
   - Create admin tool to import multiple institutes
   - Upload CSV with AISHE codes
   - Batch fetch and create

3. **Verification Badge**:
   - Add "AISHE Verified" badge for institutes with AISHE code
   - Show in institute listings

4. **Search Enhancement**:
   - Allow searching institutes by AISHE code
   - Add AISHE code to institute table columns

5. **Sync Feature**:
   - Button to re-fetch and update from AISHE
   - Compare and show changes before applying
