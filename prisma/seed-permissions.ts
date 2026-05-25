import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const MODULES = ['HR', 'Payroll', 'Attendance', 'Performance', 'Learning', 'Analytics', 'Recruitment', 'ProjectManagement']

async function main() {
  console.log('🔐 Seeding role permissions...')

  const roles = await db.role.findMany()

  for (const role of roles) {
    // Parse the JSON permissions field
    let permMap: Record<string, { read?: boolean; write?: boolean; modify?: boolean; delete?: boolean; admin?: boolean }> = {}
    if (role.permissions) {
      try {
        permMap = JSON.parse(role.permissions)
      } catch {
        console.warn(`Could not parse permissions for role ${role.name}`)
      }
    }

    for (const module of MODULES) {
      const modulePerms = permMap[module] || {}

      // Map "Recruitment" in JSON to "Recruitment" in DB, etc.
      const existing = await db.rolePermission.findUnique({
        where: { roleId_module: { roleId: role.id, module } },
      })

      if (existing) {
        continue // Skip if already exists
      }

      await db.rolePermission.create({
        data: {
          roleId: role.id,
          module,
          canRead: modulePerms.read ?? false,
          canWrite: modulePerms.write ?? false,
          canModify: modulePerms.modify ?? false,
          canDelete: modulePerms.delete ?? false,
          canAdmin: modulePerms.admin ?? false,
        },
      })
    }
    console.log(`  Seeded permissions for role: ${role.name}`)
  }

  console.log('✅ Role permissions seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
