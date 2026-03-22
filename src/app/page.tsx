'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { processBlockByType } from '@/lib/block-processor';
import hljs from 'highlight.js';

export default function Home() {
  const [appName, setAppName] = useState('');
  const [url, setUrl] = useState('');
  const [blocks, setBlocks] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [titleFontSize, setTitleFontSize] = useState(28);
  const [heading1FontSize, setHeading1FontSize] = useState(24);
  const [heading2FontSize, setHeading2FontSize] = useState(22);
  const [heading3FontSize, setHeading3FontSize] = useState(20);
  const [textFontSize, setTextFontSize] = useState(14);
  const [imageWidth, setImageWidth] = useState(1080);
  const [imageHeight, setImageHeight] = useState(1440);
  const [activeTab, setActiveTab] = useState('blocks');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      hljs.highlightAll();
    });
  }, [blocks, activeTab]);

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
    if (loading) return;
    setLoading(true);
    setBlocks([]);
    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      const result = await response.json();
      
      const rawBlocks = result.data || [];
      const config = { titleFontSize, heading1FontSize, heading2FontSize, heading3FontSize, textFontSize, sequence: 1, imageWidth, imageHeight };
      const blocks = await Promise.all(rawBlocks.map(async (json: any) => {
        const block = { json, html: '' };
        await processBlockByType(block, config);
        return block;
      }));
      
      setBlocks(blocks);
      
      // 处理 images
      const newImages: any[] = [];
      let currentImage: any = null;
      
      for (const block of blocks) {
        if (currentImage === null) {
          currentImage = { children: [] };
          newImages.push(currentImage);
        }
        currentImage.children.push(block.html);
      }
      
      setImages(newImages.map(img => ({
        html: `<div>${img.children.join('')}</div>`
      })));
    } finally {
      setLoading(false);
    }
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
            <div>
              <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">字体大小</h4>
              <div className="space-y-3">
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
            </div>

            <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
              <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">图片大小</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <Label className="flex-1">图片宽度</Label>
                  <Input
                    type="number"
                    value={imageWidth}
                    onChange={(e) => {
                      const width = Number(e.target.value);
                      setImageWidth(width);
                      setImageHeight(Math.round(width * 4 / 3));
                    }}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Label className="flex-1">图片高度</Label>
                  <Input
                    type="number"
                    value={imageHeight}
                    onChange={(e) => {
                      const height = Number(e.target.value);
                      setImageHeight(height);
                      setImageWidth(Math.round(height * 3 / 4));
                    }}
                    className="w-24"
                  />
                </div>
              </div>
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
          <Button onClick={handleLayout} disabled={loading} className="w-28 justify-center">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                排版中...
              </>
            ) : (
              '一键排版'
            )}
          </Button>
        </div>

        {/* 文档块展示区域 */}
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="blocks">文档块 ({blocks.length})</TabsTrigger>
              <TabsTrigger value="images">图片 ({images.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="blocks" className="space-y-4">
              {blocks.map((block, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="flex gap-4">
                    {/* 1. JSON 字符串 */}
                    <div className="flex-1">
                      <h4 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                        JSON
                      </h4>
                      <pre className="whitespace-pre-wrap break-all rounded bg-slate-100 p-3 text-xs dark:bg-slate-900">
                        {JSON.stringify(block.json, null, 2)}
                      </pre>
                    </div>

                    {/* 2. HTML 字符串 */}
                    <div className="flex-1">
                      <h4 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                        HTML
                      </h4>
                      <pre className="whitespace-pre-wrap break-all rounded bg-slate-100 p-3 text-xs dark:bg-slate-900">
                        {block.html}
                      </pre>
                    </div>

                    {/* 3. HTML 渲染效果 */}
                    <div style={{ width: imageWidth }}>
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
            </TabsContent>
            
            <TabsContent value="images" className="space-y-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div
                    className="flex justify-center rounded border border-slate-200 p-3 dark:border-slate-700"
                    dangerouslySetInnerHTML={{ __html: image.html }}
                  />
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
