// This script checks if the database has data, and only seeds if empty
const { execSync } = require('child_process');

async function main() {
  try {
    // Use npx tsx to run a quick check
    const result = execSync(`npx tsx -e "
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function check() {
  const count = await db.company.count()
  console.log(count)
  await db.\$disconnect()
}
check()
"`, { encoding: 'utf-8', timeout: 30000 });
    
    const count = parseInt(result.trim().split('\n').pop() || '0');
    
    if (count === 0) {
      console.log('📦 Database is empty, running seed...');
      execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', timeout: 120000 });
    } else {
      console.log(`✅ Database has ${count} companies, skipping seed.`);
    }
  } catch (error) {
    console.log('⚠️ Could not check database, skipping seed. Error:', error.message?.substring(0, 200));
  }
}

main();
