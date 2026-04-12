import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import Page from '../../src/app/page'

const SLUG = 'automations-are-shifting-toward-agent-handoffs-20260411-signal-1'

vi.mock('../../src/content/articles', () => ({
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
  getPublishedTopics: vi.fn().mockResolvedValue([
    { topic: 'AI automation', topicSlug: 'ai-automation', count: 1 },
  ]),
}))

describe('homepage', () => {
  it('renders the redesigned publication home screen', async () => {
    const html = renderToStaticMarkup(await Page())

    expect(html).toContain('Hermes Signal')
    expect(html).toContain('Editorial signal, shaped like a product instead of a blog dump.')
    expect(html).toContain('Live pulse')
    expect(html).toContain('Published stories')
    expect(html).toContain('Content engine workflow')
    expect(html).toContain('Automations are shifting toward agent handoffs')
    expect(html).toContain('Signals by theme')
    expect(html).toContain('/archive/')
    expect(html).toContain(`/articles/${SLUG}/`)
  })
})
