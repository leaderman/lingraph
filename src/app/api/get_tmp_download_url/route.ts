import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  return NextResponse.json({
    code: 200,
    msg: 'success',
    data: '',
  });
}
