import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default Super Admin
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@soulwise.connect';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@2024';
  const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Administrator';

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
  } else {
    // Hash password
    const passwordHash = await bcrypt.hash(superAdminPassword, 12);

    // Create super admin
    const superAdmin = await prisma.admin.create({
      data: {
        name: superAdminName,
        email: superAdminEmail,
        passwordHash,
        adminType: 'SUPER_ADMIN',
        status: 'ACTIVE',
        isSuperAdmin: true, // This is the permanent super admin
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
    console.log('⚠️  IMPORTANT: Please change the password after first login!');
    console.log('⚠️  This super admin CANNOT be deleted from the system.');
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
  const fieldsData = [
    { name: 'Engineering', description: 'Engineering and Technology fields' },
    { name: 'Medical', description: 'Medical and Health Sciences' },
    { name: 'Arts', description: 'Arts and Humanities' },
    { name: 'Commerce', description: 'Commerce and Business Studies' },
    { name: 'Science', description: 'Pure Sciences' },
    { name: 'Law', description: 'Law and Legal Studies' },
  ];

  for (const fieldData of fieldsData) {
    const existingField = await prisma.field.findFirst({
      where: { name: fieldData.name }
    });

    if (!existingField) {
      await prisma.field.create({ data: fieldData });
      console.log(`✅ Created field: ${fieldData.name}`);
    }
  }

  console.log('');
  console.log('🎉 Database seed completed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Visit http://localhost:3000/login');
  console.log(`2. Login with email: ${superAdminEmail}`);
  console.log('3. Start creating universities and admins!');
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
