import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublishedArticleBySlug } from '../../../content/articles'

export const dynamic = 'force-dynamic'

type ArticlePageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getPublishedArticleBySlug(slug)
  if (!article) {
    return {
      title: 'Article not found',
      description: 'The requested Hermes Signal article could not be found.',
    }
  }

  return {
    title: article.title,
    description: article.excerpt,
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = await getPublishedArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  return (
    <main className="site-shell article-layout">
      <section className="hero">
        <p className="eyebrow">
          <a className="inline-link" href="/archive/">
            Archive
          </a>
          {' · '}
          <a className="inline-link" href={`/topics/${article.topicSlug}/`}>
            {article.topic}
          </a>
        </p>
        <h1>{article.title}</h1>
        <p className="lede">{article.excerpt}</p>
        <div className="hero-actions">
          <a className="button" href="/archive/">
            Back to archive
          </a>
          <a className="button button-secondary" href={`/topics/${article.topicSlug}/`}>
            More {article.topic}
          </a>
        </div>
      </section>

      <section className="article-body">
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
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
