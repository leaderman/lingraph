import { NextRequest, NextResponse } from 'next/server';
import { larkClient } from '@/lib/lark-client';

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
      const res = await larkClient.wiki.v2.space.getNode({
        params: {
          token: documentId,
          obj_type: 'wiki',
        },
      });

      documentId = res.data?.node?.obj_token || documentId;
      console.log('文档标识（wiki）:', documentId);
    }

    // 获取文档所有块并转换为 JSON + HTML
    const blocks: any[] = [];

    for await (const page of await larkClient.docx.v1.documentBlock.listWithIterator({
      path: {
        document_id: documentId,
      },
    })) {
      if (page && page.items && Array.isArray(page.items)) {
        blocks.push(...page.items);
      }
    }

    console.log('文档块总数:', blocks.length);

    // 处理图片 block，获取临时下载 URL
    for (const block of blocks) {
      const type = block.block_type;
      
      // 27 是图片类型
      if (type !== 27) continue;
      
      const token = block.image?.token;
      if (!token) continue;
      
      try {
        const res: any = await larkClient.drive.v1.media.batchGetTmpDownloadUrl({
          params: {
            file_tokens: [token],
          },
        });
        
        const tmpDownloadUrl = res.data?.tmp_download_urls?.[0]?.tmp_download_url || '';
        
        if (tmpDownloadUrl) {
          block.image.url = tmpDownloadUrl;
        }
      } catch (error) {
        console.error('获取图片下载链接失败:', token, error);
      }
    }

    return NextResponse.json({
      code: 200,
      msg: 'success',
      data: blocks,
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
