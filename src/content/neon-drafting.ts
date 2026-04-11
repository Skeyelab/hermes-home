import { Pool } from 'pg'
import { resolveDirectDatabaseUrl } from '../ingest/database-url'
import type { ContentQueryExecutor } from './store'
import type {
  DraftGenerationSource,
  DraftRecordInput,
  DraftRepository,
  RankedSignalItem,
} from './drafting'

function toIsoString(value: Date | string | null | undefined): string {
  const fallback = new Date(0).toISOString()

  if (!value) {
    return fallback
  }

  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.toISOString() : fallback
  }

  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toISOString() : fallback
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') {
      return 0
    }

    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
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

      const rows = result.rows as Array<{
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
      }>

      const signalIds = rows.map((r) => r.id)

      const evidenceResult = await executor.query(
        `select signal_item_id, evidence_text
         from signal_evidence
         where signal_item_id = any($1)
         order by sort_order asc`,
        [signalIds],
      )

      const evidenceBySignalId = new Map<string, string[]>()
      for (const row of evidenceResult.rows as Array<{ signal_item_id: string; evidence_text?: string }>) {
        const list = evidenceBySignalId.get(row.signal_item_id) ?? []
        list.push(String(row.evidence_text ?? ''))
        evidenceBySignalId.set(row.signal_item_id, list)
      }

      return rows.map((signal) => ({
        databaseId: signal.id,
        id: signal.source_item_id,
        title: signal.title,
        source: signal.source,
        url: signal.canonical_url,
        publishedAt: toIsoString(signal.published_at),
        score: toNumber(signal.score),
        summary: signal.summary,
        evidence: evidenceBySignalId.get(signal.id) ?? [],
        practicalTip: signal.practical_tip,
        topic: signal.topic,
      } satisfies RankedSignalItem))
    },
  }
}

export function createNeonDraftRepository(pool: Pool): DraftRepository {
  return {
    async upsertDrafts(drafts) {
      const client = await pool.connect()
      let inserted = 0
      let updated = 0

      await client.query('BEGIN')
      try {
        for (const draft of drafts) {
          const draftResult = await client.query(
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

          await client.query('delete from draft_sections where draft_post_id = $1', [draftPostId])
          await client.query('delete from draft_assets where draft_post_id = $1', [draftPostId])

          for (const section of draft.sections) {
            await client.query(
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
            await client.query(
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

        await client.query('COMMIT')
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }

      return { inserted, updated }
    },
  }
}

let cachedPool: Pool | null = null

function getOrCreatePool(): Pool {
  if (!cachedPool) {
    const databaseUrl = resolveDirectDatabaseUrl()
    cachedPool = new Pool({
      connectionString: databaseUrl,
      allowExitOnIdle: true,
    })
  }

  return cachedPool
}

export function createNeonDraftSourceFromUrl(): DraftGenerationSource {
  return createNeonDraftSource(getOrCreatePool())
}

export function createNeonDraftRepositoryFromUrl(): DraftRepository {
  return createNeonDraftRepository(getOrCreatePool())
}
