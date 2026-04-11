import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ArchivePage from './page'

describe('archive page', () => {
  it('renders the archive view with topic and article links', () => {
    const html = renderToStaticMarkup(ArchivePage())

    expect(html).toContain('Published Hermes Signal articles, grouped by topic.')
    expect(html).toContain('/topics/ai-automation')
    expect(html).toContain('/articles/automations-are-shifting-toward-agent-handoffs-20260411-signal-1')
  })
})
