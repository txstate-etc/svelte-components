import { Store } from '@txstate-mws/svelte-store'
import { randomid } from 'txstate-utils'

export interface Toast {
  message: string
  /** default is error */
  type?: 'error' | 'warning' | 'info' | 'success'
  /**
   * how long the message should appear on screen in milliseconds
   * default 15 seconds
   * use Number.MAX_SAFE_INTEGER for permanent
   */
  ttlMs?: number
}
export interface ToastStorage extends Required<Toast> {
  /** each toast gets a random id so it can be dismissed by user interaction */
  id: string
  /** when the toast was created, so we know when it expires */
  stamp: Date
}

export class ToastStore extends Store<ToastStorage[]> {
  add (msg: string, type?: Toast['type'], ttlMs?: number) {
    const stored = {
      id: randomid(),
      stamp: new Date(),
      message: msg,
      type: type ?? 'error',
      ttlMs: ttlMs ?? 15000
    }
    this.update(v => [...v.filter(t => t.message !== stored.message), stored])
    setTimeout(() => { this.clean() }, stored.ttlMs)
  }

  close (id: string) {
    this.update(v => v.filter(t => t.id !== id))
  }

  clean () {
    const now = new Date().getTime()
    this.update(v => v.filter(t => now - t.stamp.getTime() < t.ttlMs))
  }
}

export const toasts = new ToastStore([])
