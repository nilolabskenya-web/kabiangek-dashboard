/**
 * Comprehensive backfill: upload ALL lesson files with correct week assignments.
 * 
 * Usage via dashboard API (no local token needed):
 *   npx tsx scripts/backfill-all.ts
 */

const DASHBOARD = 'https://kabiangek-dashboard.vercel.app';
const OUTPUT_DIR = '/home/ubuntu/.hermes/output';

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

// ── File → (lessonId, weekStart, topic, isDocx) ──

interface FileEntry {
  filename: string;
  lessonId: string;
  weekStart: string;
  topic: string;
  isDocx: boolean;  // true=notes, false=slides
}

const FILES: FileEntry[] = [
  // ── Week of May 4–8 (earliest files, generated May 11) ──
  { filename: 'G7_Agri_L1_Weeding_Thinning_Gapping_LearnerNotes.docx', lessonId: '2026-05-04-g7-agriculture',  weekStart: '2026-05-04', topic: 'Weeding, Thinning & Gapping', isDocx: true },
  { filename: 'G7_Agri_L1_Weeding_Thinning_Slides.pptx',               lessonId: '2026-05-04-g7-agriculture',  weekStart: '2026-05-04', topic: 'Weeding, Thinning & Gapping', isDocx: false },

  { filename: 'G9_Pretech_L1_VisualProgramming_LearnerNotes.docx',     lessonId: '2026-05-05-g9-pre-tech',     weekStart: '2026-05-04', topic: 'Visual Programming: Introduction & Basics', isDocx: true },
  { filename: 'G9_Pretech_L1_VisualProgramming_Slides.pptx',           lessonId: '2026-05-05-g9-pre-tech',     weekStart: '2026-05-04', topic: 'Visual Programming: Introduction & Basics', isDocx: false },
  { filename: 'G7_Agri_L2_Earthing_Hardening_LearnerNotes.docx',       lessonId: '2026-05-05-g7-agriculture',  weekStart: '2026-05-04', topic: 'Earthing & Hardening', isDocx: true },

  { filename: 'G7_Agri_L3_Importance_CropMgmt_LearnerNotes.docx',      lessonId: '2026-05-06-g7-agriculture',  weekStart: '2026-05-04', topic: 'Importance of Crop Management', isDocx: true },

  { filename: 'G7_Pretech_L1_TypesOfLines_Pt1_LearnerNotes.docx',      lessonId: '2026-05-07-g7-pre-tech',     weekStart: '2026-05-04', topic: 'Types of Lines — Part 1', isDocx: true },

  { filename: 'G9_Pretech_L2_VisualProgramming_Uses_LearnerNotes.docx', lessonId: '2026-05-08-g9-pre-tech',    weekStart: '2026-05-04', topic: 'Visual Programming: Uses & Applications', isDocx: true },
  { filename: 'G7_Pretech_L2_TypesOfLines_Pt2_LearnerNotes.docx',      lessonId: '2026-05-08-g7-pre-tech',     weekStart: '2026-05-04', topic: 'Types of Lines — Part 2', isDocx: true },
  { filename: 'G7_Pretech_L2_TypesOfLines_Slides.pptx',                lessonId: '2026-05-08-g7-pre-tech',     weekStart: '2026-05-04', topic: 'Types of Lines — Part 2', isDocx: false },

  // ── Week of May 25–29 (overwritten, not available) ──
  // Files for this week were overwritten by June 1-5 generation.

  // ── Week of June 1–5 (standard cron files) ──
  { filename: 'G7_Agri_Mon_Notes.docx',    lessonId: '2026-06-01-g7-agriculture', weekStart: '2026-06-01', topic: 'Crochet: Meaning, Tools, Materials & Basic Stitches', isDocx: true },
  { filename: 'G7_Agri_Mon_Slides.pptx',   lessonId: '2026-06-01-g7-agriculture', weekStart: '2026-06-01', topic: 'Crochet: Meaning, Tools, Materials & Basic Stitches', isDocx: false },
  { filename: 'G9_Pretech_Tue_Notes.docx',  lessonId: '2026-06-02-g9-pre-tech',    weekStart: '2026-06-01', topic: 'Environmental Conservation: Meaning, Importance & Degradation', isDocx: true },
  { filename: 'G9_Pretech_Tue_Slides.pptx', lessonId: '2026-06-02-g9-pre-tech',    weekStart: '2026-06-01', topic: 'Environmental Conservation: Meaning, Importance & Degradation', isDocx: false },
  { filename: 'G7_Agri_Tue_Notes.docx',     lessonId: '2026-06-02-g7-agriculture', weekStart: '2026-06-01', topic: 'Crochet Patterns & Advanced Techniques', isDocx: true },
  { filename: 'G7_Agri_Wed_Notes.docx',     lessonId: '2026-06-03-g7-agriculture', weekStart: '2026-06-01', topic: 'Practical Crochet Projects & Strand 4 Review', isDocx: true },
  { filename: 'G7_Pretech_Thu_Notes.docx',  lessonId: '2026-06-04-g7-pre-tech',    weekStart: '2026-06-01', topic: 'Introduction to Entrepreneurship: Meaning of Entrepreneur', isDocx: true },
  { filename: 'G9_Pretech_Fri_Notes.docx',  lessonId: '2026-06-05-g9-pre-tech',    weekStart: '2026-06-01', topic: 'Environmental Conservation Methods & Practices', isDocx: true },
  { filename: 'G7_Pretech_Fri_Notes.docx',  lessonId: '2026-06-05-g7-pre-tech',    weekStart: '2026-06-01', topic: 'Characteristics of Entrepreneurs & Types of Business Enterprises', isDocx: true },
  { filename: 'G7_Pretech_Fri_Slides.pptx', lessonId: '2026-06-05-g7-pre-tech',    weekStart: '2026-06-01', topic: 'Characteristics of Entrepreneurs & Types of Business Enterprises', isDocx: false },
];

