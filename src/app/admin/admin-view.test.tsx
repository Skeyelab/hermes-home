import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { AdminDraftsView } from './admin-view'

describe('AdminDraftsView', () => {
  it('renders draft review actions and status labels', () => {
    const html = renderToStaticMarkup(
      <AdminDraftsView
        drafts={[
          {
            id: 'draft-1',
            signalItemId: 'signal-1',
            title: 'Draft one',
            slug: 'draft-one',
            excerpt: 'First draft',
            topic: 'ai automation',
            status: 'review',
            generatedAt: '2026-04-11T10:00:00Z',
            publishedAt: null,
            sections: [
              { sectionKey: 'signal', heading: 'The signal', body: 'Body', sortOrder: 0 },
            ],
            assets: [],
          },
        ]}
      />,
    )

    expect(html).toContain('Draft one')
    expect(html).toContain('review')
    expect(html).toContain('Approve')
    expect(html).toContain('Reject')
  })
})
