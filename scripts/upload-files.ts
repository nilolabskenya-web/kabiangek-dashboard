/**
 * Upload existing lesson files to Vercel Blob + update lesson metadata.
 * Usage: BLOB_READ_WRITE_TOKEN=*** npx tsx scripts/upload-files.ts
 */

import { put } from '@vercel/blob';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const OUTPUT_DIR = resolve(process.env.HOME || '/home/ubuntu', '.hermes/output');

// Mapping: standard filename → lesson ID
const FILE_MAP: Record<string, { lessonId: string; weekStart: string }> = {
  // ── June 1-5 Week ──
  'G7_Agri_Mon_Notes.docx':        { lessonId: '2026-06-01-g7-agriculture', weekStart: '2026-06-01' },
  'G7_Agri_Mon_Slides.pptx':       { lessonId: '2026-06-01-g7-agriculture', weekStart: '2026-06-01' },
  'G9_Pretech_Tue_Notes.docx':     { lessonId: '2026-06-02-g9-pre-tech',    weekStart: '2026-06-01' },
  'G9_Pretech_Tue_Slides.pptx':    { lessonId: '2026-06-02-g9-pre-tech',    weekStart: '2026-06-01' },
  'G7_Agri_Tue_Notes.docx':        { lessonId: '2026-06-02-g7-agriculture', weekStart: '2026-06-01' },
  'G7_Agri_Wed_Notes.docx':        { lessonId: '2026-06-03-g7-agriculture', weekStart: '2026-06-01' },
  'G7_Pretech_Thu_Notes.docx':     { lessonId: '2026-06-04-g7-pre-tech',    weekStart: '2026-06-01' },
  'G9_Pretech_Fri_Notes.docx':     { lessonId: '2026-06-05-g9-pre-tech',    weekStart: '2026-06-01' },
  'G7_Pretech_Fri_Notes.docx':     { lessonId: '2026-06-05-g7-pre-tech',    weekStart: '2026-06-01' },
  'G7_Pretech_Fri_Slides.pptx':    { lessonId: '2026-06-05-g7-pre-tech',    weekStart: '2026-06-01' },
};

type LessonMeta = { topic?: string; notesPath?: string; slidesPath?: string };

async function main() {
  console.log('📤 Uploading lesson files to Vercel Blob...\n');

  // Group URLs by week
  const weekData: Record<string, Record<string, LessonMeta>> = {};

  for (const [filename, { lessonId, weekStart }] of Object.entries(FILE_MAP)) {
    const filePath = resolve(OUTPUT_DIR, filename);
    if (!existsSync(filePath)) {
      console.log(`   ⚠️  ${filename} — not found, skipping`);
      continue;
    }

    const content = readFileSync(filePath);
    const isDocx = filename.endsWith('.docx');
    const ct = isDocx
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

    const { url } = await put(`files/${filename}`, content, {
      access: 'public',
      contentType: ct,
      allowOverwrite: true,
    });

    console.log(`   ✅ ${filename} → ${url.slice(0, 60)}...`);

    // Build lesson metadata
    if (!weekData[weekStart]) weekData[weekStart] = {};
    if (!weekData[weekStart][lessonId]) weekData[weekStart][lessonId] = {};

    if (isDocx) {
      weekData[weekStart][lessonId].notesPath = url;
    } else {
      weekData[weekStart][lessonId].slidesPath = url;
    }
  }

  // Upload updated lesson metadata
  console.log('\n📝 Updating lesson metadata...');
  for (const [weekStart, lessons] of Object.entries(weekData)) {
    await put(`data/lessons/${weekStart}.json`, JSON.stringify(lessons, null, 2), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true,
    });
    console.log(`   ✅ ${weekStart} — ${Object.keys(lessons).length} lessons updated`);
  }

  console.log('\n🎉 Files uploaded! Refresh the dashboard to see download links.');
}

main().catch((e) => {
  console.error('❌ Upload failed:', e);
  process.exit(1);
});
