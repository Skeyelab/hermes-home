import { scoreSignal, selectTopSignals, type SignalItem } from '../lib/signals'

export type SignalSource = {
  name: string
  collectSignals: (now: Date) => Promise<SignalItem[]>
}

export type SignalRepository = {
  upsertSignals: (
    signals: SignalItem[],
  ) => Promise<{ inserted: number; updated: number }>
}

export type IngestionReport = {
  collected: number
  deduped: number
  stored: number
  topSignals: SignalItem[]
  sourceBreakdown: Array<{
    source: string
    collected: number
  }>
}

export type RunSignalIngestionInput = {
  sources: SignalSource[]
  repository: SignalRepository
  now?: Date
  limit?: number
}

function normalizeSignalKey(signal: SignalItem): string {
  const urlKey = signal.url.trim().toLowerCase()
  if (urlKey) {
    return urlKey
  }

  return `${signal.source}:${signal.id}`
}

function dedupeSignals(signals: SignalItem[], now: Date): SignalItem[] {
  const byKey = new Map<string, SignalItem>()

  for (const signal of signals) {
    const key = normalizeSignalKey(signal)
    const existing = byKey.get(key)

    if (!existing) {
      byKey.set(key, signal)
      continue
    }

    const incomingScore = scoreSignal(signal, now)
    const existingScore = scoreSignal(existing, now)

    if (incomingScore > existingScore) {
      byKey.set(key, signal)
      continue
    }

    if (incomingScore === existingScore) {
      const existingPublishedAt = new Date(existing.publishedAt).getTime()
      const incomingPublishedAt = new Date(signal.publishedAt).getTime()

      if (incomingPublishedAt > existingPublishedAt) {
        byKey.set(key, signal)
      }
    }
  }

  return [...byKey.values()]
}

export async function runSignalIngestion({
  sources,
  repository,
  now = new Date(),
  limit = 10,
}: RunSignalIngestionInput): Promise<IngestionReport> {
  const collectedBySource = await Promise.all(
    sources.map(async (source) => ({
      source: source.name,
      signals: await source.collectSignals(now),
    })),
  )

  const collectedSignals = collectedBySource.flatMap((entry) => entry.signals)
  const dedupedSignals = dedupeSignals(collectedSignals, now)
  const topSignals = selectTopSignals(dedupedSignals, limit, now).map((signal) => ({
    ...signal,
    score: scoreSignal(signal, now),
  }))
  const result = await repository.upsertSignals(topSignals)

  return {
    collected: collectedSignals.length,
    deduped: dedupedSignals.length,
    stored: result.inserted + result.updated,
    topSignals,
    sourceBreakdown: collectedBySource.map((entry) => ({
      source: entry.source,
      collected: entry.signals.length,
    })),
  }
}
