import { describe, expect, it } from 'vitest'
import { generateArticleAssets } from './article-assets'

describe('generateArticleAssets', () => {
  it('produces deterministic hero and social assets for a signal', () => {
    const assets = generateArticleAssets({
      id: 'signal-1',
      title: 'Automations are shifting toward agent handoffs',
      source: 'hn',
      url: 'https://example.com/signal-1',
      publishedAt: '2026-04-11T00:00:00Z',
      summary: 'People are discussing workflows where agents hand tasks to each other.',
      evidence: ['Repeated discussion across source posts'],
      practicalTip: 'Use explicit state transitions and keep handoffs observable.',
    })

    expect(assets).toHaveLength(2)
    expect(assets.map((asset) => asset.kind)).toEqual(['hero', 'social'])
    expect(assets.map((asset) => asset.sortOrder)).toEqual([0, 1])
    expect(assets[0].altText).toBe('Automations are shifting toward agent handoffs hero image')
    expect(assets[1].altText).toBe('Automations are shifting toward agent handoffs social share image')
    expect(assets[0].assetUrl).toMatch(/^data:image\/svg\+xml;charset=UTF-8,/)
    expect(assets[1].assetUrl).toMatch(/^data:image\/svg\+xml;charset=UTF-8,/)

    const heroSvg = decodeURIComponent(assets[0].assetUrl.split(',')[1] ?? '')
    const socialSvg = decodeURIComponent(assets[1].assetUrl.split(',')[1] ?? '')

    expect(heroSvg).toContain('width="1200"')
    expect(heroSvg).toContain('height="630"')
    expect(heroSvg).toContain('HERMES HERO')
    expect(heroSvg).toContain('Automations are')
    expect(heroSvg).toContain('shifting toward')
    expect(heroSvg).toContain('agent handoffs')
    expect(socialSvg).toContain('width="1080"')
    expect(socialSvg).toContain('height="1080"')
    expect(socialSvg).toContain('HERMES SHARE')
    expect(socialSvg).toContain('Use explicit state')
    expect(socialSvg).toContain('transitions and keep')
    expect(socialSvg).toContain('handoffs observable.')
  })
})
