'use client';

import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [appName, setAppName] = useState('');

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

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* 上方导航栏 */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
        {/* 左侧：应用名称 */}
        <div className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {appName || '加载中...'}
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
      <main className="flex-1 p-6">
        {/* 内容暂为空 */}
      </main>
    </div>
  );
}
