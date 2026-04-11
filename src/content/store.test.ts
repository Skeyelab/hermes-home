import { describe, expect, it } from 'vitest'
import { createNeonContentStore, type ContentQueryExecutor } from './store'

describe('createNeonContentStore', () => {
  it('lists drafts ordered by freshness', async () => {
    const queries: Array<{ sql: string; params?: unknown[] }> = []
    const executor: ContentQueryExecutor = {
      query: async (sql, params) => {
        queries.push({ sql, params })
        return {
          rows: [
            {
              id: 'draft-1',
              signal_item_id: 'signal-1',
              title: 'Draft one',
              slug: 'draft-one',
              excerpt: 'First draft',
              topic: 'ai automation',
              status: 'draft',
              generated_at: new Date('2026-04-11T10:00:00Z'),
              published_at: null,
            },
          ],
        }
      },
    }

    const store = createNeonContentStore(executor)
    const drafts = await store.listDraftPosts('draft')

    expect(drafts).toHaveLength(1)
    expect(drafts[0]).toMatchObject({
      slug: 'draft-one',
      status: 'draft',
      title: 'Draft one',
    })
    expect(queries[0]).toMatchObject({
      sql: expect.stringContaining('from draft_posts'),
      params: ['draft'],
    })
  })

  it('loads a draft with sections and assets', async () => {
    const queries: Array<{ sql: string; params?: unknown[] }> = []
    const executor: ContentQueryExecutor = {
      query: async (sql, params) => {
        queries.push({ sql, params })

        if (sql.includes('from draft_posts')) {
          return {
            rows: [
              {
                id: 'draft-1',
                signal_item_id: 'signal-1',
                title: 'Draft one',
                slug: 'draft-one',
                excerpt: 'First draft',
                topic: 'ai automation',
                status: 'review',
                generated_at: new Date('2026-04-11T10:00:00Z'),
                published_at: null,
              },
            ],
          }
        }

        if (sql.includes('from draft_sections')) {
          return {
            rows: [
              {
                sort_order: 0,
                section_key: 'signal',
                heading: 'The signal',
                body: 'Signal body',
              },
            ],
          }
        }

        return {
          rows: [
            {
              sort_order: 0,
              kind: 'hero',
              asset_url: 'https://example.com/asset.png',
              prompt: 'A prompt',
              alt_text: 'Alt text',
            },
          ],
        }
      },
    }

    const store = createNeonContentStore(executor)
    const draft = await store.getDraftPost('draft-one')

    expect(draft).toMatchObject({
      slug: 'draft-one',
      status: 'review',
      sections: [
        {
          sectionKey: 'signal',
          heading: 'The signal',
        },
      ],
      assets: [
        {
          kind: 'hero',
          assetUrl: 'https://example.com/asset.png',
        },
      ],
    })
    expect(queries.some((query) => query.sql.includes('from draft_sections'))).toBe(true)
    expect(queries.some((query) => query.sql.includes('from draft_assets'))).toBe(true)
  })

  it('updates a draft status', async () => {
    const queries: Array<{ sql: string; params?: unknown[] }> = []
    const executor: ContentQueryExecutor = {
      query: async (sql, params) => {
        queries.push({ sql, params })
        return { rows: [{ id: 'draft-1' }] }
      },
    }

    const store = createNeonContentStore(executor)
    await store.updateDraftStatus('draft-one', 'published')

    expect(queries).toEqual([
      {
        sql: expect.stringContaining('update draft_posts'),
        params: ['published', 'draft-one'],
      },
    ])
  })

  it('throws when a draft slug does not exist', async () => {
    const executor: ContentQueryExecutor = {
      query: async () => ({ rows: [] }),
    }

    const store = createNeonContentStore(executor)

    await expect(store.updateDraftStatus('missing', 'published')).rejects.toThrow(
      'No draft found for slug: missing',
    )
  })
})
