import { Pool } from 'pg'
import { resolveDirectDatabaseUrl } from './database-url'
import { scoreSignal, type SignalItem } from '../lib/signals'
import type { SignalRepository } from './pipeline'

export type SignalQueryExecutor = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: Array<{ id?: string; inserted?: boolean }> }>
}

export type PersistedSignalInput = SignalItem & {
  summary?: string
  practicalTip?: string
  topic?: string
  evidence?: string[]
  sourceUrl?: string
}

function toPersistedSignal(signal: PersistedSignalInput) {
  return {
    source: signal.source,
    sourceItemId: signal.id,
    title: signal.title,
    canonicalUrl: signal.url,
    sourceUrl: signal.sourceUrl ?? null,
    publishedAt: signal.publishedAt ? new Date(signal.publishedAt) : null,
    summary: signal.summary ?? signal.title,
    practicalTip: signal.practicalTip ?? 'Keep the workflow observable and explicit.',
    topic: signal.topic ?? 'general',
    score: signal.score ?? scoreSignal(signal),
    evidence: signal.evidence ?? [],
  }
}

async function upsertOneSignal(
  executor: SignalQueryExecutor,
  signal: PersistedSignalInput,
): Promise<{ inserted: boolean }> {
  const payload = toPersistedSignal(signal)
  const signalResult = await executor.query(
    `insert into signal_items (
      source,
      source_item_id,
      title,
      canonical_url,
      source_url,
      published_at,
      summary,
      practical_tip,
      topic,
      score
    ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    on conflict (source, source_item_id) do update set
      title = excluded.title,
      canonical_url = excluded.canonical_url,
      source_url = excluded.source_url,
      published_at = excluded.published_at,
      summary = excluded.summary,
      practical_tip = excluded.practical_tip,
      topic = excluded.topic,
      score = excluded.score,
      updated_at = now()
    returning id, xmax = 0 as inserted`,
    [
      payload.source,
      payload.sourceItemId,
      payload.title,
      payload.canonicalUrl,
      payload.sourceUrl,
      payload.publishedAt,
      payload.summary,
      payload.practicalTip,
      payload.topic,
      payload.score ?? 0,
    ],
  )

  const row = signalResult.rows[0]
  const inserted = Boolean(row?.inserted)
  const signalItemId = row?.id

  if (signalItemId) {
    await executor.query('delete from signal_evidence where signal_item_id = $1', [signalItemId])

    for (const [index, evidenceText] of payload.evidence.entries()) {
      await executor.query(
        `insert into signal_evidence (signal_item_id, sort_order, evidence_text)
         values ($1, $2, $3)
         on conflict (signal_item_id, sort_order) do update set
           evidence_text = excluded.evidence_text`,
        [signalItemId, index, evidenceText],
      )
    }
  }

  return { inserted }
}

export function createNeonSignalRepository(executor: SignalQueryExecutor): SignalRepository {
  return {
    async upsertSignals(signals) {
      let inserted = 0
      let updated = 0

      await executor.query('BEGIN')
      try {
        for (const signal of signals) {
          const result = await upsertOneSignal(executor, signal)
          if (result.inserted) {
            inserted += 1
          } else {
            updated += 1
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

export function createNeonSignalRepositoryFromUrl(): SignalRepository {
  const databaseUrl = resolveDirectDatabaseUrl()
  const pool = new Pool({
    connectionString: databaseUrl,
    allowExitOnIdle: true,
  })

  return createNeonSignalRepository(pool)
}
