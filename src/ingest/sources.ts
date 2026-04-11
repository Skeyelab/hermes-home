import type { SignalItem } from '../lib/signals'

export type RssFeedOptions = {
  source: string
  sourceUrl: string
}

export type RedditListingOptions = {
  subreddit: string
  sourceUrl: string
}

export type RedditListing = {
  data?: {
    children?: Array<{
      data?: {
        id?: string
        title?: string
        url?: string
        permalink?: string
        created_utc?: number
        score?: number
        num_comments?: number
      }
    }>
  }
}

const DAY_MS = 24 * 60 * 60 * 1000

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function parseDate(value: string | undefined, fallback: Date): Date {
  if (!value) return fallback
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed
}

function normalizeText(value: string | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

function extractTagContent(source: string, tag: string): string[] {
  const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi')
  const matches: string[] = []
  let match: RegExpExecArray | null
  while ((match = pattern.exec(source))) {
    matches.push(match[1])
  }
  return matches
}

function extractTagValue(source: string, tag: string): string {
  const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  return source.match(pattern)?.[1] ?? ''
}

function stripHtml(value: string): string {
  return value.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, ' ')
}

function buildSignal(params: {
  id: string
  title: string
  source: string
  url: string
  sourceUrl: string
  publishedAt: Date
  mentions: number
  relevance: number
  evidenceStrength: number
}): SignalItem {
  return {
    id: params.id,
    title: normalizeText(params.title),
    source: params.source,
    url: params.url,
    sourceUrl: params.sourceUrl,
    publishedAt: params.publishedAt.toISOString(),
    mentions: params.mentions,
    relevance: clamp(params.relevance, 0, 1),
    evidenceStrength: clamp(params.evidenceStrength, 0, 1),
  }
}

export function parseRssFeed(xml: string, options: RssFeedOptions): SignalItem[] {
  const items = extractTagContent(xml, 'item')

  return items.flatMap((item) => {
    const title = normalizeText(stripHtml(extractTagValue(item, 'title')))
    const link = normalizeText(extractTagValue(item, 'link'))
    const guid = normalizeText(extractTagValue(item, 'guid') || link)
    const pubDate = parseDate(extractTagValue(item, 'pubDate'), new Date())
    const description = normalizeText(stripHtml(extractTagValue(item, 'description')))

    if (!title || !link) return []

    return [
      buildSignal({
        id: guid || link,
        title,
        source: options.source,
        url: link,
        sourceUrl: options.sourceUrl,
        publishedAt: pubDate,
        mentions: 1,
        relevance: description.length > 0 ? 0.68 : 0.55,
        evidenceStrength: description.length > 0 ? 0.78 : 0.62,
      }),
    ]
  })
}

export function parseRedditListing(listing: RedditListing, options: RedditListingOptions): SignalItem[] {
  return (listing.data?.children ?? []).flatMap((child) => {
    const post = child.data
    if (!post?.id || !post.title || !post.url) return []

    const score = post.score ?? 0
    const commentCount = post.num_comments ?? 0
    const mentions = Math.max(1, Math.round((score + commentCount) / 50))
    const relevance = clamp(0.55 + Math.min(0.35, commentCount / 200), 0, 1)
    const evidenceStrength = clamp(0.6 + Math.min(0.35, score / 2000), 0, 1)
    const publishedAt = new Date((post.created_utc ?? Date.now() / 1000) * 1000)

    return [
      buildSignal({
        id: post.id,
        title: post.title,
        source: `reddit/${options.subreddit}`,
        url: post.url,
        sourceUrl: options.sourceUrl,
        publishedAt,
        mentions,
        relevance,
        evidenceStrength,
      }),
    ]
  })
}

export async function collectRssSignals(feedUrl: string, source: string): Promise<SignalItem[]> {
  const timeoutMs = 10_000
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(feedUrl, {
      headers: {
        accept: 'application/rss+xml, application/xml;q=0.9, */*;q=0.1',
        'user-agent': 'HermesSignal/1.0 (+https://hermes.ger3.ericdahl.dev)',
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed ${feedUrl}: ${response.status} ${response.statusText}`)
    }

    return parseRssFeed(await response.text(), { source, sourceUrl: feedUrl })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Timed out fetching RSS feed ${feedUrl} after ${timeoutMs}ms`)
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function collectRedditSignals(subreddit: string): Promise<SignalItem[]> {
  const sourceUrl = `https://www.reddit.com/r/${subreddit}/new.json?limit=25`
  const timeoutMs = 10_000
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        accept: 'application/json',
        'user-agent': 'HermesSignal/1.0 (+https://hermes.ger3.ericdahl.dev)',
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch Reddit listing ${sourceUrl}: ${response.status} ${response.statusText}`)
    }

    return parseRedditListing((await response.json()) as RedditListing, {
      subreddit,
      sourceUrl,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Timed out fetching Reddit listing ${sourceUrl} after ${timeoutMs}ms`)
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export function scoreAgeInDays(publishedAt: string, now = new Date()) {
  const publishedAtMs = new Date(publishedAt).getTime()
  if (Number.isNaN(publishedAtMs)) return 0

  return Math.max(0, (now.getTime() - publishedAtMs) / DAY_MS)
}
