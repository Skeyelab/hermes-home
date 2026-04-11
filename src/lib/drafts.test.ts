import { describe, expect, it } from 'vitest'
import { draftPostFromSignal, type SignalInsight } from './drafts'

describe('draftPostFromSignal', () => {
  it('turns a signal into a structured draft post', () => {
    const insight: SignalInsight = {
      id: 'signal-1',
      title: 'Automations are shifting toward agent handoffs',
      source: 'hn',
      url: 'https://example.com/signal-1',
      publishedAt: '2026-04-11T00:00:00Z',
      summary: 'People are discussing workflows where agents hand tasks to each other.',
      evidence: [
        'Repeated discussion across source posts',
        'Docs and repos show more orchestration primitives',
      ],
      practicalTip: 'Use explicit state transitions and keep handoffs observable.',
    }

    const draft = draftPostFromSignal(insight)

    expect(draft.slug).toBe(
      'automations-are-shifting-toward-agent-handoffs-20260411-signal-1',
    )
    expect(draft.title).toMatch(/agent handoffs/i)
    expect(draft.excerpt).toContain('observable')
    expect(draft.sections.map((section) => section.heading)).toEqual([
      'The signal',
      'Why it matters',
      'A practical tip',
      'What to do next',
    ])
    expect(draft.sections[0].body).toContain('agents hand tasks to each other')
    expect(draft.sections[2].body).toContain('explicit state transitions')
  })
})
