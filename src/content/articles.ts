import { draftPostFromSignal } from '../lib/drafts'

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildTopicSlug(topic: string): string {
  return slugify(topic) || 'uncategorized'
}

export type PublishedArticle = ReturnType<typeof draftPostFromSignal> & {
  topic: string
  topicSlug: string
}

export type PublishedTopic = {
  topic: string
  topicSlug: string
  count: number
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

const publishedArticles: PublishedArticle[] = [
  {
    ...draftPostFromSignal(signal),
    topic: 'AI automation',
    topicSlug: buildTopicSlug('AI automation'),
  },
]

export function getPublishedArticles(): PublishedArticle[] {
  return publishedArticles
}

export function getPublishedArticleBySlug(slug: string): PublishedArticle | null {
  return publishedArticles.find((article) => article.slug === slug) ?? null
}

export function getPublishedArticlesByTopic(topicSlug: string): PublishedArticle[] {
  return publishedArticles.filter((article) => article.topicSlug === topicSlug)
}

export function getPublishedTopics(): PublishedTopic[] {
  const topics = new Map<string, PublishedTopic>()

  for (const article of publishedArticles) {
    const existing = topics.get(article.topicSlug)
    if (existing) {
      existing.count += 1
      continue
    }

    topics.set(article.topicSlug, {
      topic: article.topic,
      topicSlug: article.topicSlug,
      count: 1,
    })
  }

  return [...topics.values()].sort((left, right) => left.topic.localeCompare(right.topic))
}

export function getPublishedTopicBySlug(topicSlug: string): PublishedTopic | null {
  return getPublishedTopics().find((topic) => topic.topicSlug === topicSlug) ?? null
}
