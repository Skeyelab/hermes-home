import { describe, expect, it } from 'vitest'
import { runSignalIngestion, type SignalRepository, type SignalSource } from './pipeline'
import type { SignalItem } from '../lib/signals'

describe('runSignalIngestion', () => {
  it('collects, dedupes, ranks, and stores signals from multiple sources', async () => {
    const sources: SignalSource[] = [
      {
        name: 'reddit',
        collectSignals: async () => [
          {
            id: 'reddit-1',
            title: 'Agents need better handoff state',
            source: 'reddit',
            url: 'https://example.com/same',
            publishedAt: '2026-04-11T12:00:00Z',
            mentions: 3,
            relevance: 0.7,
            evidenceStrength: 0.8,
          },
        ],
      },
      {
        name: 'github',
        collectSignals: async () => [
          {
            id: 'github-1',
            title: 'Agents need better handoff state',
            source: 'github',
            url: 'https://example.com/same',
            publishedAt: '2026-04-11T13:00:00Z',
            mentions: 5,
            relevance: 0.9,
            evidenceStrength: 0.95,
          },
          {
            id: 'github-2',
            title: 'Workflow state machines are getting simpler',
            source: 'github',
            url: 'https://example.com/unique',
            publishedAt: '2026-04-09T13:00:00Z',
            mentions: 2,
            relevance: 0.6,
            evidenceStrength: 0.7,
          },
        ],
      },
    ]

    const stored: SignalItem[] = []
    const repository: SignalRepository = {
      upsertSignals: async (signals) => {
        stored.push(...signals)
        return { inserted: signals.length, updated: 0 }
      },
    }

    const report = await runSignalIngestion({
      sources,
      repository,
      now: new Date('2026-04-11T14:00:00Z'),
      limit: 10,
    })

    expect(report.collected).toBe(3)
    expect(report.deduped).toBe(2)
    expect(report.stored).toBe(2)
    expect(report.topSignals.map((signal) => signal.id)).toEqual(['github-1', 'github-2'])
    expect(stored.map((signal) => signal.id)).toEqual(['github-1', 'github-2'])
  })

  it('keeps the highest scoring duplicate when two sources point at the same url', async () => {
    const sources: SignalSource[] = [
      {
        name: 'rss',
        collectSignals: async () => [
          {
            id: 'rss-1',
            title: 'Same story',
            source: 'rss',
            url: 'https://example.com/story',
            publishedAt: '2026-04-10T00:00:00Z',
            mentions: 1,
            relevance: 0.2,
            evidenceStrength: 0.2,
          },
        ],
      },
      {
        name: 'reddit',
        collectSignals: async () => [
          {
            id: 'reddit-1',
            title: 'Same story',
            source: 'reddit',
            url: 'https://example.com/story',
            publishedAt: '2026-04-11T00:00:00Z',
            mentions: 4,
            relevance: 0.8,
            evidenceStrength: 0.9,
          },
        ],
      },
    ]

    const repository: SignalRepository = {
      upsertSignals: async (signals) => ({ inserted: signals.length, updated: 0 }),
    }

    const report = await runSignalIngestion({
      sources,
      repository,
      now: new Date('2026-04-11T12:00:00Z'),
      limit: 10,
    })

    expect(report.deduped).toBe(1)
    expect(report.topSignals).toHaveLength(1)
    expect(report.topSignals[0].source).toBe('reddit')
    expect(report.topSignals[0].mentions).toBe(4)
  })
})
