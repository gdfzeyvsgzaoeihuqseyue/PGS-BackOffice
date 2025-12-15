export interface BlogAuthor {
  id: string
  slug: string
  name: string
  avatar: string
  role: string
  bio?: string
  social?: any
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
}

export interface BlogArticle {
  id: string
  slug: string
  title: string
  excerpt?: string
  content: string
  imageUrl?: string
  tags?: string[]
  author: BlogAuthor | string
  category: BlogCategory | string
  views: number
  createdAt: number | string
  updatedAt: number | string
}
