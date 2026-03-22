'use client';

import { useEffect, useState } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { processBlockByType } from '@/lib/block-processor';
import hljs from 'highlight.js';

export default function Home() {
  const [appName, setAppName] = useState('');
  const [url, setUrl] = useState('');
  const [docBlocks, setDocBlocks] = useState<any[]>([]);
  const [imageBlocks, setImageBlocks] = useState<any[]>([]);
  const [docExpanded, setDocExpanded] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [titleFontSize, setTitleFontSize] = useState(28);
  const [heading1FontSize, setHeading1FontSize] = useState(24);
  const [heading2FontSize, setHeading2FontSize] = useState(22);
  const [heading3FontSize, setHeading3FontSize] = useState(20);
  const [textFontSize, setTextFontSize] = useState(14);

  useEffect(() => {
    hljs.highlightAll();
  }, [docBlocks, imageBlocks]);

  useEffect(() => {
    fetch('/api/name')
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          setAppName(data.data);
          document.title = data.data;
        }
      });
  }, []);

  const handleSettingsClick = () => {
    setSettingsOpen(true);
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
    
    const rawBlocks = result.data || [];
    const config = { titleFontSize, heading1FontSize, heading2FontSize, heading3FontSize, textFontSize, sequence: 1 };
    const processedBlocks = await Promise.all(rawBlocks.map(async (json: any) => {
      const block = { json, html: '' };
      await processBlockByType(block, config);
      return block;
    }));
    
    const docs = processedBlocks.filter((b: any) => b.json.block_type !== 27);
    const images = processedBlocks.filter((b: any) => b.json.block_type === 27);
    
    setDocBlocks(docs);
    setImageBlocks(images);
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

      {/* 设置对话框 */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>设置</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Label className="flex-1">文档标题字体大小</Label>
              <Input
                type="number"
                value={titleFontSize}
                onChange={(e) => setTitleFontSize(Number(e.target.value))}
                className="w-24"
              />
            </div>
            <div className="flex items-center gap-4">
              <Label className="flex-1">一级标题字体大小</Label>
              <Input
                type="number"
                value={heading1FontSize}
                onChange={(e) => setHeading1FontSize(Number(e.target.value))}
                className="w-24"
              />
            </div>
            <div className="flex items-center gap-4">
              <Label className="flex-1">二级标题字体大小</Label>
              <Input
                type="number"
                value={heading2FontSize}
                onChange={(e) => setHeading2FontSize(Number(e.target.value))}
                className="w-24"
              />
            </div>
            <div className="flex items-center gap-4">
              <Label className="flex-1">三级标题字体大小</Label>
              <Input
                type="number"
                value={heading3FontSize}
                onChange={(e) => setHeading3FontSize(Number(e.target.value))}
                className="w-24"
              />
            </div>
            <div className="flex items-center gap-4">
              <Label className="flex-1">文本字体大小</Label>
              <Input
                type="number"
                value={textFontSize}
                onChange={(e) => setTextFontSize(Number(e.target.value))}
                className="w-24"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

        {/* 图片区域 */}
        {imageBlocks.length > 0 && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setImageExpanded(!imageExpanded)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                图片 ({imageBlocks.length})
              </h3>
              {imageExpanded ? (
                <ChevronUp className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              )}
            </button>
            {imageExpanded && (
              <div className="border-t border-slate-200 p-4 dark:border-slate-700">
                <div className="grid grid-cols-4 gap-4">
                  {imageBlocks.map((block, index) => (
                    <div
                      key={index}
                      dangerouslySetInnerHTML={{ __html: block.html }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 文档块区域 */}
        {docBlocks.length > 0 && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setDocExpanded(!docExpanded)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                文档块 ({docBlocks.length})
              </h3>
              {docExpanded ? (
                <ChevronUp className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              )}
            </button>
            {docExpanded && (
              <div className="border-t border-slate-200 p-4 dark:border-slate-700 space-y-4">
                {docBlocks.map((block, index) => (
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
                          {block.block_name}
                        </h4>
                        <div
                          className="rounded border border-slate-200 p-3 dark:border-slate-700"
                          dangerouslySetInnerHTML={{ __html: block.html }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
