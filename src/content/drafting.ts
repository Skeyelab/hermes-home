import { draftPostFromSignal, type SignalInsight } from '../lib/drafts'
import type { DraftPostRecord } from './store'

export type RankedSignalItem = {
  databaseId: string
  id: string
  title: string
  source: string
  url: string
  publishedAt: string
  score: number
  summary: string
  evidence: string[]
  practicalTip: string
  topic: string
}

export type DraftGenerationSource = {
  listSignals: (limit: number) => Promise<RankedSignalItem[]>
}

export type DraftGenerationInput = {
  source: DraftGenerationSource
  repository: DraftRepository
  now?: Date
  limit?: number
}

export type DraftRepository = {
  upsertDrafts: (
    drafts: DraftRecordInput[],
  ) => Promise<{
    inserted: number
    updated: number
  }>
}

export type DraftRecordInput = Omit<DraftPostRecord, 'id'>

export type DraftGenerationReport = {
  generated: number
  stored: number
  topDrafts: DraftRecordInput[]
}

function normalizeScoreTieBreaker(left: RankedSignalItem, right: RankedSignalItem): number {
  const publishedAtDelta = new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
  if (publishedAtDelta !== 0) {
    return publishedAtDelta
  }

  return left.id.localeCompare(right.id)
}

function selectTopRankedSignals(items: RankedSignalItem[], limit: number): RankedSignalItem[] {
  return [...items]
    .sort((left, right) => {
      const scoreDelta = right.score - left.score
      if (scoreDelta !== 0) {
        return scoreDelta
      }

      return normalizeScoreTieBreaker(left, right)
    })
    .slice(0, limit)
}

function toSignalInsight(signal: RankedSignalItem): SignalInsight {
  return {
    id: signal.id,
    title: signal.title,
    source: signal.source,
    url: signal.url,
    publishedAt: signal.publishedAt,
    summary: signal.summary,
    evidence: signal.evidence,
    practicalTip: signal.practicalTip,
  }
}

function toDraftRecord(signal: RankedSignalItem, generatedAt: Date): DraftRecordInput {
  const draft = draftPostFromSignal(toSignalInsight(signal))

  return {
    signalItemId: signal.databaseId,
    title: draft.title,
    slug: draft.slug,
    excerpt: draft.excerpt,
    topic: signal.topic,
    status: 'draft',
    generatedAt: generatedAt.toISOString(),
    publishedAt: null,
    sections: draft.sections.map((section, index) => ({
      sectionKey: `${section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'section'}-${index + 1}`,
      heading: section.heading,
      body: section.body,
      sortOrder: index,
    })),
    assets: draft.assets,
  }
}

export function buildDraftRecords(
  signals: RankedSignalItem[],
  now = new Date(),
  limit = 5,
): DraftRecordInput[] {
  return selectTopRankedSignals(signals, limit).map((signal) => toDraftRecord(signal, now))
}

export async function runDraftGeneration({
  source,
  repository,
  now = new Date(),
  limit = 5,
}: DraftGenerationInput): Promise<DraftGenerationReport> {
  const signals = await source.listSignals(Math.max(limit * 2, limit))
  const drafts = buildDraftRecords(signals, now, limit)
  const result = await repository.upsertDrafts(drafts)

  return {
    generated: drafts.length,
    stored: result.inserted + result.updated,
    topDrafts: drafts,
  }
}
