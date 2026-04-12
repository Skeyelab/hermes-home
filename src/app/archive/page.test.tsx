import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ArchivePage from './page'

const SLUG = 'automations-are-shifting-toward-agent-handoffs-20260411-signal-1'

vi.mock('../../content/articles', () => ({
  getPublishedArticles: vi.fn().mockResolvedValue([
    {
      slug: 'automations-are-shifting-toward-agent-handoffs-20260411-signal-1',
      title: 'Automations are shifting toward agent handoffs',
      excerpt: 'People are discussing workflows.',
      publishedAt: '2026-04-11T00:00:00Z',
      topic: 'AI automation',
      topicSlug: 'ai-automation',
      sections: [],
      assets: [],
    },
  ]),
  getPublishedTopics: vi.fn().mockResolvedValue([
    { topic: 'AI automation', topicSlug: 'ai-automation', count: 1 },
  ]),
}))

describe('archive page', () => {
  it('renders the archive view with topic and article links', async () => {
    const html = renderToStaticMarkup(await ArchivePage())

    expect(html).toContain('Published Hermes Signal articles, grouped by topic.')
    expect(html).toContain('/topics/ai-automation/')
    expect(html).toContain(`/articles/${SLUG}/`)
  })
})
