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

type ArticleStore = Pick<ReturnType<typeof createNeonContentStore>, 'listDraftPosts' | 'getDraftPost'>

export function createArticleCatalog(store: ArticleStore) {
  async function getPublishedArticles(): Promise<PublishedArticle[]> {
    const summaries = await store.listDraftPosts('published')
    const detailed = await Promise.all(summaries.map((s) => store.getDraftPost(s.slug)))
    return detailed
      .filter((r): r is DraftPostRecord => r !== null)
      .map(toPublishedArticle)
  }

  async function getPublishedArticleBySlug(slug: string): Promise<PublishedArticle | null> {
    const record = await store.getDraftPost(slug)
    if (!record || record.status !== 'published') return null
    return toPublishedArticle(record)
  }

  async function getPublishedArticlesByTopic(topicSlug: string): Promise<PublishedArticle[]> {
    const articles = await getPublishedArticles()
    return articles.filter((a) => a.topicSlug === topicSlug)
  }

  async function getPublishedTopics(): Promise<PublishedTopic[]> {
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
  }

  async function getPublishedTopicBySlug(topicSlug: string): Promise<PublishedTopic | null> {
    const topics = await getPublishedTopics()
    return topics.find((t) => t.topicSlug === topicSlug) ?? null
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

let defaultCatalog: ReturnType<typeof createArticleCatalog> | null = null

function getDefaultCatalog(): ReturnType<typeof createArticleCatalog> {
  if (!defaultCatalog) {
    defaultCatalog = createArticleCatalog(createNeonContentStoreFromUrl())
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
