import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from 'react';
import LoadingCourses from './loading';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SBUCourses',
  description: 'Course scheduling made easy for Stony Brook University students'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<div><LoadingCourses /></div>}>
          <NuqsAdapter>
          {children}
          </NuqsAdapter>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}