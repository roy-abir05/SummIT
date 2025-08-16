import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Transcript Summarizer - Smart Meeting Summaries',
  description: 'Transform your meeting transcripts into actionable summaries with AI-powered analysis and easy sharing.',
  keywords: ['AI', 'transcript', 'summarization', 'meeting', 'productivity'],
  authors: [{ name: 'AI Transcript Summarizer Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}