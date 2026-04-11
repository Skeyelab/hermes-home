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

export function draftPostFromSignal(signal: SignalInsight): DraftPost {
  const title = buildDraftTitle(signal)
  const slug = buildDraftSlug(signal, title)

  return {
    title,
    slug,
    excerpt: `${signal.summary} The practical takeaway is to keep the workflow observable and explicit.`,
    sourceId: signal.id,
    sourceUrl: signal.url,
    publishedAt: signal.publishedAt,
    sections: [
      {
        heading: 'The signal',
        body: signal.summary,
      },
      {
        heading: 'Why it matters',
        body: signal.evidence.join(' '),
      },
      {
        heading: 'A practical tip',
        body: signal.practicalTip,
      },
      {
        heading: 'What to do next',
        body: 'Turn the pattern into a repeatable checklist, then test it on one narrow workflow before expanding.',
      },
    ],
  }
}
