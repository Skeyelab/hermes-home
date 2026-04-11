import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import Page from '../../src/app/page'

describe('homepage', () => {
  it('renders the signal-based publication home screen', () => {
    const html = renderToStaticMarkup(Page())

    expect(html).toContain('Hermes Signal')
    expect(html).toContain('Automations are shifting toward agent handoffs')
    expect(html).toContain('AI automation')
    expect(html).toContain('/archive/')
    expect(html).toContain('/articles/automations-are-shifting-toward-agent-handoffs-20260411-signal-1/')
  })
})
