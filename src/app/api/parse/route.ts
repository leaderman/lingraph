import { NextRequest, NextResponse } from 'next/server';
import * as lark from '@larksuiteoapi/node-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    console.log('飞书文档链接:', url);

    // 解析飞书文档链接
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const type = pathParts[0]; // wiki
    let documentId = pathParts[1]; // ET97wMEEBilKBKkBS2rck63nnXf

    console.log('文档类型:', type);
    console.log('文档标识:', documentId);

    const client = new lark.Client({
      appId: process.env.APP_ID || '',
      appSecret: process.env.APP_SECRET || '',
    });

    console.log('飞书客户端创建完成');

    // 如果是 wiki 类型，获取真实文档 ID
    if (type === 'wiki') {
      const res = await client.wiki.v2.space.getNode({
        params: {
          token: documentId,
          obj_type: 'wiki',
        },
      });

      console.log('wiki 节点信息:', res);

      // 从返回结果中提取 obj_token 作为新的 documentId
      if (res.data?.node?.obj_token) {
        documentId = res.data.node.obj_token;
        console.log('更新后的文档标识:', documentId);
      }
    }

    return NextResponse.json({
      code: 200,
      msg: 'success',
      data: null,
    });
  } catch (e: any) {
    console.error('接口处理失败:', JSON.stringify(e.response?.data || e.message, null, 4));
    return NextResponse.json({
      code: 500,
      msg: 'error',
      data: null,
    }, { status: 200 });
  }
}
