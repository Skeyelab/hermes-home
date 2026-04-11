import Link from 'next/link'
import { getPublishedArticles, getPublishedTopics } from '../content/articles'

export default function Page() {
  const articles = getPublishedArticles()
  const topics = getPublishedTopics()

  return (
    <main className="site-shell">
      <section className="hero">
        <p className="eyebrow">Hermes Signal</p>
        <h1>Research-led AI and automation tips, published from signals instead of vibes.</h1>
        <p className="lede">
          Hermes watches the trend stream, filters for useful patterns, and turns them into
          practical posts you can actually use.
        </p>
        <div className="hero-actions">
          <Link className="button" href="/archive/">
            Browse the archive
          </Link>
          {topics[0] ? (
            <Link className="button button-secondary" href={`/topics/${topics[0].topicSlug}/`}>
              Browse {topics[0].topic}
            </Link>
          ) : null}
        </div>
      </section>

      <section className="articles" aria-label="Published articles">
        {articles.map((article) => (
          <article className="card" key={article.slug}>
            <p className="meta">{article.topic}</p>
            <h2>{article.title}</h2>
            <p>{article.excerpt}</p>
            <div className="card-actions">
              <Link className="button button-secondary" href={`/articles/${article.slug}/`}>
                Read article
              </Link>
              <Link className="inline-link" href={`/topics/${article.topicSlug}/`}>
                Browse topic
              </Link>
            </div>
            <div className="asset-grid" aria-label="Article assets">
              {article.assets.map((asset) => (
                <figure key={`${article.slug}-${asset.sortOrder}`} className="asset">
                  <img alt={asset.altText} src={asset.assetUrl} loading="lazy" decoding="async" />
                  <figcaption>
                    <span>{asset.kind}</span>
                    <span>{asset.prompt}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <div className="sections">
              {article.sections.map((section) => (
                <div key={section.heading} className="section">
                  <h3>{section.heading}</h3>
                  <p>{section.body}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
