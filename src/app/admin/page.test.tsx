import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import AdminPage from './page'

const listDraftPosts = vi.fn()
const getDraftPost = vi.fn()

vi.mock('../../content/store', () => ({
  createNeonContentStoreFromUrl: vi.fn(() => ({
    listDraftPosts,
    getDraftPost,
  })),
}))

vi.mock('./actions', () => ({
  approveDraftAction: vi.fn(),
  rejectDraftAction: vi.fn(),
}))

describe('admin page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders an operator notice instead of crashing when the draft schema is missing', async () => {
    listDraftPosts.mockRejectedValueOnce(
      Object.assign(new Error('relation "draft_posts" does not exist'), {
        code: '42P01',
      }),
    )

    const html = renderToStaticMarkup(await AdminPage())

    expect(html).toContain('Draft storage is not initialized yet')
    expect(html).toContain('Run the Neon schema setup for Hermes Home to enable admin review.')
    expect(html).toContain('No drafts yet')
  })

  it('rethrows unrelated store failures', async () => {
    listDraftPosts.mockRejectedValueOnce(new Error('database unavailable'))

    await expect(AdminPage()).rejects.toThrow('database unavailable')
  })
})
