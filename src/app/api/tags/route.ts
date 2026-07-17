import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isErrorResponse } from '@/lib/auth-server';

// Tag model was removed from schema (Tag/StudentTag not present).
// This endpoint is a stub until the Tag model is restored.
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (isErrorResponse(auth)) return auth;
  return NextResponse.json({ error: 'Tags feature unavailable (model removed from schema)', count: 0, tags: [] }, { status: 501 });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ error: 'Tags feature unavailable (model removed from schema)' }, { status: 501 });
}
