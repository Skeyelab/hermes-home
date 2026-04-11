import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ArticlePage from './page'

const SLUG = 'automations-are-shifting-toward-agent-handoffs-20260411-signal-1'

vi.mock('../../../content/articles', () => ({
  getPublishedArticles: vi.fn().mockResolvedValue([
    {
      slug: 'automations-are-shifting-toward-agent-handoffs-20260411-signal-1',
      title: 'Automations are shifting toward agent handoffs',
      excerpt: 'People are discussing workflows.',
      publishedAt: '2026-04-11T00:00:00Z',
      topic: 'AI automation',
      topicSlug: 'ai-automation',
      sections: [{ heading: 'The signal', body: 'Signal body.' }],
      assets: [],
    },
  ]),
  getPublishedArticleBySlug: vi.fn().mockImplementation(async (slug: string) => {
    if (slug !== 'automations-are-shifting-toward-agent-handoffs-20260411-signal-1') return null
    return {
      slug: 'automations-are-shifting-toward-agent-handoffs-20260411-signal-1',
      title: 'Automations are shifting toward agent handoffs',
      excerpt: 'People are discussing workflows.',
      publishedAt: '2026-04-11T00:00:00Z',
      topic: 'AI automation',
      topicSlug: 'ai-automation',
      sections: [{ heading: 'The signal', body: 'Signal body.' }],
      assets: [],
    }
  }),
}))

describe('article page', () => {
  it('renders a published article from its slug', async () => {
    const html = renderToStaticMarkup(
      await ArticlePage({ params: { slug: SLUG } }),
    )

    expect(html).toContain('Automations are shifting toward agent handoffs')
    expect(html).toContain('The signal')
    expect(html).toContain('/topics/ai-automation/')
    expect(html).toContain('/archive/')
  })
})
