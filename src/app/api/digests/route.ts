import { NextResponse } from 'next/server';
import { getLatestDigests } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    const digests = await getLatestDigests(limit);
    return NextResponse.json({ digests });
  } catch (error) {
    console.error('Error fetching digests:', error);
    return NextResponse.json({ error: 'Failed to fetch digests' }, { status: 500 });
  }
}
