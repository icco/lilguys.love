import "./globals.css"

import { Footer } from "@icco/react-common/Footer"
import { SiteHeader } from "@icco/react-common/SiteHeader"
import { WebVitals } from "@icco/react-common/WebVitals"
import type { Metadata } from "next"
import Link from "next/link"
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
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <div className="site-header">
          <SiteHeader
            brand={
              <Link
                href="/"
                className="wordmark"
                aria-label="lilguys.love home"
              >
                lilguys<span className="rose">.love</span>
              </Link>
            }
            showThemeToggle={false}
            links={[
              { name: "Archive", href: "/archive" },
              { name: "Submit a lilguy ↗", href: "/submit" },
            ]}
          />
        </div>
        <WebVitals analyticsPath="/analytics/lilguys" />
        {children}
        <div className="shared-footer">
          <p className="footer-note">
            A little corner of the internet, for little friends.
          </p>
          <Footer
            sourceRepo="https://github.com/icco/lilguys.love"
            showSocial={false}
            showRecurseRing={false}
            showXXIIVVRing={false}
          />
        </div>
      </body>
    </html>
  )
}
