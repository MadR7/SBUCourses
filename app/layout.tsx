import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from 'react';
import LoadingCourses from './loading';

const inter = Inter({ subsets: ['latin'] });

/**
 * Metadata configuration for the application.
 * Defines the title and description used in the HTML head.
 */
export const metadata: Metadata = {
  title: 'SBUScheduler',
  description: 'Course scheduling made easy for Stony Brook University students'
};

/**
 * Root layout component for the entire application.
 * Sets up the basic HTML structure, applies global styles and fonts,
 * and wraps the application content (`children`) with necessary providers:
 * - `ThemeProvider` for theme management (light/dark mode).
 * - `Suspense` for fallback UI during page loading.
 * - `NuqsAdapter` for integrating the `nuqs` library (URL query state management).
 * 
 * @param children - The React nodes representing the content of the current page.
 * @returns The root HTML structure wrapping the application content.
 */
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