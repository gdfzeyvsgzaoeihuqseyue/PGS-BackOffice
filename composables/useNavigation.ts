import {
  IconUserEdit, IconUserShield, IconUserStar, IconNews, IconUserShare,
  IconDeviceAnalytics, IconFileDescription, IconUserBolt, IconDashboard,
  IconUsers, IconArticle, IconCategory, IconDeviceDesktop, IconBook,
  IconHeartHandshake, IconQuote, IconVideo, IconWorld, IconBookmarkQuestion
} from '@tabler/icons-vue'

export const useNavigation = () => {
  // ... (previous groups)
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
    },
    {
      slug: 'solutions',
      label: 'Solutions',
      to: '/me/solutions',
      icon: IconDeviceAnalytics,
      items: [
        { label: 'Plateformes', to: '/me/solutions/platform', icon: 'IconDeviceDesktop' },
        { label: 'Documents', to: '/me/solutions/doc', icon: 'IconBook' },
        { label: 'Tutoriels', to: '/me/solutions/tuto', icon: 'IconVideo' },
        { label: 'Wiki', to: '/me/solutions/wiki', icon: 'IconWorld' },
        { label: 'Sujets FAQ', to: '/me/solutions/topic', icon: 'IconBookmarkQuestion' },
        { label: 'Questions FAQ', to: '/me/solutions/faq', icon: 'IconHelp' },
        { label: 'Partenaires', to: '/me/solutions/partner', icon: 'IconHeartHandshake' },
        { label: 'Témoignages', to: '/me/solutions/testi', icon: 'IconQuote' }
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
