import { defineNuxtRouteMiddleware, navigateTo, useCookie } from '#app'
import { useCncStore, type UserProfile } from '~/composables/useCncStore'

export default defineNuxtRouteMiddleware((to) => {
  const { currentUser } = useCncStore()
  const userCookie = useCookie<UserProfile | null>('cnc_session_user')

  // Resolve active user from reactive ref, cookie, or localStorage fallback
  let activeUser = currentUser.value || userCookie.value

  if (!activeUser && import.meta.client) {
    const saved = localStorage.getItem('cnc_session_user')
    if (saved) {
      try {
        activeUser = JSON.parse(saved)
      } catch {}
    }
  }

  // Keep state and cookie in sync
  if (activeUser && !currentUser.value) {
    currentUser.value = activeUser
  }
  if (activeUser && !userCookie.value) {
    userCookie.value = activeUser
  }

  // If user is already logged in and navigates to /login, redirect to their home page
  if (to.path === '/login') {
    if (activeUser) {
      return navigateTo(activeUser.role === 'user' ? '/orders' : '/dashboard')
    }
    return
  }

  // If not logged in, redirect to login
  if (!activeUser) {
    return navigateTo('/login')
  }

  const role = activeUser.role

  // Role User restrictions (Only 3 pages allowed)
  if (role === 'user') {
    const userAllowedPaths = ['/orders/create', '/orders', '/pickup-verify']
    const isAllowed = userAllowedPaths.some(p => to.path === p || to.path.startsWith(p + '/'))

    if (!isAllowed) {
      return navigateTo('/orders?denied=1')
    }
  }

  // Role Mandor restrictions (Cannot access Admin user management)
  if (role === 'mandor' && to.path.startsWith('/admin')) {
    return navigateTo('/dashboard?denied=1')
  }
})
