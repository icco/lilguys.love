import "./globals.css"

import type { Metadata } from "next"
import type { ReactNode } from "react"

import { site } from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    title: site.name,
    description: site.description,
    siteName: site.name,
  },
  twitter: { card: "summary", title: site.name, description: site.description },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-base-100 font-sans text-base-content antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-base-100 focus:p-4"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
