import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ArticlePage from './page'

describe('article page', () => {
  it('renders a published article from its slug', () => {
    const html = renderToStaticMarkup(
      ArticlePage({ params: { slug: 'automations-are-shifting-toward-agent-handoffs-20260411-signal-1' } }),
    )

    expect(html).toContain('Automations are shifting toward agent handoffs')
    expect(html).toContain('The signal')
    expect(html).toContain('/topics/ai-automation')
    expect(html).toContain('/archive')
  })
})