type LessonMeta = { topic: string; notesPath?: string; slidesPath?: string };

async function uploadFile(filepath: string, filename: string): Promise<string> {
  const formData = new FormData();
  const content = new Blob([readFileSync(filepath)]);
  formData.append('file', content, filename);
  formData.append('filename', filename);

  const res = await fetch(`${DASHBOARD}/api/files`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error(`Upload failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.url;
}

async function updateLessons(weekStart: string, lessons: Record<string, LessonMeta>) {
  const res = await fetch(`${DASHBOARD}/api/lessons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weekStart, lessons }),
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status} ${await res.text()}`);
}

async function main() {
  console.log('📤 Backfilling ALL lesson files...\n');

  // Group by week
  const weekGroups: Record<string, FileEntry[]> = {};
  for (const entry of FILES) {
    if (!weekGroups[entry.weekStart]) weekGroups[entry.weekStart] = [];
    weekGroups[entry.weekStart].push(entry);
  }

  let uploaded = 0;
  let skipped = 0;

  for (const [weekStart, entries] of Object.entries(weekGroups)) {
    console.log(`\n━━━ Week ${weekStart} (${entries.length} files) ━━━`);

    // Build lesson metadata: lessonId → { topic, notesPath, slidesPath }
    const lessons: Record<string, LessonMeta> = {};

    // First pass: set topics
    for (const e of entries) {
      if (!lessons[e.lessonId]) {
        lessons[e.lessonId] = { topic: e.topic };
      }
    }

    // Second pass: upload files
    for (const e of entries) {
      const filepath = resolve(OUTPUT_DIR, e.filename);
      if (!existsSync(filepath)) {
        console.log(`   ⚠️  ${e.filename} — not found, skipping`);
        skipped++;
        continue;
      }

      try {
        const url = await uploadFile(filepath, e.filename);
        uploaded++;
        if (e.isDocx) {
          lessons[e.lessonId].notesPath = url;
          console.log(`   📄 ${e.filename} → ${e.lessonId}`);
        } else {
          lessons[e.lessonId].slidesPath = url;
          console.log(`   📊 ${e.filename} → ${e.lessonId}`);
        }
      } catch (err: any) {
        console.log(`   ❌ ${e.filename} — ${err.message}`);
      }
    }

    // Save lesson metadata
    try {
      await updateLessons(weekStart, lessons);
      console.log(`   ✅ Metadata updated (${Object.keys(lessons).length} lessons)`);
    } catch (err: any) {
      console.log(`   ❌ Metadata failed — ${err.message}`);
    }
  }

  console.log(`\n🎉 Done! ${uploaded} uploaded, ${skipped} skipped.`);
  console.log('   Refresh the dashboard to see all files.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
