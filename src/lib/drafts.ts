import type { DraftAssetRecord } from '../content/store'

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

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function wrapLines(value: string, maxChars: number): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) {
    return ['']
  }

  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }

  if (current) {
    lines.push(current)
  }

  return lines.slice(0, 4)
}

function buildAssetDataUrl(params: {
  title: string
  summary: string
  topic: string
  width: number
  height: number
  accent: string
  label: string
}): string {
  const { title, summary, topic, width, height, accent, label } = params
  const titleLines = wrapLines(title, width >= 1100 ? 20 : 14)
  const summaryLines = wrapLines(summary, width >= 1100 ? 34 : 24)
  const titleText = titleLines
    .map((line, index) => `<tspan x="64" dy="${index === 0 ? 0 : 1.08}em">${escapeXml(line)}</tspan>`)
    .join('')
  const summaryText = summaryLines
    .map((line, index) => `<tspan x="64" dy="${index === 0 ? 0 : 1.15}em">${escapeXml(line)}</tspan>`)
    .join('')

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">`,
    `<defs>`,
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">`,
    `<stop offset="0%" stop-color="#08111b"/>`,
    `<stop offset="100%" stop-color="#11263b"/>`,
    `</linearGradient>`,
    `<linearGradient id="glow" x1="0" y1="0" x2="1" y2="0">`,
    `<stop offset="0%" stop-color="${accent}" stop-opacity="0.2"/>`,
    `<stop offset="100%" stop-color="#66d7ff" stop-opacity="0.7"/>`,
    `</linearGradient>`,
    `</defs>`,
    `<rect width="${width}" height="${height}" rx="48" fill="url(#bg)"/>`,
    `<circle cx="${Math.round(width * 0.78)}" cy="${Math.round(height * 0.26)}" r="${Math.round(Math.min(width, height) * 0.22)}" fill="${accent}" fill-opacity="0.12"/>`,
    `<circle cx="${Math.round(width * 0.86)}" cy="${Math.round(height * 0.14)}" r="${Math.round(Math.min(width, height) * 0.1)}" fill="#ffffff" fill-opacity="0.06"/>`,
    `<rect x="48" y="48" width="${width - 96}" height="${height - 96}" rx="36" stroke="rgba(255,255,255,0.12)"/>`,
    `<text x="64" y="104" fill="#66d7ff" font-family="Inter, system-ui, sans-serif" font-size="24" letter-spacing="3">${escapeXml(label)}</text>`,
    `<text x="64" y="184" fill="#ffffff" font-family="Inter, system-ui, sans-serif" font-size="${width >= 1100 ? 72 : 84}" font-weight="700" letter-spacing="-1.5">${titleText}</text>`,
    `<text x="64" y="${width >= 1100 ? 340 : 390}" fill="rgba(231,241,255,0.84)" font-family="Inter, system-ui, sans-serif" font-size="${width >= 1100 ? 30 : 34}" font-weight="400">${summaryText}</text>`,
    `<rect x="64" y="${height - 132}" width="${Math.min(width - 128, 440)}" height="48" rx="24" fill="url(#glow)"/>`,
    `<text x="84" y="${height - 100}" fill="#08111b" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="700">${escapeXml(topic)}</text>`,
    `</svg>`,
  ].join('')

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function buildDraftAssets(signal: SignalInsight): DraftAssetRecord[] {
  const heroPrompt = `Create a wide editorial hero image for a Hermes article about ${signal.title}. Style: dark navy, cyan glow, geometric, calm, editorial, no photorealism.`
  const socialPrompt = `Create a square social card image for a Hermes article about ${signal.title}. Style: dark navy, cyan glow, geometric, crisp typography, consistent brand treatment.`

  return [
    {
      kind: 'hero',
      assetUrl: buildAssetDataUrl({
        title: signal.title,
        summary: signal.summary,
        topic: signal.source,
        width: 1200,
        height: 630,
        accent: '#66d7ff',
        label: 'HERMES HERO',
      }),
      prompt: heroPrompt,
      altText: `${signal.title} hero image`,
      sortOrder: 0,
    },
    {
      kind: 'social',
      assetUrl: buildAssetDataUrl({
        title: signal.title,
        summary: signal.practicalTip,
        topic: signal.source,
        width: 1080,
        height: 1080,
        accent: '#9adcff',
        label: 'HERMES SHARE',
      }),
      prompt: socialPrompt,
      altText: `${signal.title} social share image`,
      sortOrder: 1,
    },
  ]
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
    assets: buildDraftAssets(signal),
  }
}
