// ── POST /api/files — upload a file (called by cron pipeline)
// ── GET /api/files — list uploaded files

import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const name = filename || file.name;
    const { url } = await put(`files/${name}`, file, {
      access: 'public',
      contentType: file.type,
      allowOverwrite: true,
    });

    return NextResponse.json({ url, filename: name });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'files/' });
    const files = blobs.map((b) => ({
      url: b.url,
      pathname: b.pathname,
      size: b.size,
      uploadedAt: b.uploadedAt,
    }));
    return NextResponse.json({ files });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
