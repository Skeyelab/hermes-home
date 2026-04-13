import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import TopicPage from './page'

const SLUG = 'automations-are-shifting-toward-agent-handoffs-20260411-signal-1'
const ARTICLE = {
  slug: SLUG,
  title: 'Automations are shifting toward agent handoffs',
  excerpt: 'People are discussing workflows.',
  publishedAt: '2026-04-11T00:00:00Z',
  topic: 'AI automation',
  topicSlug: 'ai-automation',
  sections: [],
  assets: [],
}

vi.mock('../../../content/articles', () => ({
  getPublishedTopics: vi.fn().mockResolvedValue([
    { topic: 'AI automation', topicSlug: 'ai-automation', count: 1 },
  ]),
  getPublishedTopicBySlug: vi.fn().mockImplementation(async (slug: string) => {
    if (slug !== 'ai-automation') return null
    return { topic: 'AI automation', topicSlug: 'ai-automation', count: 1 }
  }),
  getPublishedArticlesByTopic: vi.fn().mockImplementation(async (topicSlug: string) => {
    if (topicSlug !== 'ai-automation') return []
    return [ARTICLE]
  }),
}))

describe('topic page', () => {
  it('renders a tighter topic archive for a topic slug', async () => {
    const html = renderToStaticMarkup(await TopicPage({ params: Promise.resolve({ topic: 'ai-automation' }) }))

    expect(html).toContain('AI automation')
    expect(html).toContain('Every published piece filed under this topic.')
    expect(html).not.toContain('All Hermes Signal articles currently published under this topic.')
    expect(html).toContain('Automations are shifting toward agent handoffs')
    expect(html).toContain(`/articles/${SLUG}/`)
  })
})
