import { createNeonContentStoreFromUrl } from '../../content/store'
import { AdminDraftsView } from './admin-view'
import { approveDraftAction, rejectDraftAction } from './actions'

export default async function AdminPage() {
  const store = createNeonContentStoreFromUrl()
  const drafts = await store.listDraftPosts()

  return (
    <AdminDraftsView
      drafts={drafts}
      approveAction={approveDraftAction}
      rejectAction={rejectDraftAction}
    />
  )
}
