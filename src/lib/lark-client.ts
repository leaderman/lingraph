import * as lark from '@larksuiteoapi/node-sdk';

export const larkClient = new lark.Client({
  appId: process.env.APP_ID || '',
  appSecret: process.env.APP_SECRET || '',
});
