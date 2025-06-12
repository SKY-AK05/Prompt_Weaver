import { NextRequest, NextResponse } from 'next/server';
import { refinePrompt } from '@/ai/flows/refine-prompt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instruction, promptLevel } = body;

    if (!instruction || !promptLevel) {
      return NextResponse.json(
        { success: false, error: 'Missing instruction or promptLevel' },
        { status: 400 }
      );
    }

    const result = await refinePrompt({ instruction, promptLevel });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to refine prompt' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}