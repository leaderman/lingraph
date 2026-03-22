import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const token = params.get('token');

  return NextResponse.json({
    code: 200,
    msg: 'success',
    data: '',
  });
}
