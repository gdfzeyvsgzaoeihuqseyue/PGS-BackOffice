import { defineStore } from 'pinia'
import type { BlogArticle, BlogAuthor, BlogCategory } from '~/types/blog'

export const useBlogStore = defineStore('blog', {
  state: () => ({
    articles: [] as BlogArticle[],
    authors: [] as BlogAuthor[],
    categories: [] as BlogCategory[],
    loading: false
  }),
  actions: {
    // Note: Assuming there are GET endpoints for these based on conventions. 
    // If not, we might need to adjust endpoint paths.

    // --- Articles ---
    async fetchArticles() {
      const { data } = await useAPI<any>('/public/blog/get-article')
      if (data.value && data.value.data) {
        this.articles = data.value.data
      } else if (Array.isArray(data.value)) {
        this.articles = data.value
      }
    },
    async addArticle(article: Partial<BlogArticle>) {
      await useAPI('/admin/blog/add-article', { method: 'POST', body: article })
      await this.fetchArticles()
    },
    async updateArticle(id: string, article: Partial<BlogArticle>) {
      await useAPI(`/admin/blog/update-article/${id}`, { method: 'PUT', body: article })
      await this.fetchArticles()
    },
    async deleteArticle(id: string) {
      await useAPI(`/admin/blog/delete-article/${id}`, { method: 'DELETE' })
      await this.fetchArticles()
    },

    // --- Authors ---
    async fetchAuthors() {
      const { data } = await useAPI<any>('/public/blog/get-author')
      if (data.value && data.value.data) {
        this.authors = data.value.data
      } else if (Array.isArray(data.value)) {
        this.authors = data.value
      }
    },
    async addAuthor(author: Partial<BlogAuthor>) {
      await useAPI('/admin/blog/add-author', { method: 'POST', body: author })
      await this.fetchAuthors()
    },
    async updateAuthor(id: string, author: Partial<BlogAuthor>) {
      await useAPI(`/admin/blog/update-author/${id}`, { method: 'PUT', body: author })
      await this.fetchAuthors()
    },
    async deleteAuthor(id: string) {
      await useAPI(`/blog/delete-author/${id}`, { method: 'DELETE' })
      await this.fetchAuthors()
    },

    // --- Categories ---
    async fetchCategories() {
      const { data } = await useAPI<any>('/public/blog/get-category')
      if (data.value && data.value.data) {
        this.categories = data.value.data
      } else if (Array.isArray(data.value)) {
        this.categories = data.value
      }
    },
    async addCategory(item: Partial<BlogCategory>) {
      await useAPI('/admin/blog/add-category', { method: 'POST', body: item })
      await this.fetchCategories()
    },
    async updateCategory(id: string, item: Partial<BlogCategory>) {
      await useAPI(`/admin/blog/update-category/${id}`, { method: 'PUT', body: item })
      await this.fetchCategories()
    },
    async deleteCategory(id: string) {
      await useAPI(`/admin/blog/delete-category/${id}`, { method: 'DELETE' })
      await this.fetchCategories()
    }
  }
})
