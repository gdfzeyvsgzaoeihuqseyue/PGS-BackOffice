export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

export const useToast = () => {
  const toasts = useState<Toast[]>('toasts', () => [])

  const add = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now()
    toasts.value.push({ id, message, type })
    setTimeout(() => remove(id), 3000)
  }

  const remove = (id: number) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, add, remove }
}
