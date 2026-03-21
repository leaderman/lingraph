import { NextRequest, NextResponse } from 'next/server';
import * as lark from '@larksuiteoapi/node-sdk';

// 全局飞书客户端
const client = new lark.Client({
  appId: process.env.APP_ID || '',
  appSecret: process.env.APP_SECRET || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    console.log('飞书文档链接:', url);

    // 解析飞书文档链接
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const type = pathParts[0];
    let documentId = pathParts[1];

    console.log('文档类型:', type);
    console.log('文档标识:', documentId);

    // 如果是 wiki 类型，获取真实文档 ID
    if (type === 'wiki') {
      const res = await client.wiki.v2.space.getNode({
        params: {
          token: documentId,
          obj_type: 'wiki',
        },
      });

      // 从返回结果中提取 obj_token 更新 documentId
      documentId = res.data?.node?.obj_token || documentId;
      console.log('文档标识（wiki）:', documentId);
    }

    // 获取文档所有块
    const allBlocks: any[] = [];
    let pageToken: string | undefined = undefined;
    let hasMore = true;

    while (hasMore) {
      const res: any = await client.docx.v1.documents.listBlocks({
        params: {
          document_id: documentId,
          page_size: 500,
          ...(pageToken ? { page_token: pageToken } : {}),
        },
      });

      if (res.data?.items) {
        allBlocks.push(...res.data.items);
      }

      hasMore = res.data?.has_more === true;
      pageToken = res.data?.next_page_token;
    }

    console.log('文档块总数:', allBlocks.length);
    console.log('文档块:', allBlocks);

    return NextResponse.json({
      code: 200,
      msg: 'success',
      data: null,
    });
  } catch (e: any) {
    console.error('飞书文档解析错误:', JSON.stringify(e.response?.data || e.message, null, 4));
    return NextResponse.json({
      code: 500,
      msg: 'error',
      data: null,
    });
  }
}
