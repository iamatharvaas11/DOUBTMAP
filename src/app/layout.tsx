import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DOUBTMAP — Autonomous Evidence Verification Engine',
  description: 'AI-powered decision support system resolving contradictory infrastructure incident reports through deterministic ranking and evidence graphing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
