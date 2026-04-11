const DEFAULT_ADMIN_USER = 'hermes'

export function getAdminAuthCredentials() {
  return {
    username: process.env.ADMIN_BASIC_AUTH_USER ?? DEFAULT_ADMIN_USER,
    password: process.env.ADMIN_BASIC_AUTH_PASSWORD ?? '',
  }
}

export function parseBasicAuthHeader(authorizationHeader: string | null) {
  if (!authorizationHeader?.startsWith('Basic ')) {
    return null
  }

  try {
    const decoded = atob(authorizationHeader.slice(6))
    const separatorIndex = decoded.indexOf(':')
    if (separatorIndex === -1) {
      return null
    }

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    }
  } catch {
    return null
  }
}

export function isAdminAuthorized(authorizationHeader: string | null) {
  const { username, password } = getAdminAuthCredentials()
  if (!password) {
    return true
  }

  const parsed = parseBasicAuthHeader(authorizationHeader)
  return Boolean(parsed && parsed.username === username && parsed.password === password)
}

export function getAdminAuthChallenge() {
  return 'Basic realm="Hermes Admin", charset="UTF-8"'
}
