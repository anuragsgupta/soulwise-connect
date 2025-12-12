# AISHE Auto-Fetch Feature

## ✅ Implementation Complete

The AISHE (All India Survey on Higher Education) auto-fetch feature allows Super Admins to automatically populate university/institute details using official AISHE codes from the Smart India Hackathon database.

## 🎯 Features

### 1. **Auto-Fill from AISHE Database**
- Enter AISHE code (e.g., `C-36022`)
- Click "Fetch Details" to auto-fill all university information
- Data fetched includes:
  - University/Institute name
  - Full address
  - City, State, District
  - Official email
  - Phone number
  - Contact person (First Name, Last Name)

### 2. **Manual Entry Option**
- Toggle between AISHE auto-fetch and manual entry
- Manual entry gives full control over all fields
- Useful when AISHE data is not available or needs customization

### 3. **AISHE Code as Unique Identifier**
- AISHE code stored in database
- Prevents duplicate entries from same institution
- Easy tracking and verification

## 📊 Database Schema Changes

### New Fields Added to `University` Model:

```prisma
model University {
  aisheCode        String?  @unique @map("aishe_code")
  district         String?
  contactFirstName String?  @map("contact_first_name")
  contactLastName  String?  @map("contact_last_name")
  // ... existing fields
}
```

### Migration Applied:
- **Migration:** `20251130202331_add_aishe_code_to_university`
- **Status:** ✅ Successfully applied

## 🔌 API Endpoints

### 1. Fetch AISHE Data
```
GET /api/universities/fetch-aishe?code=C-36022
```

**Response:**
```json
{
  "success": true,
  "data": {
    "aisheCode": "C-36022",
    "name": "Lakshmi Narain College of Technology...",
    "email": "vivekr@lnct.ac.in",
    "phone": "9826856015",
    "state": "Madhya Pradesh",
    "district": "Bhopal",
    "city": "Bhopal",
    "address": "Kalchuri Nagar, Raisen Road, Post Klua, Bhopal-462021",
    "contactFirstName": "Dr. Vivek",
    "contactLastName": "Richhariya",
    "domain": "lnct.ac.in"
  },
  "message": "University data fetched successfully from AISHE database"
}
```

### 2. Create University (Updated)
```
POST /api/universities
```

**Request Body (with AISHE):**
```json
{
  "aisheCode": "C-36022",
  "name": "Lakshmi Narain College of Technology",
  "email": "vivekr@lnct.ac.in",
  "phone": "9826856015",
  "domain": "lnct.ac.in",
  "address": "Kalchuri Nagar, Raisen Road",
  "city": "Bhopal",
  "state": "Madhya Pradesh",
  "district": "Bhopal",
  "contactFirstName": "Dr. Vivek",
  "contactLastName": "Richhariya"
}
```

## 🎨 UI Components Updated

### CreateUniversityForm
- **New Section:** AISHE Auto-Fetch card with blue highlight
- **Toggle Button:** Switch between AISHE and Manual entry modes
- **Fetch Button:** Triggers API call to fetch AISHE data
- **Loading States:** Shows spinner while fetching
- **Error Handling:** Clear error messages for invalid codes

## 🔍 How to Use

### For Super Admin:

1. **Navigate to Dashboard:**
   ```
   http://localhost:3000/login
   Login as Super Admin
   ```

2. **Create New University:**
   - Click "Create University" button
   - See the blue AISHE Auto-Fetch card at top

3. **Option A: Use AISHE Code (Recommended)**
   - Enter AISHE code (e.g., `C-36022`)
   - Click "Fetch Details" button
   - All fields auto-filled instantly
   - Review and edit if needed
   - Click "Create University"

4. **Option B: Manual Entry**
   - Click "Manual Entry" toggle button
   - AISHE section collapses
   - Fill all fields manually
   - Click "Create University"

## 🌐 Finding AISHE Codes

AISHE codes can be found on:
- **Smart India Hackathon Website:** https://www.sih.gov.in/
- **College Registration Page:** https://www.sih.gov.in/collegeRegistration
- Search for your institution and copy the code (format: `C-XXXXX`)

### Example AISHE Codes:
- `C-36022` - Lakshmi Narain College of Technology, Bhopal
- `C-12345` - (Search on SIH website for your institution)

## ✨ Benefits

1. **Accuracy:** Data directly from official government database
2. **Speed:** Fill form in seconds instead of minutes
3. **Verification:** AISHE code proves institution is officially recognized
4. **No Duplicates:** Unique AISHE code prevents duplicate entries
5. **Standardization:** Consistent data format across all universities

## 🔒 Validation

- AISHE code must be unique (no duplicate institutions)
- Domain must be unique (existing validation)
- Email must be valid format
- All required fields validated before submission

## 🚀 Future Enhancements

Potential improvements:
- [ ] Bulk import universities using AISHE codes
- [ ] Periodic sync with AISHE database for updates
- [ ] Support for multiple AISHE databases (state-level)
- [ ] AISHE code verification during onboarding
- [ ] Display AISHE verification badge for verified institutions

## 📝 Example Workflow

```
Super Admin → Create University
  ↓
Enter AISHE Code: C-36022
  ↓
Click "Fetch Details"
  ↓
API calls SIH database
  ↓
Form auto-fills with official data:
  - Name: Lakshmi Narain College of Technology...
  - Email: vivekr@lnct.ac.in
  - Phone: 9826856015
  - Address: Auto-filled
  - City: Bhopal
  - State: Madhya Pradesh
  ↓
Review & Edit (optional)
  ↓
Click "Create University"
  ↓
✅ University created with AISHE verification
```

## 🛠️ Technical Implementation

### Files Modified:

1. **Schema:**
   - `prisma/schema.prisma` - Added AISHE fields

2. **API Routes:**
   - `src/app/api/universities/fetch-aishe/route.ts` - NEW
   - `src/app/api/universities/route.ts` - Updated for AISHE

3. **Components:**
   - `src/components/admin/CreateUniversityForm.tsx` - Major update

4. **Database:**
   - Migration: `20251130202331_add_aishe_code_to_university`

### Dependencies:
- Uses native `fetch` API (no additional packages)
- Connects to: `https://www.sih.gov.in/searchcollegename`

## ⚠️ Important Notes

1. **AISHE Code Format:** Always uppercase (e.g., `C-36022`)
2. **Optional Field:** AISHE code is optional - manual entry still works
3. **Data Override:** Auto-filled data can be edited before submission
4. **Network Required:** AISHE fetch requires internet connection
5. **Rate Limiting:** SIH API may have rate limits (handle gracefully)

## 🧪 Testing

Test the feature:

```bash
# 1. Start dev server
npm run dev

# 2. Test AISHE API directly
curl 'http://localhost:3000/api/universities/fetch-aishe?code=C-36022'

# 3. Test in browser
# - Login as Super Admin
# - Create University → Enter AISHE code → Fetch Details
# - Verify all fields auto-fill correctly
```

## 📞 Support

If AISHE code is not found:
1. Verify code format (must include 'C-' prefix)
2. Check on SIH website: https://www.sih.gov.in/
3. Use Manual Entry as fallback
4. Contact institution for correct AISHE code
