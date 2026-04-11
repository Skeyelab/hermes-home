import Link from 'next/link'
import type { Metadata } from 'next'
import { getPublishedArticles, getPublishedTopics } from '../../content/articles'

export const metadata: Metadata = {
  title: 'Archive',
  description: 'Browse Hermes Signal articles, grouped by topic.',
}

export default function ArchivePage() {
  const articles = getPublishedArticles()
  const topics = getPublishedTopics()

  return (
    <main className="site-shell">
      <section className="hero">
        <p className="eyebrow">Archive</p>
        <h1>Published Hermes Signal articles, grouped by topic.</h1>
        <p className="lede">
          Hermes keeps the public site small and navigable: each article is grounded in a signal,
          and the archive makes the content easy to scan by topic.
        </p>
        <div className="hero-actions">
          <Link className="button" href="/">
            Back to home
          </Link>
          {topics[0] ? (
            <Link className="button button-secondary" href={`/topics/${topics[0].topicSlug}/`}>
              View {topics[0].topic}
            </Link>
          ) : null}
        </div>
      </section>

      <section className="archive-layout" aria-label="Archive topics and articles">
        <div className="card">
          <p className="meta">Topics</p>
          <div className="topic-list">
            {topics.map((topic) => (
              <Link key={topic.topicSlug} className="topic-pill" href={`/topics/${topic.topicSlug}/`}>
                <span>{topic.topic}</span>
                <span>{topic.count}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="articles">
          {articles.map((article) => (
            <article className="card" key={article.slug}>
              <p className="meta">
                <Link className="inline-link" href={`/topics/${article.topicSlug}/`}>
                  {article.topic}
                </Link>
              </p>
              <h2>
                <Link className="inline-link" href={`/articles/${article.slug}/`}>
                  {article.title}
                </Link>
              </h2>
              <p>{article.excerpt}</p>
              <div className="card-actions">
                <Link className="button button-secondary" href={`/articles/${article.slug}/`}>
                  Read article
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
