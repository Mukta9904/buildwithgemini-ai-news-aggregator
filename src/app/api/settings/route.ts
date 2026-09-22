import { NextResponse } from 'next/server';
import { getSetting, updateSetting } from '@/lib/db';

export async function GET() {
  try {
    const targetEmail = await getSetting('target_email');
    return NextResponse.json({ targetEmail });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { targetEmail } = await request.json();
    if (typeof targetEmail !== 'string') {
      return NextResponse.json({ error: 'Invalid target email' }, { status: 400 });
    }

    await updateSetting('target_email', targetEmail);
    return NextResponse.json({ success: true, targetEmail });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
