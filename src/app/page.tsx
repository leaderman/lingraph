'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, Settings } from 'lucide-react';
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
  const [blocks, setBlocks] = useState<any[]>([]);
  const [images, setImages] = useState<string[][]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [blocksOpen, setBlocksOpen] = useState(false);
  const [imagesOpen, setImagesOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [imageWidth, setImageWidth] = useState(1080);
  const [imageHeight, setImageHeight] = useState(1440);
  const [titleFontSize, setTitleFontSize] = useState(28);
  const [heading1FontSize, setHeading1FontSize] = useState(24);
  const [heading2FontSize, setHeading2FontSize] = useState(22);
  const [heading3FontSize, setHeading3FontSize] = useState(20);
  const [textFontSize, setTextFontSize] = useState(14);

  useEffect(() => {
    hljs.highlightAll();
  }, [blocks]);

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
    setIsLoading(true);
    
    // 获取文档块
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
    const blocks = await Promise.all(rawBlocks.map(async (json: any) => {
      const block = { json, html: '' };
      await processBlockByType(block, config);
      return block;
    }));
    
    setBlocks(blocks);
    
    // 分页生成图片
    const images: string[][] = [];
    let currentPageBlocks: string[] = [];
    
    // 创建隐藏的测量容器
    const measureContainer = document.createElement('div');
    measureContainer.style.position = 'absolute';
    measureContainer.style.visibility = 'hidden';
    measureContainer.style.width = `${imageWidth}px`;
    measureContainer.style.overflow = 'hidden';
    document.body.appendChild(measureContainer);
    
    for (const block of blocks) {
      // 测量当前 block 的高度
      const testContainer = document.createElement('div');
      testContainer.innerHTML = block.html;
      testContainer.style.width = '100%';
      measureContainer.appendChild(testContainer);
      const blockHeight = testContainer.offsetHeight;
      measureContainer.removeChild(testContainer);
      
      // 测试将当前 block 加入当前页面后的高度
      const testPageContainer = document.createElement('div');
      testPageContainer.style.width = `${imageWidth}px`;
      testPageContainer.style.boxSizing = 'border-box';
      testPageContainer.innerHTML = currentPageBlocks.join('') + block.html;
      measureContainer.appendChild(testPageContainer);
      const totalHeight = testPageContainer.offsetHeight;
      measureContainer.removeChild(testPageContainer);
      
      // 如果当前页面为空，直接加入
      if (currentPageBlocks.length === 0) {
        currentPageBlocks.push(block.html);
      } else if (totalHeight <= imageHeight) {
        // 未溢出，继续加入当前页面
        currentPageBlocks.push(block.html);
      } else {
        // 溢出，保存当前页面，创建新页面
        images.push([...currentPageBlocks]);
        currentPageBlocks = [block.html];
      }
    }
    
    // 保存最后一个页面
    if (currentPageBlocks.length > 0) {
      images.push(currentPageBlocks);
    }
    
    // 清理测量容器
    document.body.removeChild(measureContainer);
    
    setImages(images);
    
    setIsLoading(false);
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
              <h4 className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-400">字体大小</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <Label className="flex-1">文档标题</Label>
                  <Input
                    type="number"
                    value={titleFontSize}
                    onChange={(e) => setTitleFontSize(Number(e.target.value))}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Label className="flex-1">一级标题</Label>
                  <Input
                    type="number"
                    value={heading1FontSize}
                    onChange={(e) => setHeading1FontSize(Number(e.target.value))}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Label className="flex-1">二级标题</Label>
                  <Input
                    type="number"
                    value={heading2FontSize}
                    onChange={(e) => setHeading2FontSize(Number(e.target.value))}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Label className="flex-1">三级标题</Label>
                  <Input
                    type="number"
                    value={heading3FontSize}
                    onChange={(e) => setHeading3FontSize(Number(e.target.value))}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Label className="flex-1">文本</Label>
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
              <h4 className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-400">图片尺寸 (3:4)</h4>
              <div className="flex items-center gap-4">
                <Label className="flex-1">宽度</Label>
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
              <div className="mt-3 flex items-center gap-4">
                <Label className="flex-1">高度</Label>
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
            disabled={isLoading}
          />
          <Button onClick={handleLayout} disabled={isLoading} className="min-w-[120px]">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                排版中...
              </>
            ) : (
              '一键排版'
            )}
          </Button>
        </div>

        {/* 文档块区域 */}
        {blocks.length > 0 && (
          <div className="mt-6 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setBlocksOpen(!blocksOpen)}
              className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <span>文档块</span>
              {blocksOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            {blocksOpen && (
              <div className="space-y-4 border-t border-slate-200 p-4 dark:border-slate-700">
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

        {/* 图片区域 */}
        {(blocks.length > 0 || images.length > 0) && (
          <div className="mt-6 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setImagesOpen(!imagesOpen)}
              className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <span>图片</span>
              {imagesOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            {imagesOpen && (
              <div className="space-y-4 border-t border-slate-200 p-4 dark:border-slate-700">
                {images.map((pageBlocks, index) => (
                  <div key={index} className="flex justify-center">
                    <div
                      className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
                      style={{ width: imageWidth, height: imageHeight, maxWidth: '100%' }}
                    >
                      <div 
                        className="p-4"
                        dangerouslySetInnerHTML={{ __html: pageBlocks.join('') }}
                      />
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
