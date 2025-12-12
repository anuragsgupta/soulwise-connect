# Database Seed Data Relationship Diagram

## Overall Structure

```
Soulwise Connect Database
│
├── Super Admin (1)
│   └── Email: superadmin@mannmitra.com
│
└── Universities (5)
    ├── IIT Delhi
    ├── University of Mumbai
    ├── Anna University
    ├── JNU
    └── University of Calcutta
```

## Per University Structure (×5)

```
University
│
├── Institutes (5 per university = 25 total)
│   │
│   ├── Computer Science & Engineering (CSE)
│   │   ├── Department: CSE
│   │   │   ├── Batch (2023-2027, Semester 5)
│   │   │   │   └── Students (10)
│   │   │   │       ├── Aarav Kumar
│   │   │   │       ├── Vivaan Sharma
│   │   │   │       ├── Aditya Patel
│   │   │   │       ├── Arjun Singh
│   │   │   │       ├── Sai Reddy
│   │   │   │       ├── Diya Nair
│   │   │   │       ├── Ananya Iyer
│   │   │   │       ├── Isha Joshi
│   │   │   │       ├── Pari Desai
│   │   │   │       └── Aadhya Kapoor
│   │   │   │
│   │   │   └── Faculty (5)
│   │   │       ├── Prof. (HOD) ←─ Institute HOD
│   │   │       ├── Dr. (Faculty)
│   │   │       ├── Dr. (Faculty)
│   │   │       ├── Ms. (Counselor)
│   │   │       └── Mr. (Mentor) ←─ Student Mentors
│   │   │
│   │   ├── Electronics & Communication (ECE)
│   │   │   └── [Same structure as CSE]
│   │   │
│   │   ├── Business Administration (MBA)
│   │   │   └── [Same structure as CSE]
│   │   │
│   │   ├── Applied Sciences (SCI)
│   │   │   └── [Same structure as CSE]
│   │   │
│   │   └── Humanities & Social Sciences (HSS)
│   │       └── [Same structure as CSE]
│   │
│   └── Fields (linked)
│       ├── Engineering (CSE, ECE)
│       ├── Commerce (MBA)
│       ├── Science (SCI)
│       └── Arts (HSS)
```

## Detailed Institute View

```
Institute: Computer Science & Engineering (CSE)
│
├── Code: U-0101-CSE
├── Email: cse@iitd.ac.in
├── AISHE Code: U-0101-I-01
│
├── Department: CSE
│   ├── Code: DEPT-CSE
│   ├── HOD: Prof. Amit Sharma
│   │
│   ├── Batch: 2023-2027
│   │   ├── Current Semester: 5
│   │   └── Students: 10
│   │
│   └── Faculty Members (5):
│       │
│       ├── 1. Professor (HOD)
│       │   ├── Name: Prof. Amit Sharma
│       │   ├── Email: prof.amit.sharma.cse@iitd.ac.in
│       │   ├── Type: HOD
│       │   ├── Title: Professor and Head
│       │   └── Role: Department & Institute Head
│       │
│       ├── 2. Faculty (Associate Prof)
│       │   ├── Name: Dr. Priya Patel
│       │   ├── Email: dr.priya.patel.cse@iitd.ac.in
│       │   ├── Type: FACULTY
│       │   └── Title: Associate Professor
│       │
│       ├── 3. Faculty (Assistant Prof)
│       │   ├── Name: Dr. Rajesh Kumar
│       │   ├── Email: dr.rajesh.kumar.cse@iitd.ac.in
│       │   ├── Type: FACULTY
│       │   └── Title: Assistant Professor
│       │
│       ├── 4. Counselor
│       │   ├── Name: Ms. Sneha Singh
│       │   ├── Email: ms.sneha.singh.cse@iitd.ac.in
│       │   ├── Type: COUNSELOR
│       │   └── Title: Student Counselor
│       │
│       └── 5. Mentor
│           ├── Name: Mr. Vikram Reddy
│           ├── Email: mr.vikram.reddy.cse@iitd.ac.in
│           ├── Type: MENTOR
│           └── Title: Faculty Mentor
│
└── Students (10):
    │
    ├── 1. Aarav Kumar
    │   ├── Email: aarav.kumar.cse@student.iitd.ac.in
    │   ├── Enrollment: U-0101-CSE-2023-0001
    │   ├── Roll No: 2023001
    │   ├── Semester: 5
    │   ├── CGPA: 8.47 (random 6-10)
    │   └── Mentor: [Random faculty]
    │
    ├── 2. Vivaan Sharma
    │   ├── Email: vivaan.sharma.cse@student.iitd.ac.in
    │   └── [Similar structure]
    │
    ├── 3-10. [Similar structure for remaining students]
    │
    └── Common Properties:
        ├── Password: 12345678
        ├── Admission Year: 2023
        ├── Current Semester: 5
        ├── Status: ACTIVE
        ├── Phone: +91-XXXXXXXXXX
        └── Emergency Contact: Configured
```

