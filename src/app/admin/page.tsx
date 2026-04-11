import { createNeonContentStoreFromUrl } from '../../content/store'
import { AdminDraftsView } from './admin-view'
import { approveDraftAction, rejectDraftAction } from './actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPage() {
  const store = createNeonContentStoreFromUrl()
  const summaryDrafts = await store.listDraftPosts()
  const drafts = (
    await Promise.all(summaryDrafts.map((draft) => store.getDraftPost(draft.slug)))
  ).filter((draft): draft is NonNullable<typeof draft> => Boolean(draft))

  return (
    <AdminDraftsView
      drafts={drafts}
      approveAction={approveDraftAction}
      rejectAction={rejectDraftAction}
    />
  )
}
