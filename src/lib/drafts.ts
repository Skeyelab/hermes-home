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

export function draftPostFromSignal(signal: SignalInsight): DraftPost {
  const title = 'Agent handoffs need observable state'
  const slug = 'agent-handoffs-need-observable-state'

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
