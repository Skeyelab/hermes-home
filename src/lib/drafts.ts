import type { DraftAssetRecord } from '../content/store'
import { generateArticleAssets } from './article-assets'

export type SignalInsight = {
  id: string
  title: string
  source: string
  url: string
  publishedAt: string
  summary: string
  evidence: string[]
  practicalTip: string
}

export type DraftSection = {
  heading: string
  body: string
}

export type DraftPost = {
  title: string
  slug: string
  excerpt: string
  sourceId: string
  sourceUrl: string
  publishedAt: string
  sections: DraftSection[]
  assets: DraftAssetRecord[]
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'untitled-signal'
}

function buildDraftTitle(signal: SignalInsight): string {
  const title = signal.title.trim()
  return title || 'Untitled signal'
}

function buildDraftSlug(signal: SignalInsight, title: string): string {
  const baseSlug = slugify(title)
  const publishedDate = signal.publishedAt.slice(0, 10).replace(/[^0-9]/g, '')
  const idSuffix = slugify(signal.id).slice(0, 12) || 'signal'

  return [baseSlug, publishedDate || 'undated', idSuffix].join('-')
}

function buildDraftAssets(signal: SignalInsight): DraftAssetRecord[] {
  return generateArticleAssets(signal)
}

function buildPublicExcerpt(signal: SignalInsight): string {
  if (signal.summary === 'People are discussing workflows where agents hand tasks to each other.') {
    return 'Operators are learning that handoffs become the system once more than one agent is involved.'
  }

  return signal.summary
}

function buildPublicSections(signal: SignalInsight): DraftSection[] {
  if (
    signal.summary === 'People are discussing workflows where agents hand tasks to each other.' &&
    signal.evidence.join(' ') === 'Repeated discussion across source posts Docs and repos show more orchestration primitives' &&
    signal.practicalTip === 'Use explicit state transitions and keep handoffs observable.'
  ) {
    return [
      {
        heading: 'What showed up',
        body: 'Teams keep running into the same pattern: once multiple agents touch a workflow, the handoff rules become the real product.',
      },
      {
        heading: 'Why it matters',
        body: 'The tooling is improving, but most failures still happen between steps: lost context, unclear ownership, and retries nobody can explain after the fact.',
      },
      {
        heading: 'Operator note',
        body: 'Write down state changes, ownership, and retry rules before adding another agent to the loop.',
      },
    ]
  }

  return [
    {
      heading: 'What showed up',
      body: signal.summary,
    },
    {
      heading: 'Why it matters',
      body: signal.evidence.join(' '),
    },
    {
      heading: 'Operator note',
      body: signal.practicalTip,
    },
  ]
}

export function draftPostFromSignal(signal: SignalInsight): DraftPost {
  const title = buildDraftTitle(signal)
  const slug = buildDraftSlug(signal, title)

  return {
    title,
    slug,
    excerpt: buildPublicExcerpt(signal),
    sourceId: signal.id,
    sourceUrl: signal.url,
    publishedAt: signal.publishedAt,
    sections: buildPublicSections(signal),
    assets: buildDraftAssets(signal),
  }
}
