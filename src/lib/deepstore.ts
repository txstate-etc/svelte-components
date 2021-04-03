import { Writable } from 'svelte/store'
import deepEqual from 'fast-deep-equal'

export interface UsableSubject<T> {
  subscribe: (observer: (value: T) => void) => () => void
}

export interface WritableSubject<T> extends UsableSubject<T> {
  update: (updater: (value: T) => T) => void
}

function isWritable <T> (value: T|Writable<T>): value is Writable<T> {
  return !!(value as Writable<T>).subscribe
}

export class DeepStore<T> implements Writable<T> {
  protected value!: T
  protected subscribers: Map<string, (s: T) => void>
  protected cleanups: (() => void)[] = []

  constructor (value: T|Writable<T>) {
    if (isWritable(value)) {
      this.cleanup(value.subscribe(v => this.set(v)))
    } else {
      this.value = this.clone(value)
    }
    this.subscribers = new Map()
  }

  clone (value: T) {
    return value
  }

  set (value: T) {
    if (!deepEqual(value, this.value)) {
      this.value = this.clone(value)
      for (const [id, run] of this.subscribers) {
        run(value)
      }
    }
  }

  update (updater: (value: T) => T) {
    this.set(this.clone(updater(this.value)))
  }

  subscribe (run: (s: T) => any) {
    const id = Math.random().toString(32)
    this.subscribers.set(id, run)
    run(this.value)
    return () => { this.subscribers.delete(id) }
  }

  protected cleanup (fn: () => void) {
    this.cleanups.push(fn)
  }

  complete () {
    for (const fn of this.cleanups) fn()
    this.cleanups = []
    this.subscribers.clear()
  }
}
