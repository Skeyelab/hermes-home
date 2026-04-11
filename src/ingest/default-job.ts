import { createNeonSignalRepositoryFromUrl } from './neon'
import { runSignalIngestion, type IngestionReport, type SignalSource } from './pipeline'
import { collectRedditSignals, collectRssSignals } from './sources'

export function buildDefaultSignalSources(): SignalSource[] {
  return [
    {
      name: 'reddit-automation',
      collectSignals: () => collectRedditSignals('automation'),
    },
    {
      name: 'reddit-selfhosted',
      collectSignals: () => collectRedditSignals('selfhosted'),
    },
    {
      name: 'hnrss',
      collectSignals: () => collectRssSignals('https://hnrss.org/newest?points=100', 'hnrss'),
    },
  ]
}

export async function runDefaultSignalIngestion(): Promise<IngestionReport> {
  const repository = createNeonSignalRepositoryFromUrl()
  return runSignalIngestion({
    sources: buildDefaultSignalSources(),
    repository,
    limit: 10,
  })
}
