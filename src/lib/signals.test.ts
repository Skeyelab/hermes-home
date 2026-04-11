import { describe, expect, it } from 'vitest'
import { scoreSignal, selectTopSignals, type SignalItem } from './signals'

describe('scoreSignal', () => {
  it('gives higher scores to more recent and repeated signals', () => {
    const base: SignalItem = {
      id: '1',
      title: 'Tool release',
      source: 'github',
      url: 'https://example.com/1',
      publishedAt: '2026-04-10T00:00:00Z',
      mentions: 1,
      relevance: 0.5,
      evidenceStrength: 0.5,
    }

    const stronger: SignalItem = {
      ...base,
      publishedAt: '2026-04-11T00:00:00Z',
      mentions: 4,
    }

    expect(scoreSignal(stronger)).toBeGreaterThan(scoreSignal(base))
  })
})

describe('selectTopSignals', () => {
  it('returns the highest scoring items first', () => {
    const items: SignalItem[] = [
      {
        id: 'a',
        title: 'Old but relevant',
        source: 'rss',
        url: 'https://example.com/a',
        publishedAt: '2026-04-01T00:00:00Z',
        mentions: 1,
        relevance: 0.4,
        evidenceStrength: 0.8,
      },
      {
        id: 'b',
        title: 'Fresh and repeated',
        source: 'github',
        url: 'https://example.com/b',
        publishedAt: '2026-04-11T00:00:00Z',
        mentions: 5,
        relevance: 0.7,
        evidenceStrength: 0.9,
      },
      {
        id: 'c',
        title: 'Medium',
        source: 'hn',
        url: 'https://example.com/c',
        publishedAt: '2026-04-09T00:00:00Z',
        mentions: 2,
        relevance: 0.6,
        evidenceStrength: 0.6,
      },
    ]

    const top = selectTopSignals(items, 2)

    expect(top).toHaveLength(2)
    expect(top[0].id).toBe('b')
    expect(top[1].id).toBe('c')
  })
})
