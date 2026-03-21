import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url } = body;

  return NextResponse.json({
    code: 200,
    msg: 'success',
    data: null,
  });
}
