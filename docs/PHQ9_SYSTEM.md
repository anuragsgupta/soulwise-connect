# PHQ-9 Mental Health Assessment System

## Overview
The PHQ-9 (Patient Health Questionnaire-9) is a validated clinical tool for assessing depression severity. This implementation is specifically adapted for college students with contextually relevant questions about campus life, academic stress, and student well-being.

## Features

### 1. **Comprehensive Assessment**
- 9 standardized questions assessing depression symptoms
- Questions adapted for student context (campus activities, academic stress, exam periods)
- 4-point frequency scale (0-3): Not at all, Several days, More than half the time, Nearly every day
- Assessment covers the last 2 weeks period

### 2. **Three Survey System**
- Each student can complete 3 separate surveys
- Tracks progress over time (Survey 1, 2, 3)
- Prevents duplicate submissions
- Shows completion status with visual progress indicators

### 3. **Intelligent Scoring**
- **Total Score**: 0-27 (sum of all 9 questions)
- **Severity Levels**:
  - **NONE** (0-4): Minimal or no depression
  - **MILD** (5-9): Mild depression - consider counselor
  - **MODERATE** (10-14): Moderate depression - recommend professional help
  - **MODERATELY_SEVERE** (15-19): Moderately severe - urgent professional help needed
  - **SEVERE** (20-27): Severe depression - immediate professional intervention required

### 4. **Results & Recommendations**
- Immediate feedback after submission
- Color-coded severity display
- Personalized recommendations based on score
- Crisis support resources for concerning results
- Historical view of all completed surveys

### 5. **Crisis Support Integration**
- KIRAN Mental Health Helpline: 1800-599-0019 (24/7)
- Vandrevala Foundation: 1860-2662-345
- Campus counseling center information
- Emergency contact suggestions

## Database Schema

```prisma
model PHQ9Survey {
  id           String        @id @default(uuid())
  surveyNumber Int          // 1, 2, or 3
  completedAt  DateTime     @default(now())
  
  // Questions (0-3 scale)
  q1_interest      Int  // Interest in activities
  q2_depressed     Int  // Feeling down/hopeless
  q3_sleep         Int  // Sleep problems
  q4_energy        Int  // Low energy/fatigue
  q5_appetite      Int  // Appetite changes
  q6_failure       Int  // Feeling like a failure
  q7_concentration Int  // Concentration difficulties
  q8_movement      Int  // Psychomotor agitation/retardation
  q9_harm          Int  // Thoughts of self-harm
  
  // Calculated fields
  totalScore Int          // 0-27
  severity   PHQ9Severity // Enum
  
  // Relations
  student   Student @relation(fields: [studentId], references: [id])
  studentId String
  
  @@index([studentId, surveyNumber])
  @@unique([studentId, surveyNumber])
}

enum PHQ9Severity {
  NONE                 // 0-4
  MILD                 // 5-9
  MODERATE             // 10-14
  MODERATELY_SEVERE    // 15-19
  SEVERE               // 20-27
}
```

## API Endpoints

### POST `/api/phq9-survey`
Submit a new PHQ-9 survey.

**Request Body:**
```json
{
  "studentId": "uuid",
  "surveyNumber": 1,
  "q1_interest": 2,
  "q2_depressed": 1,
  "q3_sleep": 2,
  "q4_energy": 2,
  "q5_appetite": 1,
  "q6_failure": 1,
  "q7_concentration": 2,
  "q8_movement": 0,
  "q9_harm": 0
}
```

**Response:**
```json
{
  "success": true,
  "survey": {
    "id": "uuid",
    "surveyNumber": 1,
    "totalScore": 11,
    "severity": "MODERATE",
    "completedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Survey submitted successfully"
}
```

### GET `/api/phq9-survey?studentId={id}&surveyNumber={number}`
Retrieve survey(s) for a student.

**Query Parameters:**
- `studentId` (required): Student UUID
- `surveyNumber` (optional): Specific survey number (1, 2, or 3)

**Response:**
```json
{
  "success": true,
  "surveys": [
    {
      "id": "uuid",
      "surveyNumber": 1,
      "totalScore": 11,
      "severity": "MODERATE",
      "completedAt": "2024-01-15T10:30:00Z",
      "student": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "rollNumber": "2024001",
        "email": "john@example.com"
      }
    }
  ],
  "completedSurveys": 1,
  "remainingSurveys": 2
}
```

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── phq9-survey/
│   │       └── route.ts              # API endpoints
│   └── phq9-survey/
│       └── page.tsx                   # Survey page with status
├── components/
│   └── dashboard/
│       └── PHQ9SurveyForm.tsx        # Survey form component
prisma/
├── schema.prisma                      # Database schema
└── migrations/
    └── add_phq9_survey.sql           # SQL migration
