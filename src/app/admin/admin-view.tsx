import type { DraftPostRecord } from '../../content/store'

export type AdminDraftsViewProps = {
  drafts: DraftPostRecord[]
  operatorNotice?: {
    title: string
    body: string
  }
  approveAction?: (formData: FormData) => void | Promise<void>
  rejectAction?: (formData: FormData) => void | Promise<void>
}

async function noopAction() {
  'use server'
}

export function AdminDraftsView({
  drafts,
  operatorNotice,
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

      <section className="terminal-section" aria-label="Drafts">
        <div className="section-heading-row section-heading-row--compact">
          <div>
            <p className="eyebrow">Drafts</p>
            <h2>Pending review</h2>
          </div>
        </div>
        <div className="terminal-stream">
          {operatorNotice ? (
            <div className="terminal-entry terminal-entry--empty" role="status" aria-live="polite">
              <div className="terminal-entry__header">
                <span>Storage</span>
                <span>Attention</span>
              </div>
              <div className="terminal-entry__body">
                <h3>{operatorNotice.title}</h3>
                <p>{operatorNotice.body}</p>
              </div>
            </div>
          ) : null}
          {drafts.length === 0 ? (
            <div className="terminal-entry terminal-entry--empty">
              <div className="terminal-entry__header">
                <span>No drafts yet</span>
                <span>Idle</span>
              </div>
              <div className="terminal-entry__body">
                <h3>Waiting for the next signal batch</h3>
                <p>
                  Once Hermes ingests and drafts a topic, it will appear here for review and
                  publishing.
                </p>
              </div>
            </div>
          ) : (
            drafts.map((draft) => (
              <article className="terminal-entry" key={draft.slug}>
                <div className="terminal-entry__header">
                  <span>{draft.topic}</span>
                  <span>{draft.status}</span>
                </div>
                <div className="terminal-entry__body">
                  <h3>{draft.title}</h3>
                  <p>{draft.excerpt}</p>
                </div>
                <div className="asset-grid" aria-label="Draft assets">
                  {draft.assets.map((asset) => (
                    <figure key={`${draft.slug}-${asset.sortOrder}`} className="asset">
                      <img
                        alt={asset.altText}
                        src={asset.assetUrl}
                        loading="lazy"
                        decoding="async"
                      />
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
                <div className="terminal-entry__actions">
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
        </div>
      </section>
    </main>
  )
}
