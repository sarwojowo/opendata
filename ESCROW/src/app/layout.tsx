"use client"
import { Inter } from 'next/font/google'
// import { useEffect } from 'react';
// import 'bootstrap/dist/css/bootstrap.css';
import './ui/globals.css'
import { AuthProvider } from './providers'

const inter = Inter({ subsets: ['latin'] })

//@ts-ignore
export default function RootLayout({ children }) {
  // useEffect(() => {
  //   require("bootstrap/dist/js/bootstrap.bundle.min.js");
  // }, []);

  return (
      <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
      </html>
  )
}
