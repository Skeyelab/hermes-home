import { describe, expect, it } from 'vitest'
import { buildTopicSlug, createArticleCatalogFromExecutor } from './articles'
import type { ContentQueryExecutor } from './store'

const ARTICLE_SLUG = 'automations-are-shifting-toward-agent-handoffs-20260411-signal-1'

function makeMockExecutor(): ContentQueryExecutor {
  return {
    query: async (sql, params) => {
      if (sql.includes('from draft_posts') && sql.includes('where status')) {
        return {
          rows: [
            {
              id: 'draft-1',
              signal_item_id: 'signal-1',
              title: 'Automations are shifting toward agent handoffs',
              slug: ARTICLE_SLUG,
              excerpt: 'People are discussing workflows where agents hand tasks to each other.',
              topic: 'AI automation',
              status: 'published',
              generated_at: new Date('2026-04-11T00:00:00Z'),
              published_at: new Date('2026-04-11T00:00:00Z'),
            },
          ],
        }
      }

      if (sql.includes('from draft_posts') && sql.includes('where slug')) {
        const slug = Array.isArray(params) ? params[0] : null
        if (slug !== ARTICLE_SLUG) return { rows: [] }
        return {
          rows: [
            {
              id: 'draft-1',
              signal_item_id: 'signal-1',
              title: 'Automations are shifting toward agent handoffs',
              slug: ARTICLE_SLUG,
              excerpt: 'People are discussing workflows where agents hand tasks to each other.',
              topic: 'AI automation',
              status: 'published',
              generated_at: new Date('2026-04-11T00:00:00Z'),
              published_at: new Date('2026-04-11T00:00:00Z'),
            },
          ],
        }
      }

      if (sql.includes('from draft_sections')) {
        return {
          rows: [
            {
              section_key: 'the-signal',
              heading: 'The signal',
              body: 'People are discussing workflows where agents hand tasks to each other.',
              sort_order: 0,
            },
          ],
        }
      }

      return { rows: [] }
    },
  }
}

function makeFailingExecutor(): ContentQueryExecutor {
  return {
    query: async () => {
      throw new Error('database unavailable')
    },
  }
}

describe('published article catalog', () => {
  it('returns publishable article records for the homepage', async () => {
    const catalog = createArticleCatalogFromExecutor(makeMockExecutor())
    const articles = await catalog.getPublishedArticles()

    expect(articles).toHaveLength(1)
    expect(articles[0]).toMatchObject({
      slug: ARTICLE_SLUG,
      title: 'Automations are shifting toward agent handoffs',
      topic: 'AI automation',
      topicSlug: 'ai-automation',
    })
    expect(articles[0].sections[0].heading).toBe('The signal')
  })

  it('falls back to seeded content when the database executor fails', async () => {
    const catalog = createArticleCatalogFromExecutor(makeFailingExecutor())
    const articles = await catalog.getPublishedArticles()

    expect(articles).toHaveLength(1)
    expect(articles[0]).toMatchObject({
      slug: ARTICLE_SLUG,
      title: 'Automations are shifting toward agent handoffs',
      topic: 'AI automation',
      topicSlug: 'ai-automation',
    })
  })

  it('supports archive and topic lookup helpers', async () => {
    const catalog = createArticleCatalogFromExecutor(makeMockExecutor())

    expect(buildTopicSlug('AI automation')).toBe('ai-automation')
    expect(await catalog.getPublishedArticleBySlug('missing')).toBeNull()
    expect(await catalog.getPublishedArticlesByTopic('ai-automation')).toHaveLength(1)
    expect(await catalog.getPublishedTopics()).toEqual([
      {
        topic: 'AI automation',
        topicSlug: 'ai-automation',
        count: 1,
      },
    ])
  })
})
