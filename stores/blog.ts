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
      // Placeholder endpoint - verify if there is a list endpoint
      const { data } = await useAPI<BlogArticle[]>('/blog/articles-list') // Verify URL
      if (data.value) this.articles = data.value
    },
    async addArticle(article: Partial<BlogArticle>) {
      await useAPI('/admin/blog/add-article', { method: 'POST', body: article })
    },
    async updateArticle(id: string, article: Partial<BlogArticle>) {
      await useAPI(`/admin/blog/update-article/${id}`, { method: 'PUT', body: article })
    },
    async deleteArticle(id: string) {
      await useAPI(`/admin/blog/delete-article/${id}`, { method: 'DELETE' })
    },

    // --- Authors ---
    async fetchAuthors() {
      // Placeholder endpoint
      const { data } = await useAPI<BlogAuthor[]>('/blog/authors') // Verify URL
      if (data.value) this.authors = data.value
    },
    async addAuthor(author: Partial<BlogAuthor>) {
      await useAPI('/admin/blog/add-author', { method: 'POST', body: author })
    },
    async updateAuthor(id: string, author: Partial<BlogAuthor>) {
      await useAPI(`/admin/blog/update-author/${id}`, { method: 'PUT', body: author })
    },
    async deleteAuthor(id: string) {
      await useAPI(`/blog/delete-author/${id}`, { method: 'DELETE' })
    },

    // --- Categories ---
    async fetchCategories() {
      const { data } = await useAPI<BlogCategory[]>('/blog/categories') // Verify URL
      if (data.value) this.categories = data.value
    },
    async addCategory(item: Partial<BlogCategory>) {
      await useAPI('/admin/blog/add-category', { method: 'POST', body: item })
    },
    async updateCategory(id: string, item: Partial<BlogCategory>) {
      await useAPI(`/admin/blog/update-category/${id}`, { method: 'PUT', body: item })
    },
    async deleteCategory(id: string) {
      await useAPI(`/admin/blog/delete-category/${id}`, { method: 'DELETE' })
    }
  }
})
