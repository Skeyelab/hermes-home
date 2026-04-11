import { describe, expect, it } from 'vitest'
import { getPublishedArticles } from './articles'

describe('getPublishedArticles', () => {
  it('returns publishable article records for the homepage', () => {
    const articles = getPublishedArticles()

    expect(articles).toHaveLength(1)
    expect(articles[0]).toMatchObject({
      slug: 'agent-handoffs-need-observable-state',
      title: 'Agent handoffs need observable state',
      topic: 'AI automation',
    })
    expect(articles[0].sections[0].heading).toBe('The signal')
  })
})
