# Batch Semester Auto-Update System

This system automatically updates the `currentSemester` field for all batches based on their start year and the current date.

## How It Works

The semester is calculated as:
- **Years passed since start** × 2 semesters per year
- **Current semester within the year**: July-December = Semester 1 (odd), January-June = Semester 2 (even)
- Result is capped between 1-8

Example: A batch starting in 2024, in November 2025:
- Years passed: 1
- Current period: November (Semester 2 within the year)  
- Calculated semester: (1 × 2) + 2 = **Semester 4**

## Setup Options

### Option 1: Vercel Cron Jobs (Recommended for Vercel deployments)

1. **Add to `vercel.json`:**
```json
{
  "crons": [
    {
      "path": "/api/batches/update-semesters",
      "schedule": "0 0 1 1,7 *"
    }
  ]
}
```

This runs on:
- **January 1st at midnight** (start of even semester)
- **July 1st at midnight** (start of odd semester)

2. **Set environment variable in Vercel:**
```
CRON_SECRET=your-random-secret-string-here
```

Generate a secure random string for the secret.

### Option 2: External Cron Service (EasyCron, cron-job.org, etc.)

1. **Set up a scheduled job** to call:
```
POST https://your-domain.com/api/batches/update-semesters
Headers:
  x-cron-secret: your-random-secret-string
```

2. **Schedule**: Run twice a year (January 1 and July 1)

3. **Add CRON_SECRET to your environment variables**

### Option 3: Manual Trigger (Backup option)

Super Admins can manually trigger the update:

**Request:**
```bash
GET/POST https://your-domain.com/api/batches/update-semesters
Headers:
  Authorization: Bearer <super-admin-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Batch semesters updated successfully",
  "data": {
    "totalBatches": 50,
    "updatedCount": 25,
    "unchangedCount": 25,
    "updates": [
      {
        "batchId": "...",
        "batchName": "2024-2028",
        "oldSemester": 3,
        "newSemester": 4
      }
    ]
  }
}
```

## Environment Variables Required

Add to your `.env.local` and production environment:

```env
# Cron job secret for automatic semester updates
CRON_SECRET=generate-a-secure-random-string-here
```

## Vercel Configuration Example

Create or update `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/batches/update-semesters",
      "schedule": "0 0 1 1,7 *",
      "headers": [
        {
          "key": "x-cron-secret",
          "value": "$CRON_SECRET"
        }
      ]
    }
  ]
}
```

## Testing

Test the endpoint manually:

```bash
# Using curl with cron secret
curl -X POST https://your-domain.com/api/batches/update-semesters \
  -H "x-cron-secret: your-secret-here"

# Or using super admin token
curl -X POST https://your-domain.com/api/batches/update-semesters \
  -H "Authorization: Bearer your-super-admin-jwt-token"
```

## Monitoring

- All updates are logged in the `auditLog` table
- Check logs for operation: `semester_update`
- Review which batches were updated and which remained unchanged

## Customization

To change the semester calculation logic, modify the `calculateCurrentSemester` function in:
`/src/app/api/batches/update-semesters/route.ts`

Current logic:
- **July-December**: Odd semesters (1, 3, 5, 7)
- **January-June**: Even semesters (2, 4, 6, 8)

Adjust based on your institution's academic calendar.