## Faculty Roles Distribution

```
Total Faculty: 125 (5 per institute × 25 institutes)

Role Breakdown:
├── HOD (Professor)         : 25 (1 per institute)
│   └── Also serves as Institute HOD
│
├── FACULTY (Assoc Prof)    : 25 (1 per institute)
│
├── FACULTY (Asst Prof)     : 25 (1 per institute)
│
├── COUNSELOR               : 25 (1 per institute)
│   └── Student mental health support
│
└── MENTOR                  : 25 (1 per institute)
    └── Student mentorship
```

## Student-Mentor Relationship

```
Each Institute (25 total):
│
├── Faculty (5)
│   ├── Prof. (HOD)
│   ├── Dr. (Faculty) 
│   ├── Dr. (Faculty)
│   ├── Ms. (Counselor)
│   └── Mr. (Mentor)
│
└── Students (10)
    ├── Student 1 → Randomly assigned to one of 5 faculty
    ├── Student 2 → Randomly assigned to one of 5 faculty
    ├── Student 3 → Randomly assigned to one of 5 faculty
    └── ... (all 10 students have a mentor)
```

## Email Pattern Flow

```
University Domain: iitd.ac.in

Institute: CSE (Computer Science)

Faculty Email Pattern:
{prefix}.{firstname}.{lastname}.{dept}@{domain}
Examples:
├── prof.amit.sharma.cse@iitd.ac.in
├── dr.priya.patel.cse@iitd.ac.in
└── ms.sneha.singh.cse@iitd.ac.in

Student Email Pattern:
{firstname}.{lastname}.{dept}@student.{domain}
Examples:
├── aarav.kumar.cse@student.iitd.ac.in
├── vivaan.sharma.cse@student.iitd.ac.in
└── diya.reddy.cse@student.iitd.ac.in
```

## Data Flow: University → Institute → Department → Batch → Students

```
┌─────────────────────────────────────────────────────────┐
│ University: IIT Delhi                                   │
│ ├── Domain: iitd.ac.in                                 │
│ └── AISHE: U-0101                                       │
└─────────────────────────────────────────────────────────┘
            │
            ├─── Institute: CSE (U-0101-CSE)
            │    │
            │    ├─── Department: CSE (DEPT-CSE)
            │    │    │
            │    │    ├─── Batch: 2023-2027 (Sem 5)
            │    │    │    │
            │    │    │    └─── Students: 10
            │    │    │         (Enrollment: U-0101-CSE-2023-XXXX)
            │    │    │
            │    │    └─── Faculty: 5
            │    │         (Email: name.cse@iitd.ac.in)
            │    │
            ├─── Institute: ECE (U-0101-ECE)
            │    └─── [Same structure]
            │
            ├─── Institute: MBA (U-0101-MBA)
            │    └─── [Same structure]
            │
            ├─── Institute: SCI (U-0101-SCI)
            │    └─── [Same structure]
            │
            └─── Institute: HSS (U-0101-HSS)
                 └─── [Same structure]
```

## Complete Hierarchy

```
                    ┌──────────────┐
                    │ Super Admin  │
                    │      (1)     │
                    └──────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
   ┌────▼────┐                         ┌───▼────┐
   │ Fields  │                         │ Users  │
   │   (6)   │                         │ (376)  │
   └────┬────┘                         └───┬────┘
        │                                  │
        │    ┌──────────────┐              │
        └────► Universities ◄──────────────┘
             │     (5)      │
             └──────┬───────┘
                    │
             ┌──────▼───────┐
             │  Institutes  │
             │     (25)     │
             └──────┬───────┘
                    │
          ┌─────────┴─────────┐
          │                   │
    ┌─────▼──────┐      ┌────▼─────┐
    │ Departments│      │ Faculty  │
    │    (25)    │      │  (125)   │
    └─────┬──────┘      └──────────┘
          │                   │
    ┌─────▼──────┐            │
    │  Batches   │            │
    │    (25)    │            │
    └─────┬──────┘            │
          │                   │
    ┌─────▼──────┐            │
    │  Students  ◄────────────┘
    │   (250)    │   (mentorship)
    └────────────┘
```

## Legend

- **→** : One-to-Many Relationship
- **←** : References/Points to
- **◄** : Has/Contains
- **×5** : Multiplied by 5
- **[...]** : Repeated structure

## Total Counts Summary

```
┌────────────────────────────────────┐
│ Entity            │ Count          │
├────────────────────────────────────┤
│ Super Admin       │ 1              │
│ Universities      │ 5              │
│ Fields            │ 6              │
│ Institutes        │ 25             │
│ Departments       │ 25             │
│ Batches           │ 25             │
│ Faculty           │ 125            │
│ Students          │ 250            │
├────────────────────────────────────┤
│ Total Users       │ 376            │
│ Total Entities    │ 462            │
└────────────────────────────────────┘
```

---

**Note:** All relationships are properly maintained with foreign keys in the database.
**Password for all users:** `12345678`
