import { describe, expect, it } from 'vitest'
import { buildDraftRecords, runDraftGeneration, type DraftGenerationSource, type DraftRepository, type RankedSignalItem } from './drafting'

describe('content drafting pipeline', () => {
  it('ranks signals by score and date before drafting', () => {
    const signals: RankedSignalItem[] = [
      {
        databaseId: 'db-1',
        id: 'signal-a',
        title: 'Alpha signal',
        source: 'reddit',
        url: 'https://example.com/a',
        publishedAt: '2026-04-10T10:00:00Z',
        score: 0.82,
        summary: 'Alpha summary',
        evidence: ['Alpha evidence'],
        practicalTip: 'Alpha tip',
        topic: 'automation',
      },
      {
        databaseId: 'db-2',
        id: 'signal-b',
        title: 'Beta signal',
        source: 'hn',
        url: 'https://example.com/b',
        publishedAt: '2026-04-11T10:00:00Z',
        score: 0.82,
        summary: 'Beta summary',
        evidence: ['Beta evidence'],
        practicalTip: 'Beta tip',
        topic: 'automation',
      },
      {
        databaseId: 'db-3',
        id: 'signal-c',
        title: 'Gamma signal',
        source: 'x',
        url: 'https://example.com/c',
        publishedAt: '2026-04-12T10:00:00Z',
        score: 0.91,
        summary: 'Gamma summary',
        evidence: ['Gamma evidence'],
        practicalTip: 'Gamma tip',
        topic: 'automation',
      },
    ]

    const drafts = buildDraftRecords(signals, new Date('2026-04-12T12:00:00Z'), 2)

    expect(drafts).toHaveLength(2)
    expect(drafts[0]).toMatchObject({
      signalItemId: 'db-3',
      title: 'Gamma signal',
      slug: 'gamma-signal-20260412-signal-c',
      topic: 'automation',
    })
    expect(drafts[0].sections).toHaveLength(4)
    expect(drafts[0].sections.slice(0, 2)).toMatchObject([
      { sectionKey: 'the-signal-1', heading: 'The signal', body: 'Gamma summary', sortOrder: 0 },
      { sectionKey: 'why-it-matters-2', heading: 'Why it matters', body: 'Gamma evidence', sortOrder: 1 },
    ])
    expect(drafts[1]).toMatchObject({
      signalItemId: 'db-2',
      title: 'Beta signal',
      slug: 'beta-signal-20260411-signal-b',
    })
  })

  it('loads top signals from a source and persists drafted posts', async () => {
    const source: DraftGenerationSource = {
      async listSignals(limit) {
        expect(limit).toBe(6)
        return [
          {
            databaseId: 'db-1',
            id: 'signal-a',
            title: 'Alpha signal',
            source: 'reddit',
            url: 'https://example.com/a',
            publishedAt: '2026-04-10T10:00:00Z',
            score: 0.5,
            summary: 'Alpha summary',
            evidence: ['Alpha evidence'],
            practicalTip: 'Alpha tip',
            topic: 'automation',
          },
          {
            databaseId: 'db-2',
            id: 'signal-b',
            title: 'Beta signal',
            source: 'hn',
            url: 'https://example.com/b',
            publishedAt: '2026-04-11T10:00:00Z',
            score: 0.9,
            summary: 'Beta summary',
            evidence: ['Beta evidence'],
            practicalTip: 'Beta tip',
            topic: 'automation',
          },
        ]
      },
    }

    const persistedDrafts: Array<{ signalItemId: string; slug: string }> = []
    const repository: DraftRepository = {
      async upsertDrafts(drafts) {
        persistedDrafts.push(...drafts.map((draft) => ({ signalItemId: draft.signalItemId, slug: draft.slug })))
        return { inserted: drafts.length, updated: 0 }
      },
    }

    const report = await runDraftGeneration({
      source,
      repository,
      now: new Date('2026-04-12T12:00:00Z'),
      limit: 3,
    })

    expect(report).toMatchObject({
      generated: 2,
      stored: 2,
    })
    expect(persistedDrafts).toEqual([
      {
        signalItemId: 'db-2',
        slug: 'beta-signal-20260411-signal-b',
      },
      {
        signalItemId: 'db-1',
        slug: 'alpha-signal-20260410-signal-a',
      },
    ])
  })
})
