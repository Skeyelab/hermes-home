import { describe, expect, it } from 'vitest'
import { parseRedditListing, parseRssFeed } from './sources'

describe('parseRssFeed', () => {
  it('turns rss items into signal records', () => {
    const signals = parseRssFeed(
      `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <item>
            <title>Agent handoffs need explicit state</title>
            <link>https://example.com/rss-story</link>
            <guid>rss-1</guid>
            <pubDate>Sat, 11 Apr 2026 12:00:00 GMT</pubDate>
            <description>Maintainers are discussing how to coordinate work between agents.</description>
          </item>
        </channel>
      </rss>`,
      {
        source: 'github-rss',
        sourceUrl: 'https://example.com/feed.xml',
      },
    )

    expect(signals).toHaveLength(1)
    expect(signals[0]).toMatchObject({
      id: 'rss-1',
      source: 'github-rss',
      title: 'Agent handoffs need explicit state',
      url: 'https://example.com/rss-story',
      sourceUrl: 'https://example.com/feed.xml',
      mentions: 1,
      relevance: expect.any(Number),
      evidenceStrength: expect.any(Number),
    })
  })
})

describe('parseRedditListing', () => {
  it('turns reddit posts into signal records', () => {
    const signals = parseRedditListing(
      {
        data: {
          children: [
            {
              data: {
                id: 'abc123',
                title: 'What are people using for agent workflows?',
                url: 'https://reddit.com/r/automation/comments/abc123',
                created_utc: 1775908800,
                score: 512,
                num_comments: 84,
              },
            },
          ],
        },
      },
      {
        subreddit: 'automation',
        sourceUrl: 'https://www.reddit.com/r/automation/new.json',
      },
    )

    expect(signals).toHaveLength(1)
    expect(signals[0]).toMatchObject({
      id: 'abc123',
      source: 'reddit/automation',
      title: 'What are people using for agent workflows?',
      url: 'https://reddit.com/r/automation/comments/abc123',
      sourceUrl: 'https://www.reddit.com/r/automation/new.json',
      publishedAt: '2026-04-11T12:00:00.000Z',
      mentions: 12,
      relevance: expect.any(Number),
      evidenceStrength: expect.any(Number),
    })
  })
})
