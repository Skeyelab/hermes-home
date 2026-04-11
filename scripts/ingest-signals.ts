import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { runDefaultSignalIngestion } from '../src/ingest/default-job'

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
  const report = await runDefaultSignalIngestion()

  console.log(
    JSON.stringify(
      {
        collected: report.collected,
        deduped: report.deduped,
        stored: report.stored,
        topSignals: report.topSignals.map((signal) => ({
          id: signal.id,
          title: signal.title,
          source: signal.source,
          url: signal.url,
          score: signal.score,
        })),
        sourceBreakdown: report.sourceBreakdown,
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