```

## Usage

### For Students

1. **Access Survey**
   - Navigate to dashboard
   - Click "PHQ-9 Assessment" in Quick Actions
   - Or visit `/phq9-survey?studentId={your-id}`

2. **Complete Survey**
   - Answer all 9 questions honestly
   - Select frequency for each symptom over last 2 weeks
   - Submit when all questions are answered

3. **View Results**
   - See total score and severity level
   - Read personalized recommendations
   - Access crisis support if needed
   - View previous survey results

4. **Track Progress**
   - Complete up to 3 surveys
   - Monitor changes over time
   - Share results with counselor if desired

### For Developers

#### Running Migration
```bash
# Apply database migration
node run-phq9-migration.js

# Generate Prisma client
npx prisma generate
```

#### Testing Survey Form
```tsx
import PHQ9SurveyForm from '@/components/dashboard/PHQ9SurveyForm';

<PHQ9SurveyForm
  studentId="student-uuid"
  surveyNumber={1}
  onComplete={(result) => {
    console.log('Survey completed:', result);
  }}
/>
```

#### Fetching Survey Data
```typescript
// Get all surveys for a student
const response = await fetch(`/api/phq9-survey?studentId=${studentId}`);
const data = await response.json();

// Get specific survey
const response = await fetch(
  `/api/phq9-survey?studentId=${studentId}&surveyNumber=1`
);
```

## Security & Privacy

### Data Protection
- Survey responses are linked to student ID only
- No personal information stored in survey records
- Database uses UUID for anonymization
- HTTPS encryption for all API calls

### Access Control
- Students can only access their own surveys
- Authentication required for all endpoints
- Session-based security
- GDPR-compliant data handling

### Privacy Considerations
- Results are confidential
- Optional sharing with counselors
- Right to data deletion
- Anonymized aggregation for analytics

## Clinical Guidelines

### When to Seek Help
- **MILD** (5-9): Consider talking to a counselor
- **MODERATE** (10-14): Strongly recommended to see a professional
- **MODERATELY_SEVERE** (15-19): Urgent professional help needed
- **SEVERE** (20-27): Immediate professional intervention required

### Crisis Situations
If a student scores high on Q9 (thoughts of self-harm), immediate action is required:
1. Display crisis alert prominently
2. Provide immediate helpline numbers
3. Suggest campus emergency services
4. Recommend visiting nearest hospital if urgent

### Follow-up Protocol
1. **First Survey**: Establish baseline
2. **Second Survey**: Assess changes (recommend 2-4 weeks later)
3. **Third Survey**: Track long-term progress (recommend 2-3 months later)

## Limitations

### Clinical Limitations
- PHQ-9 is a screening tool, not a diagnostic instrument
- Does not replace professional clinical assessment
- Cultural and contextual factors may affect responses
- Self-reported data has inherent biases

### Technical Limitations
- Requires internet connection
- No offline mode currently
- Limited to 3 surveys per student (by design)
- No automated counselor notifications

## Future Enhancements

### Planned Features
1. **Automated Alerts**: Notify counselors for high-risk scores
2. **Trend Analysis**: Charts showing score changes over time
3. **Email Reports**: Send results to student's email
4. **Mobile App**: Native mobile experience
5. **Multi-language**: Support for regional languages
6. **Export Functionality**: PDF reports for counseling sessions
7. **Anonymous Mode**: Optional anonymous submissions for research
8. **Integration**: Connect with campus counseling scheduling system

### Analytics Dashboard
- Institutional mental health metrics
- Department-wise aggregation
- Early warning system for at-risk students
- Intervention effectiveness tracking

## Support & Documentation

### For Students
- **Help**: Contact campus counseling center
- **Technical Issues**: support@mannmitra.edu
- **Crisis**: KIRAN Helpline 1800-599-0019

### For Administrators
- **Documentation**: `/docs/phq9-admin-guide.md`
- **API Docs**: `/docs/api/phq9-survey.md`
- **Training**: Contact IT department

### For Developers
- **GitHub**: [repository-link]
- **Issues**: [issues-link]
- **Contributing**: See CONTRIBUTING.md

## References

1. Kroenke, K., Spitzer, R. L., & Williams, J. B. (2001). The PHQ-9: validity of a brief depression severity measure. Journal of general internal medicine, 16(9), 606-613.

2. Levis, B., Benedetti, A., & Thombs, B. D. (2019). Accuracy of Patient Health Questionnaire-9 (PHQ-9) for screening to detect major depression: individual participant data meta-analysis. bmj, 365.

3. Manea, L., Gilbody, S., & McMillan, D. (2012). Optimal cut-off score for diagnosing depression with the Patient Health Questionnaire (PHQ-9): a meta-analysis. Cmaj, 184(3), E191-E196.

## License

This implementation follows HIPAA and GDPR guidelines for mental health data handling.

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Maintained By**: Mann Mitra Development Team
