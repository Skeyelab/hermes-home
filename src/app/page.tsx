import { getPublishedArticles } from '../content/articles'

export default function Page() {
  const articles = getPublishedArticles()

  return (
    <main className="site-shell">
      <section className="hero">
        <p className="eyebrow">Hermes Signal</p>
        <h1>Research-led AI and automation tips, published from signals instead of vibes.</h1>
        <p className="lede">
          Hermes watches the trend stream, filters for useful patterns, and turns them into
          practical posts you can actually use.
        </p>
      </section>

      <section className="articles" aria-label="Published articles">
        {articles.map((article) => (
          <article className="card" key={article.slug}>
            <p className="meta">{article.topic}</p>
            <h2>{article.title}</h2>
            <p>{article.excerpt}</p>
            <div className="sections">
              {article.sections.map((section) => (
                <div key={section.heading} className="section">
                  <h3>{section.heading}</h3>
                  <p>{section.body}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
