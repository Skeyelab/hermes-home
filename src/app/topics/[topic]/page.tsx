import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getPublishedArticlesByTopic,
  getPublishedTopicBySlug,
  getPublishedTopics,
} from '../../../content/articles'

export function generateStaticParams() {
  return getPublishedTopics().map((topic) => ({
    topic: topic.topicSlug,
  }))
}

type TopicPageProps = {
  params: any
}

export function generateMetadata({ params }: TopicPageProps): Metadata {
  const topic = getPublishedTopicBySlug(params.topic)
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

export default function TopicPage({ params }: TopicPageProps) {
  const topic = getPublishedTopicBySlug(params.topic)
  const articles = getPublishedArticlesByTopic(params.topic)

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

      <section className="articles" aria-label={`${topic.topic} articles`}>
        {articles.map((article) => (
          <article className="card" key={article.slug}>
            <p className="meta">{article.publishedAt.slice(0, 10)}</p>
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
      </section>
    </main>
  )
}
