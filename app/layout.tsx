import './global.css';
import { sfPro, inter } from "./fonts";
import cx from "classnames";
import { Suspense } from "react";

// Metadata
import { Metadata } from 'next';
import Head from 'next/head';

export const metadata: Metadata = {
  title: {
    template: '%s | Vitality Venture',
    default: 'Vitality Venture',
  },
  description: 'TODO',
  metadataBase: new URL('https://www.google.com/'),
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <body className={cx(sfPro.variable, inter.variable, 'bg-gradient-to-r from-indigo-50 via-white to-indigo-50')}>
        {children}
      </body>
    </html>
  );
}
