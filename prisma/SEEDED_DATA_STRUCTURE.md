# Seeded Data Structure

This document provides an overview of the data structure created by the `seed-full.ts` script.

## Universities (5 Total)

### 1. Indian Institute of Technology Delhi
- **Domain**: iitd.ac.in
- **Location**: New Delhi, Delhi
- **AISHE Code**: U-0101
- **Contact**: Ravi Kumar

### 2. University of Mumbai
- **Domain**: mu.ac.in
- **Location**: Mumbai, Maharashtra
- **AISHE Code**: U-0102
- **Contact**: Priya Sharma

### 3. Anna University
- **Domain**: annauniv.edu
- **Location**: Chennai, Tamil Nadu
- **AISHE Code**: U-0103
- **Contact**: Rajesh Krishnan

### 4. Jawaharlal Nehru University
- **Domain**: jnu.ac.in
- **Location**: New Delhi, Delhi
- **AISHE Code**: U-0104
- **Contact**: Aisha Khan

### 5. University of Calcutta
- **Domain**: caluniv.ac.in
- **Location**: Kolkata, West Bengal
- **AISHE Code**: U-0105
- **Contact**: Amit Chatterjee

## Institutes per University (25 Total)

Each university has 5 institutes:

1. **Computer Science and Engineering (CSE)**
   - Field: Engineering
   - Code: U-XXXX-CSE

2. **Electronics and Communication (ECE)**
   - Field: Engineering
   - Code: U-XXXX-ECE

3. **Business Administration (MBA)**
   - Field: Commerce
   - Code: U-XXXX-MBA

4. **Applied Sciences (SCI)**
   - Field: Science
   - Code: U-XXXX-SCI

5. **Humanities and Social Sciences (HSS)**
   - Field: Arts
   - Code: U-XXXX-HSS

## Faculty Distribution (125 Total)

Each institute has 5 faculty members with different roles:

### Role Distribution
1. **Professor** (25 total)
   - Job Title: Professor and Head
   - Also serves as HOD of Department and Institute

2. **Associate Professor** (25 total)
   - Job Title: Associate Professor
   - Senior teaching faculty

3. **Assistant Professor** (25 total)
   - Job Title: Assistant Professor
   - Junior teaching faculty

4. **Counselor** (25 total)
   - Job Title: Student Counselor
   - Handles student mental health

5. **Mentor** (25 total)
   - Job Title: Faculty Mentor
   - Mentors students

### Faculty Names (Sample)
- Prof. Amit Sharma
- Dr. Priya Patel
- Dr. Rajesh Kumar
- Ms. Sneha Singh
- Mr. Vikram Reddy
- Dr. Anjali Verma
- Prof. Suresh Gupta
- Ms. Kavita Krishnan
- Dr. Arjun Rao
- Ms. Meera Mehta

## Student Distribution (250 Total)

Each institute has 10 students.

### Student Details
- **Current Semester**: 5
- **Admission Year**: 2023 (current year - 2)
- **CGPA**: Random between 6.00 and 10.00
- **Mentor**: Randomly assigned from institute faculty
- **Batch**: Batch 2023-2027

### Student Names (Sample)
- Aarav Kumar
- Vivaan Sharma
- Aditya Patel
- Arjun Singh
- Sai Reddy
- Diya Nair
- Ananya Iyer
- Isha Joshi
- Pari Desai
- Aadhya Kapoor

## Email Format Examples

### Faculty Emails
```
{firstname}.{lastname}.{institute_code}@{university_domain}

Examples:
- amit.sharma.cse@iitd.ac.in
- priya.patel.mba@mu.ac.in
- rajesh.kumar.hss@annauniv.edu
```

### Student Emails
```
{firstname}.{lastname}.{institute_code}@student.{university_domain}

Examples:
- aarav.kumar.cse@student.iitd.ac.in
- vivaan.sharma.ece@student.mu.ac.in
- diya.reddy.mba@student.annauniv.edu
```

## Enrollment ID Format
```
{AISHE_CODE}-{ADMISSION_YEAR}-{SERIAL_NUMBER}

Examples:
- U-0101-CSE-2023-0001
- U-0102-MBA-2023-0005
- U-0103-HSS-2023-0010
```

