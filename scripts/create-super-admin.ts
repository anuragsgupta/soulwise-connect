/**
 * Script to create or verify Super Admin account
 * Run: npx ts-node scripts/create-super-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('🔍 Checking for existing Super Admin...\n');

    // Check if super admin already exists
    const existingSuperAdmin = await prisma.admin.findFirst({
      where: {
        adminType: 'SUPER_ADMIN',
        isSuperAdmin: true,
      },
    });

    if (existingSuperAdmin) {
      console.log('✅ Super Admin already exists!');
      console.log('📧 Email:', existingSuperAdmin.email);
      console.log('👤 Name:', existingSuperAdmin.name);
      console.log('🆔 ID:', existingSuperAdmin.id);
      console.log('\nℹ️  No action needed.\n');
      return;
    }

    console.log('❌ No Super Admin found. Creating one...\n');

    // Super Admin credentials
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@soulwise.com';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
    const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Administrator';

    // Hash password
    const passwordHash = await bcrypt.hash(superAdminPassword, 12);

    // Create Super Admin
    const superAdmin = await prisma.admin.create({
      data: {
        name: superAdminName,
        email: superAdminEmail,
        passwordHash: passwordHash,
        adminType: 'SUPER_ADMIN',
        isSuperAdmin: true,
        status: 'ACTIVE',
      },
    });

    console.log('✅ Super Admin created successfully!\n');
    console.log('='.repeat(50));
    console.log('📋 SUPER ADMIN CREDENTIALS');
    console.log('='.repeat(50));
    console.log('📧 Email:', superAdminEmail);
    console.log('🔑 Password:', superAdminPassword);
    console.log('👤 Name:', superAdminName);
    console.log('🆔 ID:', superAdmin.id);
    console.log('='.repeat(50));
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!');
    console.log('⚠️  Store these credentials securely.\n');

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tableName: 'admins',
        recordId: superAdmin.id,
        action: 'CREATE',
        performedById: superAdmin.id,
        performedByType: 'ADMIN',
        newValues: {
          email: superAdmin.email,
          name: superAdmin.name,
          adminType: superAdmin.adminType,
          isSuperAdmin: true,
          createdBy: 'SYSTEM_SCRIPT',
        },
        timestamp: new Date(),
      },
    });

    console.log('📝 Audit log created.\n');

  } catch (error) {
    console.error('❌ Error creating Super Admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createSuperAdmin()
  .then(() => {
    console.log('✨ Script completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
