import { describe, expect, it } from 'vitest'
import { buildDefaultSignalSources } from './default-job'

describe('buildDefaultSignalSources', () => {
  it('assembles the scheduled ingestion sources', () => {
    const sources = buildDefaultSignalSources()

    expect(sources.map((source) => source.name)).toEqual([
      'reddit-automation',
      'reddit-selfhosted',
      'hnrss',
    ])
    expect(sources.every((source) => typeof source.collectSignals === 'function')).toBe(true)
  })
})
