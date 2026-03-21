import { NextRequest, NextResponse } from 'next/server';
import * as lark from '@larksuiteoapi/node-sdk';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url } = body;

  console.log('飞书文档链接:', url);

  const client = new lark.Client({
    appId: process.env.APP_ID || '',
    appSecret: process.env.APP_SECRET || '',
  });

  console.log('飞书客户端创建完成');

  return NextResponse.json({
    code: 200,
    msg: 'success',
    data: null,
  });
}
