
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Settings } from '@/lib/models';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({
        autoBackgroundRemoval: false,
        applyWatermark: true,
        watermarkText: 'Corona Marine',
        geminiModel: 'gemini-2.5-flash'
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { autoBackgroundRemoval, applyWatermark, watermarkText, geminiModel } = body;

    await connectDB();
    let settings = await Settings.findOne();
    
    if (settings) {
      settings.autoBackgroundRemoval = autoBackgroundRemoval !== undefined ? autoBackgroundRemoval : settings.autoBackgroundRemoval;
      settings.applyWatermark = applyWatermark !== undefined ? applyWatermark : settings.applyWatermark;
      settings.watermarkText = watermarkText || settings.watermarkText;
      if (geminiModel) settings.geminiModel = geminiModel;
      await settings.save();
    } else {
      settings = await Settings.create({
        autoBackgroundRemoval,
        applyWatermark,
        watermarkText,
        geminiModel: geminiModel || 'gemini-2.5-flash'
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
