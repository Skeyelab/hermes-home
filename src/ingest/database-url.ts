export type DatabaseUrlEnv = Partial<Pick<NodeJS.ProcessEnv, 'DATABASE_URL' | 'POOLED_DATABASE_URL'>>

export function resolveDirectDatabaseUrl(env: DatabaseUrlEnv = process.env as DatabaseUrlEnv): string {
  const directUrl = env.DATABASE_URL?.trim()
  if (directUrl) {
    return directUrl
  }

  const pooledUrl = env.POOLED_DATABASE_URL?.trim()
  if (pooledUrl) {
    throw new Error('DATABASE_URL is required for ingestion; use the direct Neon connection string, not POOLED_DATABASE_URL.')
  }

  throw new Error('DATABASE_URL is required for ingestion.')
}
