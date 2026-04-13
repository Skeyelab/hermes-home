import type { Metadata } from 'next'
import { getPublishedArticles, getPublishedTopics } from '../../content/articles'

export const metadata: Metadata = {
  title: 'Archive',
  description: 'Browse Hermes Signal articles, grouped by topic.',
}

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
  const articles = await getPublishedArticles()
  const topics = await getPublishedTopics()

  return (
    <main className="site-shell">
      <section className="hero">
        <p className="eyebrow">Archive</p>
        <h1>Recent articles, indexed by topic.</h1>
        <p className="lede">Small archive. Clear topics. No endless feed.</p>
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

      <div className="archive-layout">
        <section className="terminal-section terminal-section--topics" aria-label="Archive topics">
          <div className="section-heading-row section-heading-row--compact">
            <div>
              <p className="eyebrow">Topics</p>
              <h2>Signals by theme</h2>
            </div>
          </div>
          <div className="topic-list topic-list--plain">
            {topics.map((topic) => (
              <a className="topic-link" href={`/topics/${topic.topicSlug}/`} key={topic.topicSlug}>
                <span>{topic.topic}</span>
                <span>{topic.count}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="terminal-section" aria-label="Archive articles">
          <div className="section-heading-row section-heading-row--compact">
            <div>
              <p className="eyebrow">Articles</p>
              <h2>Published signals</h2>
            </div>
          </div>
          <div className="terminal-stream">
            {articles.map((article) => (
              <article className="terminal-entry" key={article.slug}>
                <div className="terminal-entry__header">
                  <span>
                    <a className="inline-link" href={`/topics/${article.topicSlug}/`}>
                      {article.topic}
                    </a>
                  </span>
                  <span>{article.publishedAt.slice(0, 10)}</span>
                </div>
                <div className="terminal-entry__body">
                  <h3>
                    <a className="inline-link" href={`/articles/${article.slug}/`}>
                      {article.title}
                    </a>
                  </h3>
                  <p>{article.excerpt}</p>
                </div>
                <div className="terminal-entry__actions">
                  <a className="button button-secondary" href={`/articles/${article.slug}/`}>
                    Read article
                  </a>
                  <a className="inline-link" href={`/topics/${article.topicSlug}/`}>
                    Browse topic
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
