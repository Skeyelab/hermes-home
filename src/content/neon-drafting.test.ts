import { describe, expect, it } from 'vitest'
import { createNeonDraftRepository, createNeonDraftSource } from './neon-drafting'
import type { ContentQueryExecutor } from './store'

describe('neon drafting adapters', () => {
  it('loads ranked signals with evidence from Neon', async () => {
    const queries: Array<{ sql: string; params?: unknown[] }> = []
    const executor: ContentQueryExecutor = {
      query: async (sql, params) => {
        queries.push({ sql, params })

        if (sql.includes('from signal_items')) {
          return {
            rows: [
              {
                id: 'signal-db-1',
                source_item_id: 'source-1',
                source: 'reddit',
                title: 'A signal',
                canonical_url: 'https://example.com/signal',
                source_url: 'https://source.example.com',
                published_at: new Date('2026-04-11T10:00:00Z'),
                summary: 'Summary',
                practical_tip: 'Tip',
                topic: 'automation',
                score: '0.75',
              },
            ],
          }
        }

        return {
          rows: [{ evidence_text: 'First evidence' }, { evidence_text: 'Second evidence' }],
        }
      },
    }

    const source = createNeonDraftSource(executor)
    const signals = await source.listSignals(1)

    expect(signals).toEqual([
      {
        databaseId: 'signal-db-1',
        id: 'source-1',
        title: 'A signal',
        source: 'reddit',
        url: 'https://example.com/signal',
        publishedAt: '2026-04-11T10:00:00.000Z',
        score: 0.75,
        summary: 'Summary',
        evidence: ['First evidence', 'Second evidence'],
        practicalTip: 'Tip',
        topic: 'automation',
      },
    ])
    expect(queries[0]).toMatchObject({
      sql: expect.stringContaining('from signal_items'),
      params: [1],
    })
    expect(queries.some((query) => query.sql.includes('from signal_evidence'))).toBe(true)
  })

  it('persists drafts with sections and assets in Neon', async () => {
    const queries: Array<{ sql: string; params?: unknown[] }> = []
    const executor: ContentQueryExecutor = {
      query: async (sql, params) => {
        queries.push({ sql, params })

        if (sql.includes('insert into draft_posts')) {
          return { rows: [{ id: 'draft-db-1', inserted: true }] }
        }

        return { rows: [] }
      },
    }

    const repository = createNeonDraftRepository(executor)
    const result = await repository.upsertDrafts([
      {
        signalItemId: 'signal-db-1',
        title: 'A signal',
        slug: 'a-signal-20260411-source-1',
        excerpt: 'Excerpt',
        topic: 'automation',
        status: 'draft',
        generatedAt: '2026-04-12T12:00:00.000Z',
        publishedAt: null,
        sections: [
          { sectionKey: 'the-signal-1', heading: 'The signal', body: 'Body', sortOrder: 0 },
        ],
        assets: [
          {
            kind: 'hero',
            assetUrl: 'https://example.com/hero.png',
            altText: 'Hero image',
            prompt: 'Prompt',
            sortOrder: 0,
          },
        ],
      },
    ])

    expect(result).toEqual({ inserted: 1, updated: 0 })
    expect(queries.map((query) => query.sql)).toEqual([
      'BEGIN',
      expect.stringContaining('insert into draft_posts'),
      'delete from draft_sections where draft_post_id = $1',
      'delete from draft_assets where draft_post_id = $1',
      expect.stringContaining('insert into draft_sections'),
      expect.stringContaining('insert into draft_assets'),
      'COMMIT',
    ])
  })
})
