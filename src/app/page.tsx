'use client';

import * as htmlToImage from 'html-to-image';
import { useEffect, useRef, useState } from 'react';
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

export default function Home() {
  const [appName, setAppName] = useState('');
  const [url, setUrl] = useState('');
  const [blocks, setBlocks] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [titleFontSize, setTitleFontSize] = useState(32);
  const [heading1FontSize, setHeading1FontSize] = useState(28);
  const [heading2FontSize, setHeading2FontSize] = useState(26);
  const [heading3FontSize, setHeading3FontSize] = useState(24);
  const [textFontSize, setTextFontSize] = useState(20);
  const [imageWidth, setImageWidth] = useState(1080);
  const [imageHeight, setImageHeight] = useState(1440);
  const [imageScale, setImageScale] = useState(0.6);
  const [imageBackgroundColor, setImageBackgroundColor] = useState('#f7f7f7');
  const [paddingX, setPaddingX] = useState(64);
  const [paddingY, setPaddingY] = useState(64);
  const [blockSpacing, setBaseLineHeight] = useState(14);
  const [activeTab, setActiveTab] = useState('blocks');
  const [loading, setLoading] = useState(false);
  const [shouldMeasure, setShouldMeasure] = useState(false);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!shouldMeasure || blocks.length === 0) return;
    
    // 等待所有图片加载完成
    const images = document.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>(resolve => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    });
    
    Promise.all(imagePromises).then(() => {
      const newBlocks = blocks.map((block, index) => {
        const el = blockRefs.current[index];
        const width = el?.clientWidth || 0;
        const height = el?.clientHeight || 0;
        return {
          ...block,
          json: {
            ...block.json,
            block_width: width,
            block_height: height
          }
        };
      });
      
      setBlocks(newBlocks);
      setShouldMeasure(false);
      createImages(newBlocks);
    });
  }, [shouldMeasure, blocks]);

  function createImages(blocks: any[]) {
    const newImages: any[] = [];
    let currentImage: any = null;
    let currentHeight = 0;

    const createNewImage = (index: number) => ({
      html: `<div data-image-index="${index}" style="width: ${imageWidth}px; height: ${imageHeight}px; padding: ${paddingY}px ${paddingX}px;"></div>`,
    });

    for (const [index, block] of blocks.entries()) {
      const blockWidth = block.json.block_width;
      const blockHeight = block.json.block_height;

      if (currentImage === null || currentHeight + blockHeight > imageHeight) {
        currentImage = createNewImage(newImages.length);
        newImages.push(currentImage);

        currentHeight = blockHeight + 2 * paddingY;
      }

      currentImage.html = currentImage.html.replace('</div>', `${block.html}</div>`);
      currentHeight += blockHeight;
    }

    setImages(newImages);
    setActiveTab('images');
  }

  async function downloadAllImages() {
    const btn = document.getElementById('download-btn') as HTMLButtonElement;
    const textSpan = btn?.querySelector('.btn-text');
    
    if (btn && textSpan) {
      btn.disabled = true;
      // 创建 loading 图标
      const loader = document.createElement('span');
      loader.className = 'download-loader mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent';
      btn.insertBefore(loader, textSpan);
      textSpan.textContent = '下载中...';
    }
    
    try {
      const timestamp = new Date().toISOString().replace(/[T:.\-]/g, '').slice(0, 14);
      const elements = document.querySelectorAll('[data-image-index]');
      for (let i = 0; i < elements.length; i++) {
        const dataUrl = await htmlToImage.toPng(elements[i] as HTMLElement, {
          skipFonts: true,
          pixelRatio: 2,
          includeQueryParams: true,
        });
        const link = document.createElement('a');
        link.download = `${timestamp}-image-${i + 1}.png`;
        link.href = dataUrl;
        link.click();
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } finally {
      if (btn && textSpan) {
        btn.disabled = false;
        // 移除 loading 图标
        const loader = btn.querySelector('.download-loader');
        if (loader) loader.remove();
        textSpan.textContent = '下载所有图片';
      }
    }
  }

  useEffect(() => {
    fetch('/api/name')
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          const suffix = ' - 飞书云文档转图片';
          setAppName(data.data + suffix);
          document.title = data.data + suffix;
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
    setImages([]);
    setShouldMeasure(false);
    blockRefs.current = [];
    setActiveTab('blocks');
    
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
      const config = { titleFontSize, heading1FontSize, heading2FontSize, heading3FontSize, textFontSize, blockSpacing, sequence: 1, imageWidth, imageHeight };
      const blocks = rawBlocks.map((json: any) => {
        const block = { json, html: '' };
        processBlockByType(block, config);
        return block;
      });
      
      setBlocks(blocks);
      setShouldMeasure(true);
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
                <div className="flex items-center gap-4">
                  <Label className="flex-1">缩放比例</Label>
                  <Input
                    type="number"
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    value={imageScale}
                    onChange={(e) => setImageScale(Number(e.target.value))}
                    className="w-24"
                  />
                </div>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
              <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">颜色</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <Label className="flex-1">图片背景色</Label>
                  <Input
                    type="text"
                    value={imageBackgroundColor}
                    onChange={(e) => setImageBackgroundColor(e.target.value)}
                    className="w-24"
                  />
                </div>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
              <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">图片边距</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <Label className="flex-1">左右边距</Label>
                  <Input
                    type="number"
                    value={paddingX}
                    onChange={(e) => setPaddingX(Number(e.target.value))}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Label className="flex-1">上下边距</Label>
                  <Input
                    type="number"
                    value={paddingY}
                    onChange={(e) => setPaddingY(Number(e.target.value))}
                    className="w-24"
                  />
                </div>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
              <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">间距</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <Label className="flex-1">块间距</Label>
                  <Input
                    type="number"
                    value={blockSpacing}
                    onChange={(e) => setBaseLineHeight(Number(e.target.value))}
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
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                        {block.block_name}
                      </h4>
                      <div className="rounded border border-slate-200 dark:border-slate-700">
                        <div
                          ref={(el) => { blockRefs.current[index] = el?.firstElementChild as HTMLDivElement; }}
                          style={{ width: imageWidth, padding: `${paddingY}px ${paddingX}px` }}
                          dangerouslySetInnerHTML={{ __html: block.html }}
                        />
                      </div>
                    </div>

                    {/* 4. 尺寸信息 */}
                    <div className="w-32">
                      <h4 className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                        尺寸
                      </h4>
                      <div className="text-xs text-slate-500">
                        <div>宽度: {block.json?.block_width || 0}px</div>
                        <div>高度: {block.json?.block_height || 0}px</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="images">
              <div className="flex flex-wrap gap-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-white p-4 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    style={{ 
                      transform: `scale(${imageScale})`, 
                      transformOrigin: 'top left',
                      marginRight: `${-imageWidth * (1 - imageScale)}px`,
                      marginBottom: `${-imageHeight * (1 - imageScale)}px`,
                    }}
                    dangerouslySetInnerHTML={{ __html: image.html }}
                  />
                ))}
              </div>
              {images.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <Button id="download-btn" onClick={downloadAllImages} className="w-32 justify-center">
                    <span className="btn-text">下载所有图片</span>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
