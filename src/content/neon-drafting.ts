import { Pool } from 'pg'
import { resolveDirectDatabaseUrl } from '../ingest/database-url'
import type { ContentQueryExecutor, DraftAssetRecord, DraftSectionRecord } from './store'
import type {
  DraftGenerationSource,
  DraftRecordInput,
  DraftRepository,
  RankedSignalItem,
} from './drafting'

function toIsoString(value: Date | string | null | undefined): string {
  if (!value) {
    return new Date(0).toISOString()
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  return new Date(value).toISOString()
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    return Number(value)
  }

  return 0
}

async function loadSignalEvidence(executor: ContentQueryExecutor, signalItemId: string): Promise<string[]> {
  const result = await executor.query(
    `select evidence_text
     from signal_evidence
     where signal_item_id = $1
     order by sort_order asc`,
    [signalItemId],
  )

  return result.rows.map((row) => String((row as { evidence_text?: string }).evidence_text ?? ''))
}

export function createNeonDraftSource(executor: ContentQueryExecutor): DraftGenerationSource {
  return {
    async listSignals(limit) {
      const result = await executor.query(
        `select id, source_item_id, source, title, canonical_url, source_url, published_at, summary, practical_tip, topic, score
         from signal_items
         order by score desc, published_at desc nulls last
         limit $1`,
        [limit],
      )

      const signals = await Promise.all(
        result.rows.map(async (row) => {
          const signal = row as {
            id: string
            source_item_id: string
            source: string
            title: string
            canonical_url: string
            source_url?: string | null
            published_at: Date | string | null
            summary: string
            practical_tip: string
            topic: string
            score: number | string
          }

          const evidence = await loadSignalEvidence(executor, signal.id)

          return {
            databaseId: signal.id,
            id: signal.source_item_id,
            title: signal.title,
            source: signal.source,
            url: signal.canonical_url,
            publishedAt: toIsoString(signal.published_at),
            score: toNumber(signal.score),
            summary: signal.summary,
            evidence,
            practicalTip: signal.practical_tip,
            topic: signal.topic,
          } satisfies RankedSignalItem
        }),
      )

      return signals
    },
  }
}

export function createNeonDraftRepository(executor: ContentQueryExecutor): DraftRepository {
  return {
    async upsertDrafts(drafts) {
      let inserted = 0
      let updated = 0

      await executor.query('BEGIN')
      try {
        for (const draft of drafts) {
          const draftResult = await executor.query(
            `insert into draft_posts (
              signal_item_id,
              title,
              slug,
              excerpt,
              topic,
              status,
              generated_at,
              published_at
            ) values ($1, $2, $3, $4, $5, $6, $7, $8)
            on conflict (slug) do update set
              signal_item_id = excluded.signal_item_id,
              title = excluded.title,
              excerpt = excluded.excerpt,
              topic = excluded.topic,
              status = case
                when draft_posts.status = 'published' then draft_posts.status
                else excluded.status
              end,
              generated_at = excluded.generated_at,
              published_at = case
                when draft_posts.status = 'published' then draft_posts.published_at
                else excluded.published_at
              end,
              updated_at = now()
            returning id, xmax = 0 as inserted`,
            [
              draft.signalItemId,
              draft.title,
              draft.slug,
              draft.excerpt,
              draft.topic,
              draft.status,
              new Date(draft.generatedAt),
              draft.publishedAt ? new Date(draft.publishedAt) : null,
            ],
          )

          const draftRow = draftResult.rows[0] as { id?: string; inserted?: boolean } | undefined
          const draftPostId = draftRow?.id

          if (!draftPostId) {
            throw new Error(`Unable to persist draft: ${draft.slug}`)
          }

          if (draftRow?.inserted) {
            inserted += 1
          } else {
            updated += 1
          }

          await executor.query('delete from draft_sections where draft_post_id = $1', [draftPostId])
          await executor.query('delete from draft_assets where draft_post_id = $1', [draftPostId])

          for (const section of draft.sections) {
            await executor.query(
              `insert into draft_sections (
                draft_post_id,
                sort_order,
                section_key,
                heading,
                body
              ) values ($1, $2, $3, $4, $5)
              on conflict (draft_post_id, sort_order) do update set
                section_key = excluded.section_key,
                heading = excluded.heading,
                body = excluded.body`,
              [
                draftPostId,
                section.sortOrder,
                section.sectionKey,
                section.heading,
                section.body,
              ],
            )
          }

          for (const asset of draft.assets) {
            await executor.query(
              `insert into draft_assets (
                draft_post_id,
                sort_order,
                kind,
                asset_url,
                prompt,
                alt_text
              ) values ($1, $2, $3, $4, $5, $6)
              on conflict (draft_post_id, sort_order) do update set
                kind = excluded.kind,
                asset_url = excluded.asset_url,
                prompt = excluded.prompt,
                alt_text = excluded.alt_text`,
              [
                draftPostId,
                asset.sortOrder,
                asset.kind,
                asset.assetUrl,
                asset.prompt ?? null,
                asset.altText,
              ],
            )
          }
        }

        await executor.query('COMMIT')
      } catch (error) {
        await executor.query('ROLLBACK')
        throw error
      }

      return { inserted, updated }
    },
  }
}

export function createNeonDraftSourceFromUrl(): DraftGenerationSource {
  const databaseUrl = resolveDirectDatabaseUrl()
  const pool = new Pool({
    connectionString: databaseUrl,
    allowExitOnIdle: true,
  })

  return createNeonDraftSource(pool)
}

export function createNeonDraftRepositoryFromUrl(): DraftRepository {
  const databaseUrl = resolveDirectDatabaseUrl()
  const pool = new Pool({
    connectionString: databaseUrl,
    allowExitOnIdle: true,
  })

  return createNeonDraftRepository(pool)
}
