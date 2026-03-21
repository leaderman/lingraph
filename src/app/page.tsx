'use client';

import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { processBlockByType } from '@/lib/block-processor';

import { processBlockByType } from '@/lib/block-processor';

export default function Home() {
  const [appName, setAppName] = useState('');
  const [url, setUrl] = useState('');
  const [blocks, setBlocks] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/name')
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          setAppName(data.data);
        }
      });
  }, []);

  const handleSettingsClick = () => {
    // 设置按钮点击事件，暂时为空
  };

  const handleLayout = async () => {
    const response = await fetch('/api/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    const result = await response.json();
    
    // 专用 blocks 变量接收所有块，并根据 block_type 处理
    const blocks = result.data || [];
    blocks.forEach((block: any) => {
      processBlockByType(block.json);
    });
    
    setBlocks(blocks);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* 上方导航栏 */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
        {/* 左侧：应用名称 */}
        <div className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {appName}
        </div>

        {/* 右侧：设置按钮 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSettingsClick}
          className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      {/* 下方内容区域 */}
      <main className="flex-1 bg-white p-6 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <Label className="whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-300">
            飞书文档链接
          </Label>
          <Input
            type="text"
            placeholder="请输入飞书文档链接"
            className="flex-1"
            value={url || ''}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button onClick={handleLayout}>一键排版</Button>
        </div>

        {/* 文档块展示区域 */}
        {blocks.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              文档块 ({blocks.length})
            </h3>
            {blocks.map((block, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="grid grid-cols-3 gap-4">
                  {/* 1. JSON 字符串 */}
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                      JSON
                    </h4>
                    <pre className="whitespace-pre-wrap break-all rounded bg-slate-100 p-3 text-xs dark:bg-slate-900">
                      {JSON.stringify(block.json, null, 2)}
                    </pre>
                  </div>

                  {/* 2. HTML 字符串 */}
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                      HTML
                    </h4>
                    <pre className="whitespace-pre-wrap break-all rounded bg-slate-100 p-3 text-xs dark:bg-slate-900">
                      {block.html}
                    </pre>
                  </div>

                  {/* 3. HTML 渲染效果 */}
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                      渲染效果
                    </h4>
                    <div
                      className="max-h-60 overflow-auto rounded border border-slate-200 p-3 dark:border-slate-700"
                      dangerouslySetInnerHTML={{ __html: block.html }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
