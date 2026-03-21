import { NextRequest, NextResponse } from 'next/server';
import * as lark from '@larksuiteoapi/node-sdk';

export async function POST(request: NextRequest) {
  const client = new lark.Client({
    appId: process.env.APP_ID || '',
    appSecret: process.env.APP_SECRET || '',
  });

  const body = await request.json();
  const { url } = body;

  return NextResponse.json({
    code: 200,
    msg: 'success',
    data: null,
  });
}
