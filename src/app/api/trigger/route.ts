import { NextResponse } from 'next/server';
import { runPipeline } from '@/lib/pipeline';

export async function POST(request: Request) {
  try {
    // Basic protection against accidental triggers
    // In a real app, you might check an auth token here
    const { token } = await request.json();
    
    // For local dev, we'll allow it if token matches or no token is strictly enforced
    if (process.env.NODE_ENV !== 'development' && token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run the pipeline asynchronously so the API route doesn't time out
    // Next.js (especially serverless) might kill background processes, but for local/VPS it's fine.
    // If on Vercel, this should be an async awaited call, and Vercel max duration should be increased.
    const result = await runPipeline();
    
    if (result.success) {
       return NextResponse.json({ success: true, message: result.message });
    } else {
       return NextResponse.json({ error: result.message }, { status: 500 });
    }

  } catch (error) {
    console.error('Error triggering pipeline:', error);
    return NextResponse.json({ error: 'Failed to trigger pipeline' }, { status: 500 });
  }
}
