import { describe, expect, it } from 'vitest'
import { createNeonSignalRepository } from './neon'
import type { SignalItem } from '../lib/signals'

describe('createNeonSignalRepository', () => {
  it('upserts signals into the Neon schema with sensible defaults', async () => {
    const calls: Array<{ sql: string; params?: unknown[] }> = []
    const executor = {
      query: async (sql: string, params?: unknown[]) => {
        calls.push({ sql, params })

        if (sql.startsWith('insert into signal_items')) {
          return { rows: [{ id: 'signal-id', inserted: true }] }
        }

        return { rows: [] }
      },
    }

    const repository = createNeonSignalRepository(executor)
    const signal: SignalItem = {
      id: 'reddit-1',
      title: 'Agents need better handoff state',
      source: 'reddit',
      url: 'https://example.com/same',
      publishedAt: '2026-04-11T12:00:00Z',
      mentions: 3,
      relevance: 0.7,
      evidenceStrength: 0.8,
    }

    const result = await repository.upsertSignals([signal])

    expect(result).toEqual({ inserted: 1, updated: 0 })
    expect(calls.map((call) => call.sql)).toEqual([
      'BEGIN',
      expect.stringContaining('insert into signal_items'),
      'COMMIT',
    ])

    const insertCall = calls[1]
    expect(insertCall.params).toEqual([
      'reddit',
      'reddit-1',
      'Agents need better handoff state',
      'https://example.com/same',
      null,
      new Date('2026-04-11T12:00:00Z'),
      'Agents need better handoff state',
      'Keep the workflow observable and explicit.',
      'general',
      expect.any(Number),
    ])
  })
})
