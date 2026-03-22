import { NextRequest, NextResponse } from 'next/server';
import { larkClient } from '@/lib/lark-client';

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
    const res: any = await larkClient.drive.v1.media.batchGetTmpDownloadUrl({
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
