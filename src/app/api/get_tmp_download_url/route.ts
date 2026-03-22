import { NextRequest, NextResponse } from 'next/server';
import * as lark from '@larksuiteoapi/node-sdk';

// 全局飞书客户端
const client = new lark.Client({
  appId: process.env.APP_ID || '',
  appSecret: process.env.APP_SECRET || '',
});

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const token = params.get('token');

  if (!token) {
    return NextResponse.json({
      code: 400,
      msg: 'token is required',
      data: '',
    });
  }

  try {
    const res: any = await client.drive.v1.media.batchGetTmpDownloadUrl({
      params: {
        file_tokens: [token],
      },
    });

    const tmpDownloadUrl = res.data?.tmp_download_urls?.[0]?.tmp_download_url || '';

    return NextResponse.json({
      code: 200,
      msg: 'success',
      data: tmpDownloadUrl,
    });
  } catch (e: any) {
    console.error('获取下载链接失败:', JSON.stringify(e.response?.data || e.message, null, 4));
    return NextResponse.json({
      code: 500,
      msg: 'error',
      data: '',
    });
  }
}
