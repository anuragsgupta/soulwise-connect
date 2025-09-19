import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create SuperAdmin user
  console.log('Creating SuperAdmin user...');
  const superAdminEmail = 'superadmin@mannmitra.com';
  
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingSuperAdmin) {
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    console.log(`✅ Created SuperAdmin user: ${superAdminEmail}`);
    console.log(`🔑 Default password: admin123 (change immediately!)`);
  } else {
    console.log(`ℹ️  SuperAdmin user already exists: ${superAdminEmail}`);
  }

  // Create sample university
  console.log('Creating sample university...');
  const sampleUniversity = await prisma.university.upsert({
    where: { domain: 'du.ac.in' },
    update: {},
    create: {
      name: 'Delhi University',
      domain: 'du.ac.in',
      address: 'University Enclave, Delhi, India',
      establishedYear: 1922,
      contactEmail: 'admin@du.ac.in',
      contactPhone: '+91-11-27666613',
      website: 'https://du.ac.in',
      isActive: true,
    },
  });

  console.log(`✅ Created/Updated university: ${sampleUniversity.name}`);

  // Create sample institute
  console.log('Creating sample institute...');
  const sampleInstitute = await prisma.institute.upsert({
    where: { code: 'DU-COLLEGE-001' },
    update: {},
    create: {
      universityId: sampleUniversity.id,
      name: 'St. Stephen\'s College',
      code: 'DU-COLLEGE-001',
      address: 'University Enclave, Delhi, India',
      contactEmail: 'admin@ststephens.edu',
      contactPhone: '+91-11-27667271',
      isActive: true,
    },
  });

  console.log(`✅ Created/Updated institute: ${sampleInstitute.name}`);

  // Create audit log entry
  const auditLog = await prisma.auditLog.create({
    data: {
      action: 'DATABASE_SEEDED',
      tableName: 'system',
      userId: existingSuperAdmin?.id || (await prisma.user.findUnique({ where: { email: superAdminEmail } }))?.id || '',
      details: { message: 'Database seeding completed successfully' },
    },
  });

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log('- 1 SuperAdmin user created');
  console.log('- 1 sample university created');
  console.log('- 1 sample institute created');
  console.log('- Initial audit log created');
  console.log('\n🚀 Next steps:');
  console.log('1. Update SuperAdmin password');
  console.log('2. Start the application');
  console.log('3. Login as SuperAdmin to create more universities');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });