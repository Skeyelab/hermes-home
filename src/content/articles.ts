import { draftPostFromSignal } from '../lib/drafts'

export type PublishedArticle = ReturnType<typeof draftPostFromSignal> & {
  topic: string
}

const signal = {
  id: 'signal-1',
  title: 'Automations are shifting toward agent handoffs',
  source: 'hn',
  url: 'https://example.com/signal-1',
  publishedAt: '2026-04-11T00:00:00Z',
  summary: 'People are discussing workflows where agents hand tasks to each other.',
  evidence: [
    'Repeated discussion across source posts',
    'Docs and repos show more orchestration primitives',
  ],
  practicalTip: 'Use explicit state transitions and keep handoffs observable.',
}

export function getPublishedArticles(): PublishedArticle[] {
  return [
    {
      ...draftPostFromSignal(signal),
      topic: 'AI automation',
    },
  ]
}
