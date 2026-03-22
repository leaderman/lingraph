import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
import 'highlight.js/styles/github-dark.css';

export const metadata: Metadata = {
  title: '',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="en">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
