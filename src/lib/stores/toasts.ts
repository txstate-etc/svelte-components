import { Store } from '@txstate-mws/svelte-store'
import { randomid } from 'txstate-utils'

export interface Toast {
  title?: string
  message: string
  /** default is error */
  type?: 'error' | 'warning' | 'info' | 'success'
  /**
   * how long the message should appear on screen in milliseconds
   * default 8 seconds for errors and warnings, 5 seconds for success and info
   * use Number.MAX_SAFE_INTEGER for permanent
   */
  ttlMs?: number
}
export interface ToastStorage {
  title?: string
  message: string
  type: 'error' | 'warning' | 'info' | 'success'
  ttlMs: number
  /** each toast gets a random id so it can be dismissed by user interaction */
  id: string
  /** when the toast was created, so we know when it expires */
  stamp: Date
  /** True if auto-expiration has been suspended (e.g. user is hovering mouse over the toast) */
  suspended: boolean
}

export class ToastStore extends Store<ToastStorage[]> {
  add (toast: Toast)
  add (msg: string, type?: Toast['type'], ttlMs?: number)
  add (msgOrToast: string | Toast, type?: Toast['type'], ttlMs?: number) {
    const toast = typeof msgOrToast === 'string'
      ? {
          message: msgOrToast,
          type,
          ttlMs
        }
      : msgOrToast

    const resolvedType = toast.type ?? 'error'
    const id = randomid()
    const stored = {
      id,
      stamp: new Date(),
      title: toast.title,
      message: toast.message,
      type: resolvedType,
      suspended: false,
      ttlMs: toast.ttlMs ?? (['error', 'warning'].includes(resolvedType) ? 8000 : 5000)
    }
    this.update(v => [...v.filter(t => t.message !== stored.message || t.title !== stored.title), stored])
    setTimeout(() => { this.clean() }, stored.ttlMs)
  }

  close (id: string) {
    this.update(v => v.filter(t => t.id !== id))
  }

  suspend (id: string) {
    this.update(v => v.map(t => t.id !== id ? t : { ...t, suspended: true }))
  }

  resume (id: string) {
    this.update(v => v.map(t => t.id !== id ? t : { ...t, suspended: false }))
    setTimeout(() => { this.clean() }, 100)
  }

  clean () {
    const now = new Date().getTime()
    this.update(v => v.some(t => t.suspended) ? v : v.filter(t => now - t.stamp.getTime() <= t.ttlMs))
  }
}

export const toasts = new ToastStore([])
