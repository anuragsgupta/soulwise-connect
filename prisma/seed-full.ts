import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = '12345678';

async function main() {
  console.log('🌱 Starting comprehensive database seed...');

  // Hash the default password once
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  // Create default Super Admin
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@mannmitra.com';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
  const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Administrator';

  let superAdmin;

  // Check if super admin already exists
  const existingSuperAdmin = await prisma.admin.findFirst({
    where: {
      OR: [
        { isSuperAdmin: true },
        { email: superAdminEmail }
      ]
    }
  });

  if (existingSuperAdmin) {
    console.log('✅ Super Admin already exists');
    console.log(`   Email: ${existingSuperAdmin.email}`);
    console.log(`   Name: ${existingSuperAdmin.name}`);
    superAdmin = existingSuperAdmin;
  } else {
    // Hash password
    const superAdminPasswordHash = await bcrypt.hash(superAdminPassword, 12);

    // Create super admin
    superAdmin = await prisma.admin.create({
      data: {
        name: superAdminName,
        email: superAdminEmail,
        passwordHash: superAdminPasswordHash,
        adminType: 'SUPER_ADMIN',
        status: 'ACTIVE',
        isSuperAdmin: true,
        phone: '+91-1234567890',
        address: 'Ministry of Education, Government of India'
      }
    });

    console.log('✅ Default Super Admin created successfully!');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Super Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email:    ${superAdmin.email}`);
    console.log(`   Password: ${superAdminPassword}`);
    console.log(`   Name:     ${superAdmin.name}`);
    console.log(`   ID:       ${superAdmin.id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // Log the creation
    await prisma.auditLog.create({
      data: {
        performedById: superAdmin.id,
        performedByType: 'ADMIN',
        action: 'CREATE',
        tableName: 'admins',
        recordId: superAdmin.id,
        newValues: {
          email: superAdmin.email,
          name: superAdmin.name,
          adminType: superAdmin.adminType,
          isSuperAdmin: true
        },
        timestamp: new Date()
      }
    });
  }

  // Create sample fields if they don't exist
  console.log('\n📚 Creating fields...');
  const fieldsData = [
    { name: 'Engineering', description: 'Engineering and Technology fields' },
    { name: 'Medical', description: 'Medical and Health Sciences' },
    { name: 'Arts', description: 'Arts and Humanities' },
    { name: 'Commerce', description: 'Commerce and Business Studies' },
    { name: 'Science', description: 'Pure Sciences' },
    { name: 'Law', description: 'Law and Legal Studies' },
  ];

  const fields = [];
  for (const fieldData of fieldsData) {
    let field = await prisma.field.findFirst({
      where: { name: fieldData.name }
    });

    if (!field) {
      field = await prisma.field.create({ data: fieldData });
      console.log(`✅ Created field: ${fieldData.name}`);
    } else {
      console.log(`✓ Field already exists: ${fieldData.name}`);
    }
    fields.push(field);
  }

  // Create 5 Universities in India
  console.log('\n🏛️ Creating universities...');
  const universitiesData = [
    {
      name: 'Indian Institute of Technology Delhi',
      email: 'admin@iitd.ac.in',
      domain: 'iitd.ac.in',
      phone: '+91-11-26591999',
      address: 'Hauz Khas',
      city: 'New Delhi',
      state: 'Delhi',
      district: 'South Delhi',
      aisheCode: 'U-0101',
      contactFirstName: 'Ravi',
      contactLastName: 'Kumar'
    },
    {
      name: 'University of Mumbai',
      email: 'admin@mu.ac.in',
      domain: 'mu.ac.in',
      phone: '+91-22-26543000',
      address: 'Vidyanagari Campus, Kalina',
      city: 'Mumbai',
      state: 'Maharashtra',
      district: 'Mumbai Suburban',
      aisheCode: 'U-0102',
      contactFirstName: 'Priya',
      contactLastName: 'Sharma'
    },
    {
      name: 'Anna University',
      email: 'admin@annauniv.edu',
      domain: 'annauniv.edu',
      phone: '+91-44-22351723',
      address: 'Sardar Patel Road, Guindy',
      city: 'Chennai',
      state: 'Tamil Nadu',
      district: 'Chennai',
      aisheCode: 'U-0103',
      contactFirstName: 'Rajesh',
      contactLastName: 'Krishnan'
    },
    {
      name: 'Jawaharlal Nehru University',
      email: 'admin@jnu.ac.in',
      domain: 'jnu.ac.in',
      phone: '+91-11-26704000',
      address: 'New Mehrauli Road',
      city: 'New Delhi',
      state: 'Delhi',
      district: 'South Delhi',
      aisheCode: 'U-0104',
      contactFirstName: 'Aisha',
      contactLastName: 'Khan'
    },
    {
      name: 'University of Calcutta',
      email: 'admin@caluniv.ac.in',
      domain: 'caluniv.ac.in',
      phone: '+91-33-22410071',
      address: 'Senate House, 87/1 College Street',
      city: 'Kolkata',
      state: 'West Bengal',
      district: 'Kolkata',
      aisheCode: 'U-0105',
      contactFirstName: 'Amit',
      contactLastName: 'Chatterjee'
    }
  ];

  const universities = [];
  for (const uniData of universitiesData) {
    // Check by email, domain, or aisheCode since all are unique
    let university = await prisma.university.findFirst({
      where: {
        OR: [
          { email: uniData.email },
          { domain: uniData.domain },
          { aisheCode: uniData.aisheCode }
        ]
      }
    });

    if (!university) {
      university = await prisma.university.create({
        data: uniData
      });
      console.log(`✅ Created university: ${university.name}`);
    } else {
      console.log(`✓ University already exists: ${university.name}`);
    }
    universities.push(university);
  }

  // Real institutes for each university
  const universityInstitutes = {
    'iitd.ac.in': [
      { name: 'Department of Computer Science and Engineering', code: 'CSE', fieldIndex: 0 },
      { name: 'Department of Electrical Engineering', code: 'EE', fieldIndex: 0 },
      { name: 'Department of Mechanical Engineering', code: 'ME', fieldIndex: 0 },
      { name: 'Department of Mathematics', code: 'MATHS', fieldIndex: 4 },
      { name: 'Department of Physics', code: 'PHY', fieldIndex: 4 }
    ],
    'mu.ac.in': [
      { name: 'Institute of Distance and Open Learning', code: 'IDOL', fieldIndex: 2 },
      { name: 'Jankidevi Bajaj Institute of Management Studies', code: 'JBIMS', fieldIndex: 3 },
      { name: 'Sir J.J. College of Architecture', code: 'JJCA', fieldIndex: 0 },
      { name: 'Department of Commerce', code: 'COM', fieldIndex: 3 },
      { name: 'Department of Chemistry', code: 'CHEM', fieldIndex: 4 }
    ],
    'annauniv.edu': [
      { name: 'Faculty of Civil Engineering', code: 'CIVIL', fieldIndex: 0 },
      { name: 'Faculty of Electrical and Electronics Engineering', code: 'EEE', fieldIndex: 0 },
      { name: 'Faculty of Information and Communication Engineering', code: 'ICE', fieldIndex: 0 },
      { name: 'Faculty of Mechanical Engineering', code: 'MECH', fieldIndex: 0 },
      { name: 'Centre for University-Industry Collaboration', code: 'CUIC', fieldIndex: 0 }
    ],
    'jnu.ac.in': [
      { name: 'School of International Studies', code: 'SIS', fieldIndex: 2 },
      { name: 'School of Social Sciences', code: 'SSS', fieldIndex: 2 },
      { name: 'School of Language, Literature & Culture Studies', code: 'SLLCS', fieldIndex: 2 },
      { name: 'School of Computer and Systems Sciences', code: 'SCSS', fieldIndex: 0 },
      { name: 'School of Life Sciences', code: 'SLS', fieldIndex: 4 }
    ],
    'caluniv.ac.in': [
      { name: 'Department of English', code: 'ENG', fieldIndex: 2 },
      { name: 'Department of History', code: 'HIST', fieldIndex: 2 },
      { name: 'Department of Economics', code: 'ECON', fieldIndex: 3 },
      { name: 'Department of Applied Mathematics', code: 'APMATH', fieldIndex: 4 },
      { name: 'Department of Computer Science', code: 'CS', fieldIndex: 0 }
    ]
  };

  console.log('\n🏢 Creating institutes and departments...');
  
  for (const university of universities) {
    console.log(`\n  University: ${university.name}`);
    
    // Get the institutes for this university
    const instituteTemplates = universityInstitutes[university.domain];
    
    for (let i = 0; i < instituteTemplates.length; i++) {
      const template = instituteTemplates[i];
      const instituteCode = `${university.aisheCode}-${template.code}`;
      const instituteEmail = `${template.code.toLowerCase()}@${university.domain}`;
      const instituteAisheCode = `${university.aisheCode}-I-${String(i + 1).padStart(2, '0')}`;
      
      // Check by code, email, or aisheCode since all are unique
      let institute = await prisma.institute.findFirst({
        where: {
          OR: [
            { code: instituteCode },
            { email: instituteEmail },
            { aisheCode: instituteAisheCode }
          ]
        }
      });

      if (!institute) {
        institute = await prisma.institute.create({
          data: {
            code: instituteCode,
            name: template.name,
            email: instituteEmail,
            phone: university.phone,
            address: university.address,
            universityId: university.id,
            fieldId: fields[template.fieldIndex].id,
            aisheCode: instituteAisheCode
          }
        });
        console.log(`    ✅ Created institute: ${institute.name}`);
      } else {
        console.log(`    ✓ Institute already exists: ${institute.name}`);
      }

      // Create a department for this institute
      const deptCode = `DEPT-${template.code}`;
      let department = await prisma.department.findFirst({
        where: {
          code: deptCode,
          instituteId: institute.id
        }
      });

      if (!department) {
        department = await prisma.department.create({
          data: {
            code: deptCode,
            name: template.name,
            instituteId: institute.id
          }
        });
        console.log(`      ✅ Created department: ${department.name}`);
      } else {
        console.log(`      ✓ Department already exists: ${department.name}`);
      }

      // Create a batch for this department
      const currentYear = new Date().getFullYear();
      let batch = await prisma.batch.findFirst({
        where: {
          departmentId: department.id,
          startYear: currentYear - 2
        }
      });

      if (!batch) {
        batch = await prisma.batch.create({
          data: {
            name: `Batch ${currentYear - 2}-${currentYear + 2}`,
            startYear: currentYear - 2,
            endYear: currentYear + 2,
            currentSemester: 5,
            departmentId: department.id
          }
        });
      }

      // Create 5 faculty members with different roles
      console.log(`      👨‍🏫 Creating faculty members...`);
      const facultyRoles = [
        { type: 'HOD', title: 'Professor and Head', name: 'Prof. ' },
        { type: 'FACULTY', title: 'Associate Professor', name: 'Dr. ' },
        { type: 'FACULTY', title: 'Assistant Professor', name: 'Dr. ' },
        { type: 'COUNSELOR', title: 'Student Counselor', name: 'Ms. ' },
        { type: 'MENTOR', title: 'Faculty Mentor', name: 'Mr. ' }
      ];

      const indianFirstNames = ['Amit', 'Priya', 'Rajesh', 'Sneha', 'Vikram', 'Anjali', 'Suresh', 'Kavita', 'Arjun', 'Meera'];
      const indianLastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Verma', 'Gupta', 'Krishnan', 'Rao', 'Mehta'];

      const faculties = [];
      for (let j = 0; j < 5; j++) {
        const role = facultyRoles[j];
        const firstNameIdx = (i * 5 + j) % indianFirstNames.length;
        const lastNameIdx = (i * 5 + j) % indianLastNames.length;
        const firstName = indianFirstNames[firstNameIdx];
        const lastName = indianLastNames[lastNameIdx];
        const facultyEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${template.code.toLowerCase()}@${university.domain}`;

        let faculty = await prisma.faculty.findUnique({
          where: { email: facultyEmail }
        });

        if (!faculty) {
          faculty = await prisma.faculty.create({
            data: {
              name: `${role.name}${firstName} ${lastName}`,
              email: facultyEmail,
              passwordHash,
              phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
              address: `${university.city}, ${university.state}`,
              jobTitle: role.title,
              facultyType: role.type as any,
              status: 'ACTIVE',
              availabilityStatus: 'AVAILABLE',
              yearsOfExperience: Math.floor(Math.random() * 15) + 5,
              universityId: university.id,
              instituteId: institute.id,
              departmentId: department.id
            }
          });
        }
        faculties.push(faculty);
      }

      // Set the first faculty as HOD
      if (faculties.length > 0) {
        await prisma.department.update({
          where: { id: department.id },
          data: { hodId: faculties[0].id }
        });

        await prisma.institute.update({
          where: { id: institute.id },
          data: { hodId: faculties[0].id }
        });
      }

      // Create 10 students
      console.log(`      👨‍🎓 Creating students...`);
      const studentFirstNames = ['Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Sai', 'Diya', 'Ananya', 'Isha', 'Pari', 'Aadhya'];
      const studentLastNames = ['Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy', 'Nair', 'Iyer', 'Joshi', 'Desai', 'Kapoor'];

      for (let k = 0; k < 10; k++) {
        const firstName = studentFirstNames[k];
        const lastName = studentLastNames[k];
        const enrollmentId = `${instituteCode}-${currentYear - 2}-${String(k + 1).padStart(4, '0')}`;
        const studentEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${template.code.toLowerCase()}@student.${university.domain}`;

        let student = await prisma.student.findUnique({
          where: { email: studentEmail }
        });

        if (!student) {
          student = await prisma.student.create({
            data: {
              name: `${firstName} ${lastName}`,
              email: studentEmail,
              passwordHash,
              enrollmentId,
              rollNumber: `${currentYear - 2}${String(k + 1).padStart(3, '0')}`,
              phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
              parentPhone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
              emergencyContactName: `Parent of ${firstName}`,
              emergencyContactPhone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
              currentSemester: 5,
              cgpa: (Math.random() * 4 + 6).toFixed(2),
              admissionYear: currentYear - 2,
              status: 'ACTIVE',
              universityId: university.id,
              instituteId: institute.id,
              departmentId: department.id,
              batchId: batch.id,
              mentorId: faculties[Math.floor(Math.random() * faculties.length)].id
            }
          });
        }
      }
    }
  }

  console.log('');
  console.log('🎉 Database seed completed successfully!');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Universities: 5`);
  console.log(`   Institutes: 25 (5 per university)`);
  console.log(`   Departments: 25`);
  console.log(`   Faculty: 125 (5 per institute)`);
  console.log(`   Students: 250 (10 per institute)`);
  console.log(`   Default Password: ${DEFAULT_PASSWORD}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Next steps:');
  console.log('1. Visit http://localhost:3000/login');
  console.log(`2. Login with any user email and password: ${DEFAULT_PASSWORD}`);
  console.log(`3. Super Admin: ${superAdminEmail}`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
