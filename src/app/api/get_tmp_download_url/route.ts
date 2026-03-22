import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    code: 200,
    msg: 'success',
    data: '',
  });
}