## Roll Number Format
```
{ADMISSION_YEAR}{SERIAL_NUMBER}

Examples:
- 2023001
- 2023005
- 2023010
```

## Department Structure

Each institute has one department with:
- **Department Code**: DEPT-{INSTITUTE_CODE}
- **HOD**: First faculty member (Professor)
- **Batch**: One batch per department

## Batch Information

- **Name**: Batch {START_YEAR}-{END_YEAR}
- **Start Year**: 2023 (Current Year - 2)
- **End Year**: 2027 (Current Year + 2)
- **Current Semester**: 5
- **Students**: 10 per batch

## Complete Data Summary

| Entity | Count | Details |
|--------|-------|---------|
| Super Admin | 1 | System administrator |
| Universities | 5 | Major Indian universities |
| Fields | 6 | Engineering, Medical, Arts, Commerce, Science, Law |
| Institutes | 25 | 5 per university |
| Departments | 25 | 1 per institute |
| Batches | 25 | 1 per department |
| Faculty | 125 | 5 per institute (Professor, Associate Prof, Assistant Prof, Counselor, Mentor) |
| Students | 250 | 10 per institute, assigned to batches and mentors |
| **Total Users** | **376** | 1 Super Admin + 125 Faculty + 250 Students |

## Login Quick Reference

### Super Admin
- Email: `superadmin@mannmitra.com`
- Password: `SuperAdmin@2024`

### Any Faculty/Student
- Email: See format above
- Password: `12345678`

## Sample Test Accounts

### IIT Delhi - Computer Science
**Faculty:**
- `prof.amit.sharma.cse@iitd.ac.in` (Professor/HOD)
- `dr.priya.patel.cse@iitd.ac.in` (Associate Professor)
- `dr.rajesh.kumar.cse@iitd.ac.in` (Assistant Professor)
- `ms.sneha.singh.cse@iitd.ac.in` (Counselor)
- `mr.vikram.reddy.cse@iitd.ac.in` (Mentor)

**Students:**
- `aarav.kumar.cse@student.iitd.ac.in`
- `vivaan.sharma.cse@student.iitd.ac.in`
- `aditya.patel.cse@student.iitd.ac.in`
- (... 7 more students)

### University of Mumbai - Business Administration
**Faculty:**
- `prof.amit.sharma.mba@mu.ac.in`
- `dr.priya.patel.mba@mu.ac.in`
- `dr.rajesh.kumar.mba@mu.ac.in`
- `ms.sneha.singh.mba@mu.ac.in`
- `mr.vikram.reddy.mba@mu.ac.in`

**Students:**
- `aarav.kumar.mba@student.mu.ac.in`
- `vivaan.sharma.mba@student.mu.ac.in`
- (... 8 more students)

### Anna University - Electronics and Communication
**Faculty:**
- `prof.priya.patel.ece@annauniv.edu`
- `dr.rajesh.kumar.ece@annauniv.edu`
- (... 3 more faculty)

**Students:**
- `aarav.kumar.ece@student.annauniv.edu`
- (... 9 more students)

All passwords: `12345678`

## Relationships Overview

```
University (1)
  ├── Institutes (5)
  │   ├── Departments (1 per institute)
  │   │   ├── Batches (1 per department)
  │   │   │   └── Students (10 per batch)
  │   │   ├── Faculty (5 per department)
  │   │   │   ├── Professor (HOD)
  │   │   │   ├── Associate Professor
  │   │   │   ├── Assistant Professor
  │   │   │   ├── Counselor
  │   │   │   └── Mentor
  │   │   └── HOD (Links to Professor)
  │   └── Institute HOD (Links to Professor)
  └── Fields (linked via institutes)
```

## Notes

- All Indian universities with realistic addresses and phone numbers
- Faculty have 5-20 years of experience (randomly assigned)
- Students have CGPA between 6.00 and 10.00
- All entities are linked with proper foreign keys
- Phone numbers follow Indian format: +91-XXXXXXXXXX
- All entities have ACTIVE status by default
