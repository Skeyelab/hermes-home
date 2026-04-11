import { describe, expect, it } from 'vitest'
import {
  buildTopicSlug,
  getPublishedArticleBySlug,
  getPublishedArticles,
  getPublishedArticlesByTopic,
  getPublishedTopics,
} from './articles'

describe('published article catalog', () => {
  it('returns publishable article records for the homepage', () => {
    const articles = getPublishedArticles()

    expect(articles).toHaveLength(1)
    expect(articles[0]).toMatchObject({
      slug: 'automations-are-shifting-toward-agent-handoffs-20260411-signal-1',
      title: 'Automations are shifting toward agent handoffs',
      topic: 'AI automation',
      topicSlug: 'ai-automation',
    })
    expect(articles[0].sections[0].heading).toBe('The signal')
  })

  it('supports archive and topic lookup helpers', () => {
    expect(buildTopicSlug('AI automation')).toBe('ai-automation')
    expect(getPublishedArticleBySlug('missing')).toBeNull()
    expect(getPublishedArticlesByTopic('ai-automation')).toHaveLength(1)
    expect(getPublishedTopics()).toEqual([
      {
        topic: 'AI automation',
        topicSlug: 'ai-automation',
        count: 1,
      },
    ])
  })
})
