import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import Page from '../../src/app/page'

describe('homepage', () => {
  it('renders the signal-based publication home screen', () => {
    const html = renderToStaticMarkup(Page())

    expect(html).toContain('Hermes Signal')
    expect(html).toContain('Agent handoffs need observable state')
    expect(html).toContain('AI automation')
  })
})
