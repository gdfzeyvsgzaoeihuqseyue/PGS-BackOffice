import { defineStore } from 'pinia'
import type { BlogArticle, BlogAuthor, BlogCategory } from '~/types'

export const useBlogStore = defineStore('blog', {
  state: () => ({
    articles: [] as BlogArticle[],
    authors: [] as BlogAuthor[],
    categories: [] as BlogCategory[],
    currentArticle: null as BlogArticle | null,
    currentAuthor: null as BlogAuthor | null,
    currentCategory: null as BlogCategory | null,
    loading: false,
    error: null as string | null
  }),
  actions: {
    // --- Articles ---
    async fetchArticles() {
      this.loading = true
      this.error = null
      try {
        const { data } = await useAPI<any>('/public/blog/get-article')
        if (data.value && data.value.data) {
          this.articles = data.value.data
        } else if (Array.isArray(data.value)) {
          this.articles = data.value
        }
      } catch (e: any) {
        this.error = e.message || 'Erreur lors du chargement des articles'
      } finally {
        this.loading = false
      }
    },
    async fetchArticle(identifier: string, excludeView: boolean = false) {
      this.loading = true
      this.error = null
      this.currentArticle = null
      try {
        const { data, error } = await useAPI<any>(`/public/blog/get-article/${identifier}`, {
          query: { excludeView }
        })
        if (error.value) throw error.value

        if (data.value) {
          const result = data.value.data || data.value
          this.currentArticle = result
          return result
        }
      } catch (e: any) {
        this.error = e.message || 'Erreur lors du chargement de l\'article'
        throw e
      } finally {
        this.loading = false
      }
    },
    async addArticle(article: Partial<BlogArticle>) {
      await useAPI('/admin/blog/add-article', { method: 'POST', body: article })
      await this.fetchArticles()
    },
    async updateArticle(id: string, article: Partial<BlogArticle>) {
      await useAPI(`/admin/blog/update-article/${id}`, { method: 'PUT', body: article })
      // If we are updating the current article, refresh it too
      if (this.currentArticle && this.currentArticle.id === id) {
        // We can merge or refetch. Refetching is safer.
        // But we need the slug or id.
        await this.fetchArticle(id, true)
      }
      await this.fetchArticles()
    },
    async deleteArticle(id: string) {
      await useAPI(`/admin/blog/delete-article/${id}`, { method: 'DELETE' })
      await this.fetchArticles()
      this.currentArticle = null
    },

    // --- Authors ---
    async fetchAuthors() {
      this.loading = true
      this.error = null
      try {
        const { data } = await useAPI<any>('/public/blog/get-author')
        if (data.value && data.value.data) {
          this.authors = data.value.data
        } else if (Array.isArray(data.value)) {
          this.authors = data.value
        }
      } catch (e: any) {
        this.error = e.message || 'Erreur lors du chargement des auteurs'
      } finally {
        this.loading = false
      }
    },
    async fetchAuthor(identifier: string) {
      this.loading = true
      this.error = null
      this.currentAuthor = null
      try {
        const { data, error } = await useAPI<any>(`/public/blog/author/${identifier}`)
        if (error.value) throw error.value

        if (data.value) {
          const result = data.value.data || data.value
          this.currentAuthor = result
          return result
        }
      } catch (e: any) {
        this.error = e.message || 'Erreur lors du chargement de l\'auteur'
        throw e
      } finally {
        this.loading = false
      }
    },
    async addAuthor(author: Partial<BlogAuthor>) {
      await useAPI('/admin/blog/add-author', { method: 'POST', body: author })
      await this.fetchAuthors()
    },
    async updateAuthor(id: string, author: Partial<BlogAuthor>) {
      await useAPI(`/admin/blog/update-author/${id}`, { method: 'PUT', body: author })
      if (this.currentAuthor && this.currentAuthor.id === id) {
        await this.fetchAuthor(id)
      }
      await this.fetchAuthors()
    },
    async deleteAuthor(id: string) {
      await useAPI(`/admin/blog/delete-author/${id}`, { method: 'DELETE' })
      await this.fetchAuthors()
      this.currentAuthor = null
    },

    // --- Categories ---
    async fetchCategories() {
      this.loading = true
      this.error = null
      try {
        const { data } = await useAPI<any>('/public/blog/get-category')
        if (data.value && data.value.data) {
          this.categories = data.value.data
        } else if (Array.isArray(data.value)) {
          this.categories = data.value
        }
      } catch (e: any) {
        this.error = e.message || 'Erreur lors du chargement des catégories'
      } finally {
        this.loading = false
      }
    },
    async fetchCategory(identifier: string) {
      this.loading = true
      this.error = null
      this.currentCategory = null
      try {
        const { data, error } = await useAPI<any>(`/public/blog/get-category/${identifier}`)
        if (error.value) throw error.value

        if (data.value) {
          const result = data.value.data || data.value
          this.currentCategory = result
          return result
        }
      } catch (e: any) {
        this.error = e.message || 'Erreur lors du chargement de la catégorie'
        throw e
      } finally {
        this.loading = false
      }
    },
    async addCategory(item: Partial<BlogCategory>) {
      await useAPI('/admin/blog/add-category', { method: 'POST', body: item })
      await this.fetchCategories()
    },
    async updateCategory(id: string, item: Partial<BlogCategory>) {
      await useAPI(`/admin/blog/update-category/${id}`, { method: 'PUT', body: item })
      if (this.currentCategory && this.currentCategory.id === id) {
        await this.fetchCategory(id)
      }
      await this.fetchCategories()
    },
    async deleteCategory(id: string) {
      await useAPI(`/admin/blog/delete-category/${id}`, { method: 'DELETE' })
      await this.fetchCategories()
      this.currentCategory = null
    }
  }
})
