export type SignalItem = {
  id: string
  title: string
  source: string
  url: string
  publishedAt: string
  mentions: number
  relevance: number
  evidenceStrength: number
}

const DAY_MS = 24 * 60 * 60 * 1000

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function scoreSignal(signal: SignalItem, now = new Date('2026-04-11T00:00:00Z')): number {
  const publishedAt = new Date(signal.publishedAt)
  const ageDays = Math.max(0, (now.getTime() - publishedAt.getTime()) / DAY_MS)
  const recencyScore = clamp(1 - ageDays / 14, 0, 1)
  const mentionScore = clamp(signal.mentions / 5, 0, 1)
  const relevanceScore = clamp(signal.relevance, 0, 1)
  const evidenceScore = clamp(signal.evidenceStrength, 0, 1)

  return recencyScore * 0.35 + mentionScore * 0.25 + relevanceScore * 0.2 + evidenceScore * 0.2
}

export function selectTopSignals(items: SignalItem[], limit: number, now?: Date): SignalItem[] {
  return [...items]
    .sort((a, b) => {
      const scoreDelta = scoreSignal(b, now) - scoreSignal(a, now)
      if (scoreDelta !== 0) return scoreDelta
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })
    .slice(0, limit)
}
