import { Store } from '@txstate-mws/svelte-store'
import { randomid } from 'txstate-utils'

export interface Toast {
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
export interface ToastStorage extends Required<Toast> {
  /** each toast gets a random id so it can be dismissed by user interaction */
  id: string
  /** when the toast was created, so we know when it expires */
  stamp: Date
  /** True if auto-expiration has been suspended (e.g. user is hovering mouse over the toast) */
  suspended: boolean
}

export class ToastStore extends Store<ToastStorage[]> {
  timers: Record<string, number> = {}

  add (msg: string, type?: Toast['type'], ttlMs?: number) {
    const resolvedType = type ?? 'error'
    const id = randomid()
    const stored = {
      id,
      stamp: new Date(),
      message: msg,
      type: resolvedType,
      suspended: false,
      ttlMs: ttlMs ?? (['error', 'warning'].includes(resolvedType) ? 8000 : 5000)
    }
    this.update(v => [...v.filter(t => t.message !== stored.message), stored])
    this.timers[id] = setTimeout(() => { this.clean() }, stored.ttlMs)
  }

  close (id: string) {
    this.update(v => v.filter(t => t.id !== id))
  }

  suspend (id: string) {
    this.update(v => v.map(t => t.id !== id ? t : { ...t, suspended: true }))
  }

  resume (id: string) {
    this.update(v => v.map(t => t.id !== id ? t : { ...t, suspended: false }))
    this.clean()
  }

  clean () {
    const now = new Date().getTime()
    this.update(v => v.filter(t => t.suspended || (now - t.stamp.getTime() < t.ttlMs)))
  }
}

export const toasts = new ToastStore([])
