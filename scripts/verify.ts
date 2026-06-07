// Quick check: does Vercel Blob have our data?
import { list, head } from '@vercel/blob';

async function main() {
  console.log('Checking blob store...\n');

  // Try to list all blobs
  console.log('1. Listing all blobs:');
  try {
    const { blobs } = await list();
    console.log(`   Found ${blobs.length} blobs`);
    for (const b of blobs.slice(0, 10)) {
      console.log(`   - ${b.pathname} (${b.size} bytes, ${b.uploadedAt})`);
    }
  } catch (e: any) {
    console.error(`   ERROR: ${e.message}`);
  }

  // Try specific files
  console.log('\n2. Checking specific files:');
  for (const path of ['data/attendance.json', 'data/lessons/2026-05-25.json', 'data/lessons/2026-06-01.json']) {
    try {
      const result = await head(path);
      console.log(`   ✅ ${path} — exists, ${result.size} bytes`);
    } catch (e: any) {
      console.log(`   ❌ ${path} — ${e.message}`);
    }
  }
}

main().catch(console.error);
