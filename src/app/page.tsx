import { getPublishedArticles, getPublishedTopics } from '../content/articles'

export const dynamic = 'force-dynamic'

type WorkflowStep = {
  title: string
  description: string
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    title: 'Ingest',
    description: 'Signals come in from public sources and get ranked.',
  },
  {
    title: 'Draft',
    description: 'Hermes turns the strongest signal into a draft worth editing.',
  },
  {
    title: 'Publish',
    description: 'A person reviews the draft and decides whether it belongs in the archive.',
  },
]

function formatCount(
  count: number,
  singular: string,
  plural: string,
  emptyLabel: string,
): string {
  if (count === 0) {
    return emptyLabel
  }

  return `${count} ${count === 1 ? singular : plural}`
}

export default async function Page() {
  const articles = await getPublishedArticles()
  const topics = await getPublishedTopics()

  const featuredArticle = articles[0] ?? null
  const spotlightArticles = articles.slice(1, 4)
  const articleCount = articles.length
  const topicCount = topics.length
  const primaryTopic = topics[0] ?? null

  return (
    <main className="site-shell homepage-shell">
      <section className="hero hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Hermes Signal</p>
          <h1>A narrow reading room for AI automation signals.</h1>
          <p className="lede">
            Hermes tracks a small set of patterns, drafts the useful ones, and publishes
            only the pieces worth keeping.
          </p>
          <div className="hero-actions">
            <a className="button" href="/archive/">
              Browse the archive
            </a>
            {primaryTopic ? (
              <a className="button button-secondary" href={`/topics/${primaryTopic.topicSlug}/`}>
                Browse {primaryTopic.topic}
              </a>
            ) : null}
          </div>

          <div className="stat-grid" aria-label="Publication stats">
            <div className="stat">
              <span className="stat-label">Published stories</span>
              <strong>{formatCount(articleCount, 'story', 'stories', 'No stories yet')}</strong>
            </div>
            <div className="stat">
              <span className="stat-label">Tracked topics</span>
              <strong>{formatCount(topicCount, 'topic', 'topics', 'No topics yet')}</strong>
            </div>
            <div className="stat">
              <span className="stat-label">Asset-rich drafts</span>
              <strong>{featuredArticle ? `${featuredArticle.assets.length} visuals` : 'Ready to publish'}</strong>
            </div>
          </div>
        </div>

        <aside className="hero-panel" aria-label="Live publication status">
          {featuredArticle ? (
            <>
              <p className="panel-label">Live pulse</p>
              <h2>{featuredArticle.title}</h2>
              <p className="panel-copy">{featuredArticle.excerpt}</p>

              <div className="panel-facts">
                <div>
                  <span>Primary topic</span>
                  <strong>{primaryTopic ? primaryTopic.topic : 'None yet'}</strong>
                </div>
                <div>
                  <span>Latest article</span>
                  <strong>{featuredArticle.publishedAt.slice(0, 10)}</strong>
                </div>
                <div>
                  <span>Assets generated</span>
                  <strong>{featuredArticle.assets.length}</strong>
                </div>
                <div>
                  <span>Content mode</span>
                  <strong>Live archive</strong>
                </div>
              </div>

              <div className="panel-cta">
                <a className="button button-secondary" href={`/articles/${featuredArticle.slug}/`}>
                  Read the featured article
                </a>
                <a className="inline-link" href={`/topics/${featuredArticle.topicSlug}/`}>
                  Browse this topic
                </a>
              </div>
            </>
          ) : (
            <>
              <p className="panel-label">Getting started</p>
              <h2>Signals are waiting to become stories.</h2>
              <p className="panel-copy">
                Run the ingest and draft jobs, then approve a draft in the admin area to populate
                this publication surface.
              </p>

              <div className="panel-facts">
                <div>
                  <span>Step 1</span>
                  <strong>Ingest signals</strong>
                </div>
                <div>
                  <span>Step 2</span>
                  <strong>Draft article</strong>
                </div>
                <div>
                  <span>Step 3</span>
                  <strong>Approve publish</strong>
                </div>
                <div>
                  <span>Content mode</span>
                  <strong>Awaiting drafts</strong>
                </div>
              </div>

              <div className="panel-cta">
                <a className="button button-secondary" href="/admin/">
                  Open admin
                </a>
                <a className="inline-link" href="/archive/">
                  See the archive
                </a>
              </div>
            </>
          )}
        </aside>
      </section>

      <section className="terminal-section" aria-label="Content engine workflow">
        <div className="section-heading-row section-heading-row--compact">
          <div>
            <p className="eyebrow">Workflow</p>
            <h2>Content engine</h2>
          </div>
          <span className="subtle">A plain readout of how an article gets from source to archive.</span>
        </div>

        <div className="terminal-stream">
          {WORKFLOW_STEPS.map((step, index) => (
            <div className="terminal-entry" key={step.title}>
              <span className="terminal-entry__index">{String(index + 1).padStart(2, '0')}</span>
              <div className="terminal-entry__body">
                <p className="meta">{step.title}</p>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="terminal-section" aria-label="Published articles">
        <div className="section-heading-row section-heading-row--compact">
          <div>
            <p className="eyebrow">Latest stories</p>
            <h2>Published signals</h2>
          </div>
          <a className="inline-link" href="/archive/">
            Open the archive
          </a>
        </div>

        <div className="terminal-stream">
          {featuredArticle ? (
            <article className="terminal-entry terminal-entry--featured" key={featuredArticle.slug}>
              <div className="terminal-entry__header">
                <span>{featuredArticle.topic}</span>
                <span>Featured</span>
              </div>
              <div className="terminal-entry__body">
                <h3>{featuredArticle.title}</h3>
                <p>{featuredArticle.excerpt}</p>
              </div>
              <div className="terminal-entry__actions">
                <a className="button button-secondary" href={`/articles/${featuredArticle.slug}/`}>
                  Read article
                </a>
                <a className="inline-link" href={`/topics/${featuredArticle.topicSlug}/`}>
                  Browse topic
                </a>
              </div>
            </article>
          ) : (
            <div className="terminal-entry terminal-entry--empty">
              <div className="terminal-entry__header">
                <span>No stories yet</span>
                <span>Idle</span>
              </div>
              <div className="terminal-entry__body">
                <h3>Waiting for the next batch</h3>
                <p>
                  Once Hermes ingests and drafts a topic, it will appear here as a plain text log
                  entry instead of a card.
                </p>
              </div>
            </div>
          )}

          {spotlightArticles.map((article, index) => (
            <article className="terminal-entry" key={article.slug}>
              <div className="terminal-entry__header">
                <span>{article.topic}</span>
                <span>{`Story ${String(index + 2).padStart(2, '0')}`}</span>
              </div>
              <div className="terminal-entry__body">
                <h3>{article.title}</h3>
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

      <section className="terminal-section terminal-section--topics">
        <div className="section-heading-row section-heading-row--compact">
          <div>
            <p className="eyebrow">Topics</p>
            <h2>Signals by theme</h2>
          </div>
          <span className="subtle">Browse the topics currently on the shelf.</span>
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
    </main>
  )
}
