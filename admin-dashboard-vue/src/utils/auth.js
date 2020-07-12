import Cookies from 'js-cookie'

const ACCESS_TOKEN_KEY = 'admin-access-token'
const REFRESH_TOKEN_KEY = 'admin-refresh-token'

export function getAccessToken() {
  return Cookies.get(ACCESS_TOKEN_KEY)
}

export function setAccessToken(accessToken) {
  Cookies.set(ACCESS_TOKEN_KEY, accessToken)
}

export function getRefreshToken() {
  return Cookies.get(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(refreshToken) {
  return Cookies.set(REFRESH_TOKEN_KEY, refreshToken)
}

export function removeToken() {
  Cookies.remove(ACCESS_TOKEN_KEY)
  Cookies.remove(REFRESH_TOKEN_KEY)
}
