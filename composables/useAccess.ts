import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

/**
 * Access Management Helper
 * Gère les permissions et l'accès aux ressources selon le rôle de l'admin.
 */
export const useAccess = () => {
  const auth = useAuthStore()
  const { add: showToast } = useToast()

  /**
   * Vérifie si l'utilisateur courant a l'un des rôles demandés.
   * Prend en compte la permission 'canManageAll'.
   */
  const hasAccess = (allowedRoles: string | string[]): boolean => {
    // Si pas d'utilisateur, pas d'accès
    if (!auth.user || !auth.user.role) return false

    // Super Admin / canManageAll override
    if (auth.user.permissions?.canManageAll) return true
    // Si rôle 'main'
    if (auth.user.role === 'main') return true

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
    return roles.includes(auth.user.role)
  }

  /**
   * Vérifie l'accès et redirige/lance une erreur si refusé.
   * À utiliser dans les pages ou setup protégés.
   */
  const verifyAccess = (allowedRoles: string | string[]) => {
    if (!hasAccess(allowedRoles)) {
      showError({
        statusCode: 403,
        statusMessage: 'Accès interdit',
        message: "Vous n'avez pas les droits nécessaires pour accéder à cette page.",
        fatal: true
      })
    }
  }

  /**
   * Fallback pour les actions : 
   * Si l'utilisateur a accès, exécute l'action.
   * Sinon, affiche un Toast d'erreur (Access denied).
   * Utile pour les boutons qui restent affichés mais bloqués.
   */
  const tryAction = async (allowedRoles: string | string[], action: () => void | Promise<void>) => {
    if (hasAccess(allowedRoles)) {
      await action()
    } else {
      showToast("Vous n'avez pas les droits nécessaires pour effectuer cette action.", 'error')
    }
  }

  return {
    hasAccess,
    verifyAccess,
    tryAction
  }
}
