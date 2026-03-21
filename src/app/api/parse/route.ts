import { NextRequest, NextResponse } from 'next/server';
import * as lark from '@larksuiteoapi/node-sdk';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url } = body;

  console.log('飞书文档链接:', url);

  // 解析飞书文档链接
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/').filter(Boolean);
  const type = pathParts[0]; // wiki
  const documentId = pathParts[1]; // ET97wMEEBilKBKkBS2rck63nnXf

  console.log('文档类型:', type);
  console.log('文档标识:', documentId);

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
