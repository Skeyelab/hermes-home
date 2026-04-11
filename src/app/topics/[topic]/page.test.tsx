import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import TopicPage from './page'

describe('topic page', () => {
  it('renders the topic archive for a topic slug', () => {
    const html = renderToStaticMarkup(TopicPage({ params: { topic: 'ai-automation' } }))

    expect(html).toContain('AI automation')
    expect(html).toContain('Automations are shifting toward agent handoffs')
    expect(html).toContain('/articles/automations-are-shifting-toward-agent-handoffs-20260411-signal-1/')
  })
})
