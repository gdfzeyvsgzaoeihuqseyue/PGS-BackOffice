import {
  IconUserEdit, IconUserShield, IconUserStar, IconNews, IconUserShare,
  IconDeviceAnalytics, IconFileDescription, IconUserBolt, IconDashboard,
  IconUsers, IconArticle, IconCategory
} from '@tabler/icons-vue'

export const useNavigation = () => {
  const navigationGroups = [
    {
      slug: 'manage',
      label: 'Gestion Utilisateurs',
      to: '/me/manage',
      icon: IconUsers,
      items: [
        { label: 'Administrateurs', to: '/me/manage/admins', icon: 'IconUserShield' },
        { label: 'Utilisateurs', to: '/me/manage/users', icon: 'IconUserStar' },
        { label: 'Apprenants', to: '/me/manage/learners', icon: 'IconUserEdit' }
      ]
    },
    {
      slug: 'activity',
      label: 'Journal',
      to: '/me/activity',
      icon: IconNews,
      items: [
        { label: 'Personnel', to: '/me/activity/me', icon: 'IconUserShare' },
        { label: 'Système', to: '/me/activity/syst', icon: 'IconDeviceAnalytics' }
      ]
    },
    {
      slug: 'blog',
      label: 'Blog',
      to: '/me/blog',
      icon: IconArticle,
      items: [
        { label: 'Articles', to: '/me/blog/articles', icon: 'IconFileDescription' },
        { label: 'Auteurs', to: '/me/blog/authors', icon: 'IconUserBolt' },
        { label: 'Catégories', to: '/me/blog/categories', icon: 'IconCategory' }
      ]
    }
  ]

  const getGroupBySlug = (slug: string) => {
    return navigationGroups.find(g => g.slug === slug)
  }

  const getGroupByPath = (path: string) => {
    // Exact match or starts with if we want to catch sub-sub routes
    return navigationGroups.find(g => path.startsWith(g.to))
  }

  return {
    navigationGroups,
    getGroupBySlug,
    getGroupByPath
  }
}
