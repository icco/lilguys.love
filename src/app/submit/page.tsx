import type { Metadata } from "next"
import Link from "next/link"

import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Submit a lilguy",
  description:
    "Share a small stuffed friend or a real animal with the lilguys.love collection.",
  alternates: { canonical: "/submit" },
}

export default function Submit() {
  return (
    <main id="main" className="site-main submit-page">
      <header className="page-heading">
        <p className="eyebrow">There’s room for your little friend</p>
        <h1>
          Found a lilguy<span className="rose">?</span>
        </h1>
        <p>
          A pocket-sized bear. A sleepy kitten. A well-loved plush with a story.
          <br />
          If they make your day a little better, they belong here.
        </p>
      </header>
      <section className="submission-panel" aria-labelledby="share-heading">
        <span className="submission-heart" aria-hidden="true">
          ♡
        </span>
        <h2 id="share-heading">Small friend. Big welcome.</h2>
        {site.submissionFormUrl ? (
          <>
            <p>
              Send us a photograph or a link through our Google Form.
              <br />
              We’ll take it from there.
            </p>
            <a
              className="button-link"
              href={site.submissionFormUrl}
              rel="noopener noreferrer"
            >
              Open the submission form <span aria-hidden="true">↗</span>
            </a>
            <p className="fine-print">
              Photo uploads require a Google account. You can also share a link.
            </p>
          </>
        ) : (
          <>
            <p>
              We’re getting the submission form ready.
              <br />
              Hang on to your favorite photo — we’d love to see it soon.
            </p>
            <span className="coming-soon">Submissions opening soon</span>
          </>
        )}
      </section>
      <section className="how-it-works" aria-labelledby="how-heading">
        <h2 id="how-heading">A little care goes into every addition.</h2>
        <ol>
          <li>
            <span className="step-number">01</span>
            <div>
              <h3>Send a little introduction</h3>
              <p>
                A photo or link, your lilguy’s name, and a few words about them.
                A public photo credit is optional.
              </p>
            </div>
          </li>
          <li>
            <span className="step-number">02</span>
            <div>
              <h3>Reviewed by a real person</h3>
              <p>
                Nat looks through submissions and adds selected lilguys by hand.
                Publication isn’t instant or guaranteed.
              </p>
            </div>
          </li>
          <li>
            <span className="step-number">03</span>
            <div>
              <h3>Part of the collection</h3>
              <p>
                Approved friends get their own page in the archive and a turn in
                our automatic lilguy-of-the-day rotation.
              </p>
            </div>
          </li>
        </ol>
      </section>
      <div className="submission-note">
        <h2>A note on sharing</h2>
        <p>
          Please share photos you took or have permission to publish. Selected
          photos and their public captions and credits are stored in our{" "}
          <a href="https://github.com/icco/lilguys.love">
            public GitHub repository
          </a>
          . Keep private details out of the photo and public credit.
        </p>
        <p>
          For a correction or removal request,{" "}
          <a href="mailto:nat@natwelch.com?subject=lilguys.love">email Nat</a>{" "}
          with the page URL. We can remove a photo from the site, but public Git
          history and copies may remain.
        </p>
      </div>
      <Link href="/archive" className="text-link">
        Visit the collection →
      </Link>
    </main>
  )
}
