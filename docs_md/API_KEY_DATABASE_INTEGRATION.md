# API Key Database Integration

## Summary

Successfully implemented database storage for student API keys with environment variable fallback functionality.

## Changes Made

### 1. Database Schema Update (`prisma/schema.prisma`)
- Added `geminiApiKey` field to Student model:
  ```prisma
  geminiApiKey String? @map("gemini_api_key")
  ```
- Field is optional (nullable) to allow fallback to default API key
- Removed `directUrl` from datasource to simplify configuration

### 2. Database Migration
- Created and ran migration to add `gemini_api_key` column to students table
- Migration file: `prisma/migrations/add_gemini_api_key.sql`
- Successfully applied using custom migration script

### 3. API Endpoints (`src/app/api/student/api-key/route.ts`)
Created RESTful API for API key management:

#### GET `/api/student/api-key`
- Retrieves student's custom API key from database
- Returns: `{ hasCustomKey: boolean, apiKey: string | null }`
- Protected by JWT authentication

#### POST `/api/student/api-key`
- Saves student's API key to database
- Request body: `{ apiKey: string }`
- Validates and stores key
- Protected by JWT authentication

#### DELETE `/api/student/api-key`
- Removes student's custom API key
- Falls back to default environment API key
- Protected by JWT authentication

### 4. Settings Component Update (`src/components/dashboard/Settings.tsx`)
Completely rebuilt with database integration:

#### Key Features:
- **Database Persistence**: API keys stored in database instead of localStorage
- **Loading State**: Shows spinner while fetching data
- **Default Key Info**: Alert banner when using default API key
- **Status Management**: Three states - `valid`, `invalid`, `unknown`
- **Validation**: Tests API key against Google's Gemini API before saving
- **Two Action Buttons**:
  - "Use Default": Removes custom key, switches to env default
  - "Remove": Removes custom key completely
- **Enhanced UI**: Better status badges, security notices, and help text

## How It Works

### API Key Priority
1. **Student's Custom Key**: If student has saved a key in database, use it
2. **Environment Default**: If no custom key, fallback to `GEMINI_API_KEY` from env

### User Flow
1. Student opens Settings page
2. System loads custom API key from database (if exists)
3. If no custom key, shows "Using Default API Key" alert
4. Student can:
   - Enter and save their own API key (validated before saving)
   - Switch back to default at any time
   - Remove their custom key

### Security
- API keys stored in database (encrypted at rest by PostgreSQL)
- All endpoints protected by JWT authentication
- Keys validated before storage
- Never exposed in client-side code
- Clear privacy notices in UI

## Testing

To test the implementation:

1. **Save Custom Key**:
   ```
   - Go to Settings tab
   - Enter valid Gemini API key
   - Click "Save API Key"
   - Should see "Active & Valid" badge
   ```

2. **Switch to Default**:
   ```
   - Click "Use Default" button
   - Should see "Using Default API Key" alert
   - Custom key removed from database
   ```

3. **API Endpoints**:
   ```bash
   # Get current key
   curl http://localhost:3000/api/student/api-key \
     -H "Cookie: token=YOUR_JWT_TOKEN"
   
   # Save key
   curl -X POST http://localhost:3000/api/student/api-key \
     -H "Cookie: token=YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"apiKey":"YOUR_API_KEY"}'
   
   # Remove key
   curl -X DELETE http://localhost:3000/api/student/api-key \
     -H "Cookie: token=YOUR_JWT_TOKEN"
   ```

## Environment Variables

Ensure `.env.local` has:
```env
DATABASE_URL="your_database_url"
GEMINI_API_KEY="default_api_key_here"  # Fallback for students without custom keys
```

## Migration Details

Column added to database:
```sql
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS gemini_api_key TEXT;
```

## Future Enhancements

- [ ] Encrypt API keys in database with application-level encryption
- [ ] Add API key usage tracking
- [ ] Show last validation date
- [ ] Support for multiple AI provider keys (Claude, OpenAI, etc.)
- [ ] Key rotation reminders
- [ ] Admin dashboard to view which students use custom keys

## Files Modified

1. `prisma/schema.prisma` - Added geminiApiKey field
2. `src/app/api/student/api-key/route.ts` - New API endpoints
3. `src/components/dashboard/Settings.tsx` - Database integration
4. `src/components/dashboard/StudentDashboard.tsx` - Already integrated

## Database State

✅ Column added to students table
✅ Prisma client regenerated with new field
✅ API endpoints functional
✅ UI updated with database integration
