import { defineNuxtRouteMiddleware, navigateTo, useCookie } from '#app'
import { useCncStore, type UserProfile } from '~/composables/useCncStore'
import { useSecurity } from '~/composables/useSecurity'

export default defineNuxtRouteMiddleware(async (to) => {
  const { currentUser } = useCncStore()
  const { verifySessionToken } = useSecurity()
  const sessionToken = useCookie<string | null>('cnc_session_token')

  // Cryptographically verify session token (HMAC-SHA256 signature check on EVERY route change)
  let activeUser: UserProfile | null = null

  if (sessionToken.value) {
    activeUser = await verifySessionToken(sessionToken.value)
    if (activeUser) {
      currentUser.value = activeUser
    } else {
      // Invalid, expired, or tampered token! Wipe token immediately
      sessionToken.value = null
      currentUser.value = null
    }
  } else {
    currentUser.value = null
  }

  // If user is already authenticated and visits /login -> redirect to appropriate role home
  if (to.path === '/login') {
    if (activeUser) {
      return navigateTo(activeUser.role === 'user' ? '/orders' : '/dashboard')
    }
    return
  }

  // If not authenticated -> redirect to login
  if (!activeUser) {
    return navigateTo('/login')
  }

  const role = activeUser.role

  // STRICT RBAC (Role-Based Access Control)
  // 1. Role USER: Strictly limited to orders and pickup verification
  if (role === 'user') {
    const userAllowed = ['/orders', '/orders/create', '/pickup-verify']
    const isAllowed = userAllowed.some(p => to.path === p || to.path.startsWith(p + '/'))
    if (!isAllowed) {
      return navigateTo('/orders?denied=1')
    }
    return
  }

  // 2. Role OPERATOR / MANDOR: Operational access, strictly forbidden from Admin user management
  if (role === 'operator' || role === 'mandor') {
    if (to.path.startsWith('/admin')) {
      return navigateTo('/dashboard?denied=1')
    }
    return
  }

  // 3. Role ADMIN: Allowed full access
  if (role === 'admin') {
    return
  }

  // Unknown role: Forbid access and kick to login
  return navigateTo('/login')
})
