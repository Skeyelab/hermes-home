import { draftPostFromSignal, type SignalInsight } from '../lib/drafts'
import {
  createNeonContentStore,
  createNeonContentStoreFromUrl,
  type ContentQueryExecutor,
  type DraftPostRecord,
} from './store'

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

export type PublishedArticle = {
  title: string
  slug: string
  excerpt: string
  publishedAt: string
  topic: string
  topicSlug: string
  sections: Array<{ heading: string; body: string }>
  assets: Array<{
    kind: string
    assetUrl: string
    prompt: string | null
    altText: string
    sortOrder: number
  }>
}

export type PublishedTopic = {
  topic: string
  topicSlug: string
  count: number
}

type ArticleCatalog = {
  getPublishedArticles: () => Promise<PublishedArticle[]>
  getPublishedArticleBySlug: (slug: string) => Promise<PublishedArticle | null>
  getPublishedArticlesByTopic: (topicSlug: string) => Promise<PublishedArticle[]>
  getPublishedTopics: () => Promise<PublishedTopic[]>
  getPublishedTopicBySlug: (topicSlug: string) => Promise<PublishedTopic | null>
}

function toPublishedArticle(record: DraftPostRecord): PublishedArticle {
  return {
    title: record.title,
    slug: record.slug,
    excerpt: record.excerpt,
    // publishedAt is set when a draft is approved; fall back to generatedAt
    // for drafts that were published before the column was populated.
    publishedAt: record.publishedAt ?? record.generatedAt,
    topic: record.topic,
    topicSlug: buildTopicSlug(record.topic),
    sections: record.sections,
    assets: record.assets,
  }
}

const fallbackSignal: SignalInsight = {
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

const fallbackPublishedArticle: PublishedArticle = {
  ...draftPostFromSignal(fallbackSignal),
  topic: 'AI automation',
  topicSlug: buildTopicSlug('AI automation'),
}

const fallbackPublishedTopics: PublishedTopic[] = [
  {
    topic: fallbackPublishedArticle.topic,
    topicSlug: fallbackPublishedArticle.topicSlug,
    count: 1,
  },
]

function createSeededArticleCatalog(): ArticleCatalog {
  return {
    async getPublishedArticles() {
      return [fallbackPublishedArticle]
    },
    async getPublishedArticleBySlug(slug: string) {
      return fallbackPublishedArticle.slug === slug ? fallbackPublishedArticle : null
    },
    async getPublishedArticlesByTopic(topicSlug: string) {
      return fallbackPublishedArticle.topicSlug === topicSlug ? [fallbackPublishedArticle] : []
    },
    async getPublishedTopics() {
      return fallbackPublishedTopics
    },
    async getPublishedTopicBySlug(topicSlug: string) {
      return fallbackPublishedTopics.find((topic) => topic.topicSlug === topicSlug) ?? null
    },
  }
}

const seededArticleCatalog = createSeededArticleCatalog()

type ArticleStore = Pick<ReturnType<typeof createNeonContentStore>, 'listDraftPosts' | 'getDraftPost'>

export function createArticleCatalog(store: ArticleStore, fallbackCatalog: ArticleCatalog = seededArticleCatalog): ArticleCatalog {
  async function getPublishedArticles(): Promise<PublishedArticle[]> {
    try {
      const summaries = await store.listDraftPosts('published')
      const detailed = await Promise.all(summaries.map((s) => store.getDraftPost(s.slug)))
      return detailed
        .filter((r): r is DraftPostRecord => r !== null)
        .map(toPublishedArticle)
    } catch {
      return fallbackCatalog.getPublishedArticles()
    }
  }

  async function getPublishedArticleBySlug(slug: string): Promise<PublishedArticle | null> {
    try {
      const record = await store.getDraftPost(slug)
      if (!record || record.status !== 'published') return null
      return toPublishedArticle(record)
    } catch {
      return fallbackCatalog.getPublishedArticleBySlug(slug)
    }
  }

  async function getPublishedArticlesByTopic(topicSlug: string): Promise<PublishedArticle[]> {
    try {
      const articles = await getPublishedArticles()
      return articles.filter((a) => a.topicSlug === topicSlug)
    } catch {
      return fallbackCatalog.getPublishedArticlesByTopic(topicSlug)
    }
  }

  async function getPublishedTopics(): Promise<PublishedTopic[]> {
    try {
      const articles = await getPublishedArticles()
      const topics = new Map<string, PublishedTopic>()

      for (const article of articles) {
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
    } catch {
      return fallbackCatalog.getPublishedTopics()
    }
  }

  async function getPublishedTopicBySlug(topicSlug: string): Promise<PublishedTopic | null> {
    try {
      const topics = await getPublishedTopics()
      return topics.find((t) => t.topicSlug === topicSlug) ?? null
    } catch {
      return fallbackCatalog.getPublishedTopicBySlug(topicSlug)
    }
  }

  return {
    getPublishedArticles,
    getPublishedArticleBySlug,
    getPublishedArticlesByTopic,
    getPublishedTopics,
    getPublishedTopicBySlug,
  }
}

export function createArticleCatalogFromExecutor(executor: ContentQueryExecutor) {
  return createArticleCatalog(createNeonContentStore(executor))
}

let defaultCatalog: ArticleCatalog | null = null

function getDefaultCatalog(): ArticleCatalog {
  if (!defaultCatalog) {
    try {
      defaultCatalog = createArticleCatalog(createNeonContentStoreFromUrl())
    } catch {
      defaultCatalog = seededArticleCatalog
    }
  }
  return defaultCatalog
}

export function getPublishedArticles(): Promise<PublishedArticle[]> {
  return getDefaultCatalog().getPublishedArticles()
}

export function getPublishedArticleBySlug(slug: string): Promise<PublishedArticle | null> {
  return getDefaultCatalog().getPublishedArticleBySlug(slug)
}

export function getPublishedArticlesByTopic(topicSlug: string): Promise<PublishedArticle[]> {
  return getDefaultCatalog().getPublishedArticlesByTopic(topicSlug)
}

export function getPublishedTopics(): Promise<PublishedTopic[]> {
  return getDefaultCatalog().getPublishedTopics()
}

export function getPublishedTopicBySlug(topicSlug: string): Promise<PublishedTopic | null> {
  return getDefaultCatalog().getPublishedTopicBySlug(topicSlug)
}
