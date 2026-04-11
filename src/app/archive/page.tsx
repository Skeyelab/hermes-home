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
          <a className="button" href="/">
            Back to home
          </a>
          {topics[0] ? (
            <a className="button button-secondary" href={`/topics/${topics[0].topicSlug}/`}>
              View {topics[0].topic}
            </a>
          ) : null}
        </div>
      </section>

      <section className="archive-layout" aria-label="Archive topics and articles">
        <div className="card">
          <p className="meta">Topics</p>
          <div className="topic-list">
            {topics.map((topic) => (
              <a key={topic.topicSlug} className="topic-pill" href={`/topics/${topic.topicSlug}/`}>
                <span>{topic.topic}</span>
                <span>{topic.count}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="articles">
          {articles.map((article) => (
            <article className="card" key={article.slug}>
              <p className="meta">
                <a className="inline-link" href={`/topics/${article.topicSlug}/`}>
                  {article.topic}
                </a>
              </p>
              <h2>
                <a className="inline-link" href={`/articles/${article.slug}/`}>
                  {article.title}
                </a>
              </h2>
              <p>{article.excerpt}</p>
              <div className="card-actions">
                <a className="button button-secondary" href={`/articles/${article.slug}/`}>
                  Read article
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
