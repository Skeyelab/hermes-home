import { createNeonContentStoreFromUrl } from '../../content/store'
import { AdminDraftsView } from './admin-view'
import { approveDraftAction, rejectDraftAction } from './actions'

function isMissingDraftSchemaError(error: unknown): error is { code?: string; message?: string } {
  if (!error || typeof error !== 'object') return false

  const maybeError = error as { code?: string; message?: string }
  if (maybeError.code !== '42P01') return false

  return /draft_posts|draft_sections|draft_assets/.test(maybeError.message ?? '')
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPage() {
  const store = createNeonContentStoreFromUrl()
  let drafts = [] as Awaited<ReturnType<typeof store.getDraftPost>>[]
  let operatorNotice:
    | {
        title: string
        body: string
      }
    | undefined

  try {
    const summaryDrafts = await store.listDraftPosts()
    drafts = await Promise.all(summaryDrafts.map((draft) => store.getDraftPost(draft.slug)))
  } catch (error) {
    if (!isMissingDraftSchemaError(error)) {
      throw error
    }

    operatorNotice = {
      title: 'Draft storage is not initialized yet',
      body: 'Run the Neon schema setup for Hermes Home to enable admin review.',
    }
  }

  return (
    <AdminDraftsView
      drafts={drafts.filter((draft): draft is NonNullable<typeof draft> => Boolean(draft))}
      operatorNotice={operatorNotice}
      approveAction={approveDraftAction}
      rejectAction={rejectDraftAction}
    />
  )
}
