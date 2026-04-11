import { describe, expect, it } from 'vitest'
import { resolveDirectDatabaseUrl } from './database-url'

describe('resolveDirectDatabaseUrl', () => {
  it('prefers DATABASE_URL over POOLED_DATABASE_URL', () => {
    expect(
      resolveDirectDatabaseUrl({
        DATABASE_URL: 'postgres://direct',
        POOLED_DATABASE_URL: 'postgres://pooled',
      }),
    ).toBe('postgres://direct')
  })

  it('throws when only the pooled url is available', () => {
    expect(() =>
      resolveDirectDatabaseUrl({
        POOLED_DATABASE_URL: 'postgres://pooled',
      }),
    ).toThrowError(/DATABASE_URL/i)
  })
})
