import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useCncStore } from '~/composables/useCncStore'

export default defineNuxtRouteMiddleware((to) => {
  // Always allow login page
  if (to.path === '/login') {
    return
  }

  const { currentUser } = useCncStore()

  // If not logged in, redirect to login
  if (!currentUser.value) {
    return navigateTo('/login')
  }

  const role = currentUser.value.role

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

