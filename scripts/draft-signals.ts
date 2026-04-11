import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { runDraftGeneration } from '../src/content/drafting'
import { createNeonDraftRepositoryFromUrl, createNeonDraftSourceFromUrl } from '../src/content/neon-drafting'

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return
  }

  const contents = readFileSync(filePath, 'utf8')
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const equalsIndex = trimmed.indexOf('=')
    if (equalsIndex === -1) continue

    const key = trimmed.slice(0, equalsIndex).trim()
    let value = trimmed.slice(equalsIndex + 1).trim()

    if (!key || process.env[key]) continue

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    process.env[key] = value
  }
}

loadEnvFile(resolve(process.cwd(), '.env'))

async function main() {
  const report = await runDraftGeneration({
    source: createNeonDraftSourceFromUrl(),
    repository: createNeonDraftRepositoryFromUrl(),
  })

  console.log(
    JSON.stringify(
      {
        generated: report.generated,
        stored: report.stored,
        drafts: report.topDrafts.map((draft) => ({
          signalItemId: draft.signalItemId,
          title: draft.title,
          slug: draft.slug,
          topic: draft.topic,
          generatedAt: draft.generatedAt,
        })),
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
