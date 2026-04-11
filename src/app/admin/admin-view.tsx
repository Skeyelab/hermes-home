import type { DraftPostRecord } from '../../content/store'

export type AdminDraftsViewProps = {
  drafts: DraftPostRecord[]
  approveAction?: (formData: FormData) => void | Promise<void>
  rejectAction?: (formData: FormData) => void | Promise<void>
}

async function noopAction() {
  'use server'
}

export function AdminDraftsView({
  drafts,
  approveAction = noopAction,
  rejectAction = noopAction,
}: AdminDraftsViewProps) {
  return (
    <main className="site-shell admin-shell">
      <section className="hero">
        <p className="eyebrow">Hermes Admin</p>
        <h1>Draft review and publishing state</h1>
        <p className="lede">
          Lightweight operator controls for drafts, reviews, and publishing. No heavy CMS.
        </p>
      </section>

      <section className="articles" aria-label="Drafts">
        {drafts.length === 0 ? (
          <article className="card">
            <p className="meta">No drafts yet</p>
            <h2>Waiting for the next signal batch</h2>
            <p>
              Once Hermes ingests and drafts a topic, it will appear here for review and publishing.
            </p>
          </article>
        ) : (
          drafts.map((draft) => (
            <article className="card" key={draft.slug}>
              <p className="meta">
                {draft.topic} · <span>{draft.status}</span>
              </p>
              <h2>{draft.title}</h2>
              <p>{draft.excerpt}</p>
              <div className="asset-grid" aria-label="Draft assets">
                {draft.assets.map((asset) => (
                  <figure key={`${draft.slug}-${asset.sortOrder}`} className="asset">
                    <img alt={asset.altText} src={asset.assetUrl} loading="lazy" decoding="async" />
                    <figcaption>
                      <span>{asset.kind}</span>
                      <span>{asset.prompt}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
              <div className="sections">
                {draft.sections.map((section) => (
                  <div key={`${draft.slug}-${section.sectionKey}`} className="section">
                    <h3>{section.heading}</h3>
                    <p>{section.body}</p>
                  </div>
                ))}
              </div>
              <div className="admin-actions">
                <form action={approveAction}>
                  <input type="hidden" name="slug" value={draft.slug} />
                  <button type="submit">Approve</button>
                </form>
                <form action={rejectAction}>
                  <input type="hidden" name="slug" value={draft.slug} />
                  <button type="submit">Reject</button>
                </form>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  )
}
