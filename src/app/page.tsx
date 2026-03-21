import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '灵图',
  description: '灵图 - 灵感之图',
};

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <h1 className="text-6xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
        灵图
      </h1>
    </div>
  );
}
