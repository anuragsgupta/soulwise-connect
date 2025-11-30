# AISHE Code Validation

## Overview
AISHE (All India Survey on Higher Education) codes are unique identifiers for educational institutions in India. The system now validates AISHE code prefixes to distinguish between Universities and Colleges/Institutes.

## AISHE Code Format

### University Codes
- **Prefix**: `U-`
- **Example**: `U-12345`
- **Used for**: Universities only
- **Validation**: Must start with "U-" when creating a University

### College/Institute Codes
- **Prefix**: `C-`
- **Example**: `C-36022`
- **Used for**: Colleges, Institutes, Affiliated institutions
- **Validation**: Must start with "C-" when creating an Institute

## Implementation Details

### Database Schema
```prisma
model University {
  id         String  @id @default(uuid())
  aisheCode  String? @unique
  name       String
  // ... other fields
}

model Institute {
  id         String  @id @default(uuid())
  aisheCode  String? @unique
  name       String
  // ... other fields
}
```

### API Validation

#### Universities API (`/api/universities`)
- Validates AISHE code starts with `U-`
- Returns error if code starts with `C-` or other prefix
- Error message guides user to correct format

```typescript
if (aisheCode) {
  const trimmedCode = aisheCode.trim().toUpperCase();
  if (!trimmedCode.startsWith('U-')) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Invalid AISHE code for University. University AISHE codes must start with "U-" (e.g., U-12345). College/Institute codes start with "C-".' 
      },
      { status: 400 }
    );
  }
}
```

#### Institutes API (`/api/institutes`)
- Validates AISHE code starts with `C-`
- Returns error if code starts with `U-` or other prefix
- Error message guides user to correct format

```typescript
if (aisheCode) {
  const trimmedCode = aisheCode.trim().toUpperCase();
  if (!trimmedCode.startsWith('C-')) {
    return NextResponse.json(
      createResponse(false, 'Invalid AISHE code for Institute. College/Institute AISHE codes must start with "C-" (e.g., C-36022). University codes start with "U-".'),
      { status: 400 }
    );
  }
}
```

### Frontend Validation

#### CreateUniversityForm
- Validates AISHE code before fetching data
- Shows toast error if code doesn't start with `U-`
- Placeholder: "e.g., U-12345 (University codes start with U-)"
- Help text: "University AISHE codes start with U- (e.g., U-12345). College codes start with C-"

#### CreateInstituteForm
- Updated placeholder to accept AISHE codes
- Placeholder: "e.g., ENGCOL001 or AISHE C-36022"
- Help text: "Unique code for the institute. Can use AISHE code (starts with C- for colleges)"

## Auto-Fetch from SIH Database

The system can automatically fetch institution details from the Smart India Hackathon (SIH) AISHE database:

### Endpoints
```
GET /api/universities/fetch-aishe?code=U-12345
GET /api/institutes/fetch-aishe?code=C-36022
```

### Example Response (University)
```json
{
  "success": true,
  "data": {
    "name": "University Name",
    "state": "State Name",
    "district": "District Name",
    "city": "City Name",
    "address": "Full Address",
    "email": "contact@university.edu",
    "phone": "1234567890",
    "contactFirstName": "First",
    "contactLastName": "Last"
  }
}
```

### Example Response (Institute)
```json
{
  "success": true,
  "data": {
    "name": "Lakshmi Narain College of Technology, Kalchuri Nagar, Raisen Road, Post Klua, Bhopal-462021",
    "state": "Madhya Pradesh",
    "district": "Bhopal",
    "city": "Bhopal",
    "address": "Kalchuri Narain College of Technology, Kalchuri Nagar, Raisen Road, Post Klua, Bhopal-462021",
    "email": "vivekr@lnct.ac.in",
    "phone": "9826856015",
    "contactFirstName": "Dr. Vivek",
    "contactLastName": "Richhariya"
  }
}
```

## Usage Flow

### Creating a University with AISHE Code

1. Open Create University form
2. Enter AISHE code starting with `U-` (e.g., `U-12345`)
3. Click "Fetch Details" button
4. System validates prefix is `U-`
5. Fetches details from SIH database
6. Auto-fills form fields
7. Review and submit

### Creating an Institute with AISHE Code

1. Open Create Institute form (from University dashboard)
2. Enter AISHE code starting with `C-` (e.g., `C-36022`)
3. Click the refresh button (⟳) next to AISHE code field
4. System validates prefix is `C-`
5. Fetches details from SIH database
6. Auto-fills form fields (code, name, email, phone, address)
7. Select field (Engineering, Medical, Arts, etc.)
8. Review and submit

**Features:**
- ✅ Real-time validation of AISHE code format
- ✅ One-click auto-fill from official database
- ✅ Visual feedback (loading, success, error states)
- ✅ Manual override option (can edit auto-filled fields)
- ✅ AISHE code becomes institute code automatically

## Error Messages

### University with Wrong Prefix
```
Invalid AISHE code for University. University AISHE codes must start with "U-" (e.g., U-12345). College/Institute codes start with "C-".
```

### Institute with Wrong Prefix
```
Invalid AISHE code for Institute. College/Institute AISHE codes must start with "C-" (e.g., C-36022). University codes start with "U-".
```

## Benefits

1. **Data Integrity**: Ensures correct institution type matches AISHE code format
2. **User Guidance**: Clear error messages guide users to correct format
3. **Auto-Population**: Reduces manual data entry errors
4. **Standardization**: Maintains consistency with official AISHE database
5. **Validation**: Prevents mixing university and college codes

## Migration

Existing institutions without AISHE codes:
- Can continue without AISHE code (field is optional)
- Can add AISHE code later if needed
- No breaking changes for existing data

## Testing

### Test Cases

1. ✅ Create University with valid `U-` prefix → Success
2. ✅ Create University with `C-` prefix → Error with helpful message
3. ✅ Create Institute with valid `C-` prefix → Success
4. ✅ Create Institute with `U-` prefix → Error with helpful message
5. ✅ Create without AISHE code → Success (field is optional)
6. ✅ Fetch details with valid AISHE code → Auto-fills form
7. ✅ Fetch details with invalid code → Error message

## Future Enhancements

1. ✅ ~~Auto-fetch for institutes~~ (COMPLETED - both universities and institutes now support auto-fetch)
2. Bulk import from AISHE database
3. Sync updates from AISHE database
4. Validation against official AISHE registry
5. Support for other institution types (research centers, training institutes)
6. Cache AISHE data to reduce API calls
7. Offline mode with pre-downloaded AISHE database
