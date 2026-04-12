import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getPublishedArticlesByTopic,
  getPublishedTopicBySlug,
} from '../../../content/articles'

export const dynamic = 'force-dynamic'

type TopicPageProps = {
  params: Promise<{ topic: string }>
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { topic: topicSlug } = await params
  const topic = await getPublishedTopicBySlug(topicSlug)
  if (!topic) {
    return {
      title: 'Topic not found',
      description: 'The requested topic could not be found.',
    }
  }

  return {
    title: `${topic.topic}`,
    description: `Browse Hermes Signal articles about ${topic.topic}.`,
  }
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { topic: topicSlug } = await params
  const topic = await getPublishedTopicBySlug(topicSlug)
  const articles = await getPublishedArticlesByTopic(topicSlug)

  if (!topic || articles.length === 0) {
    notFound()
  }

  return (
    <main className="site-shell">
      <section className="hero">
        <p className="eyebrow">Topic</p>
        <h1>{topic.topic}</h1>
        <p className="lede">All Hermes Signal articles currently published under this topic.</p>
        <div className="hero-actions">
          <a className="button" href="/archive/">
            Back to archive
          </a>
          <a className="button button-secondary" href="/">
            Home
          </a>
        </div>
      </section>

      <section className="terminal-section" aria-label={`${topic.topic} articles`}>
        <div className="section-heading-row section-heading-row--compact">
          <div>
            <p className="eyebrow">Articles</p>
            <h2>{topic.topic}</h2>
          </div>
        </div>
        <div className="terminal-stream">
          {articles.map((article, index) => (
            <article className="terminal-entry" key={article.slug}>
              <div className="terminal-entry__header">
                <span>{article.topic}</span>
                <span>{`Story ${String(index + 1).padStart(2, '0')}`}</span>
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
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
