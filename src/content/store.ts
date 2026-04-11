import { Pool } from 'pg'
import { resolveDirectDatabaseUrl } from '../ingest/database-url'

export type DraftStatus = 'draft' | 'review' | 'published' | 'rejected'

export type ContentQueryExecutor = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: any[] }>
}

export type DraftSectionRecord = {
  sectionKey: string
  heading: string
  body: string
  sortOrder: number
}

export type DraftAssetRecord = {
  kind: string
  assetUrl: string
  prompt: string | null
  altText: string
  sortOrder: number
}

export type DraftPostRecord = {
  id: string
  signalItemId: string
  title: string
  slug: string
  excerpt: string
  topic: string
  status: DraftStatus
  generatedAt: string
  publishedAt: string | null
  sections: DraftSectionRecord[]
  assets: DraftAssetRecord[]
}

function normalizeTimestamp(value: unknown): string | null {
  if (value == null) return null
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return value
  return String(value)
}

function toDraftPostRecord(row: any): DraftPostRecord {
  return {
    id: row.id,
    signalItemId: row.signal_item_id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    topic: row.topic,
    status: row.status,
    generatedAt: normalizeTimestamp(row.generated_at) ?? new Date(0).toISOString(),
    publishedAt: normalizeTimestamp(row.published_at),
    sections: [],
    assets: [],
  }
}

async function loadDraftDetails(executor: ContentQueryExecutor, draftId: string) {
  const sectionsResult = await executor.query(
    `select section_key, heading, body, sort_order
     from draft_sections
     where draft_post_id = $1
     order by sort_order asc`,
    [draftId],
  )

  const assetsResult = await executor.query(
    `select kind, asset_url, prompt, alt_text, sort_order
     from draft_assets
     where draft_post_id = $1
     order by sort_order asc`,
    [draftId],
  )

  return {
    sections: sectionsResult.rows.map((row) => ({
      sectionKey: row.section_key,
      heading: row.heading,
      body: row.body,
      sortOrder: row.sort_order,
    })),
    assets: assetsResult.rows.map((row) => ({
      kind: row.kind,
      assetUrl: row.asset_url,
      prompt: row.prompt,
      altText: row.alt_text,
      sortOrder: row.sort_order,
    })),
  }
}

export function createNeonContentStore(executor: ContentQueryExecutor) {
  return {
    async listDraftPosts(status?: DraftStatus): Promise<DraftPostRecord[]> {
      const params = status ? [status] : []
      const whereClause = status ? 'where status = $1' : ''
      const result = await executor.query(
        `select id, signal_item_id, title, slug, excerpt, topic, status, generated_at, published_at
         from draft_posts
         ${whereClause}
         order by generated_at desc, created_at desc`,
        params,
      )

      return result.rows.map(toDraftPostRecord)
    },

    async getDraftPost(slug: string): Promise<DraftPostRecord | null> {
      const result = await executor.query(
        `select id, signal_item_id, title, slug, excerpt, topic, status, generated_at, published_at
         from draft_posts
         where slug = $1
         limit 1`,
        [slug],
      )

      const draft = result.rows[0]
      if (!draft) return null

      const detail = toDraftPostRecord(draft)
      const content = await loadDraftDetails(executor, detail.id)
      return {
        ...detail,
        ...content,
      }
    },

    async updateDraftStatus(slug: string, status: DraftStatus): Promise<void> {
      const result = await executor.query(
        `update draft_posts
         set status = $1,
             published_at = case when $1 = 'published' then coalesce(published_at, now()) else published_at end,
             updated_at = now()
         where slug = $2
         returning id`,
        [status, slug],
      )

      if (result.rows.length === 0) {
        throw new Error(`No draft found for slug: ${slug}`)
      }
    },
  }
}

let cachedStore: ReturnType<typeof createNeonContentStore> | null = null

export function createNeonContentStoreFromUrl() {
  if (cachedStore) {
    return cachedStore
  }

  const databaseUrl = resolveDirectDatabaseUrl()
  const pool = new Pool({
    connectionString: databaseUrl,
    allowExitOnIdle: true,
  })

  cachedStore = createNeonContentStore(pool)
  return cachedStore
}
