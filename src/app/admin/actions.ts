'use server'

import { revalidatePath } from 'next/cache'
import { createNeonContentStoreFromUrl } from '../../content/store'

function getSlugFromFormData(formData: FormData): string {
  const slug = String(formData.get('slug') ?? '').trim()
  if (!slug) {
    throw new Error('A draft slug is required.')
  }
  return slug
}

async function updateDraftStatus(formData: FormData, status: 'review' | 'published' | 'rejected') {
  const store = createNeonContentStoreFromUrl()
  const slug = getSlugFromFormData(formData)
  await store.updateDraftStatus(slug, status)
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function approveDraftAction(formData: FormData) {
  await updateDraftStatus(formData, 'published')
}

export async function rejectDraftAction(formData: FormData) {
  await updateDraftStatus(formData, 'rejected')
}
