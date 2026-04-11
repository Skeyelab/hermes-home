import { config } from 'dotenv'

import { runDefaultSignalIngestion } from '../src/ingest/default-job'

config()

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
