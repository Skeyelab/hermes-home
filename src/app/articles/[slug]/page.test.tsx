import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ArticlePage from './page'

const SLUG = 'automations-are-shifting-toward-agent-handoffs-20260411-signal-1'

vi.mock('../../../content/articles', () => ({
  getPublishedArticleBySlug: vi.fn().mockImplementation(async (slug: string) => {
    if (slug !== 'automations-are-shifting-toward-agent-handoffs-20260411-signal-1') return null
    return {
      slug: 'automations-are-shifting-toward-agent-handoffs-20260411-signal-1',
      title: 'Automations are shifting toward agent handoffs',
      excerpt: 'Operators are learning that handoffs become the system once more than one agent is involved.',
      publishedAt: '2026-04-11T00:00:00Z',
      topic: 'AI automation',
      topicSlug: 'ai-automation',
      sections: [{ heading: 'The signal', body: 'Signal body.' }],
      assets: [
        {
          kind: 'hero',
          assetUrl: 'https://example.com/hero.png',
          prompt: 'Create a wide editorial hero image for a Hermes article...',
          altText: 'Hero image',
          sortOrder: 0,
        },
      ],
    }
  }),
}))

describe('article page', () => {
  it('renders a published article from its slug without leaking asset prompts', async () => {
    const html = renderToStaticMarkup(
      await ArticlePage({ params: Promise.resolve({ slug: SLUG }) }),
    )

    expect(html).toContain('Automations are shifting toward agent handoffs')
    expect(html).toContain('The signal')
    expect(html).toContain('Hero image')
    expect(html).not.toContain('Create a wide editorial hero image for a Hermes article')
    expect(html).toContain('/topics/ai-automation/')
    expect(html).toContain('/archive/')
  })
})
