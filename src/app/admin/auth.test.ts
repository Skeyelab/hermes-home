import { afterEach, describe, expect, it } from 'vitest'
import { getAdminAuthCredentials, isAdminAuthorized, parseBasicAuthHeader } from './auth'

afterEach(() => {
  delete process.env.ADMIN_BASIC_AUTH_USER
  delete process.env.ADMIN_BASIC_AUTH_PASSWORD
})

describe('admin auth', () => {
  it('parses basic auth headers', () => {
    expect(parseBasicAuthHeader(`Basic ${btoa('alice:secret')}`)).toEqual({
      username: 'alice',
      password: 'secret',
    })
  })

  it('authorizes with the configured credentials', () => {
    process.env.ADMIN_BASIC_AUTH_USER = 'alice'
    process.env.ADMIN_BASIC_AUTH_PASSWORD = 'secret'

    expect(getAdminAuthCredentials()).toEqual({ username: 'alice', password: 'secret' })
    expect(isAdminAuthorized(`Basic ${btoa('alice:secret')}`)).toBe(true)
    expect(isAdminAuthorized(`Basic ${btoa('alice:wrong')}`)).toBe(false)
  })

  it('allows access when no password is configured', () => {
    expect(isAdminAuthorized(null)).toBe(true)
  })
})
