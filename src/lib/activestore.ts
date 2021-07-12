import { Writable } from 'svelte/store'

export interface UsableSubject<T> {
  subscribe: (observer: (value: T) => void) => () => void
}

export interface WritableSubject<T> extends UsableSubject<T> {
  update: (updater: (value: T) => T) => void
}

export interface SettableSubject<T> extends WritableSubject<T> {
  set: (value: T) => void
}

export function isUsable <T> (value: T|UsableSubject<T>|undefined): value is UsableSubject<T> {
  return !!value && typeof (value as any).subscribe === 'function'
}

export function isWritable <T> (value: T|UsableSubject<T>|undefined): value is WritableSubject<T> {
  return isUsable(value) && typeof (value as any).update === 'function'
}

export function isSettable <T> (value: T|UsableSubject<T>|undefined): value is SettableSubject<T> {
  return isWritable(value) && typeof (value as any).set === 'function'
}

/**
 * An alternative to svelte's "writable" that does not check equality before notifying
 * subscribers. A writable will notify subscribers after a shallow equality check, which
 * does not work with mutated states:
 * store.update(v => { v.someprop = 'newvalue'; return v })
 *
 * With a writable, this line would NOT notify subscribers because the state will be compared
 * against itself and always found to be equal.
 *
 * An alternative to this store type is SafeStore, which will do a deep equality check but
 * clone data so that it is safe against mutations. It costs more CPU cycles but results in
 * fewer notifications to subscribers which could be an overall win.
 */
export class ActiveStore<T> implements Writable<T> {
  protected value!: T
  protected subscribers: Map<string, (s: T) => void>
  private cleanups: (() => void)[] = []
  private sourceInits: (() => () => void)[] = []

  constructor (value: T) {
    this.subscribers = new Map()
    this.value = this.clone(value)
  }

  // this is here to support SafeStore: the regular store makes this a null-op, but
  // SafeStore overrides the implementation to a deep clone operation
  clone (value: T) {
    return value
  }

  // always returns false so that subscribers are notified on every `set` or `update`.
  // Subclasses can override this for shallow or deep equality checks.
  equal (a: T, b: T) {
    return false
  }

  set (value: T) {
    if (!this.equal(value, this.value)) {
      this.value = this.clone(value)
      for (const [id, run] of this.subscribers) {
        run(value)
      }
    }
  }

  update (updater: (value: T) => T) {
    // we have to send the user's updater function a cloned value, because they might mutate it
    this.set(updater(this.clone(this.value)))
  }

  subscribe (run: (s: T) => any) {
    // if we previously had no listeners, then we will have unsubscribed from our sources
    // and we need to re-subscribe so our new listener will get updates
    if (this.subscribers.size === 0) this.subscribeToSources()

    // generate a random id for this subscriber, it makes unsubscription O(1) instead of O(n)
    let id: string
    do {
      id = Math.random().toString(32)
    } while (this.subscribers.has(id))

    // register our new subscriber to receive updates
    this.subscribers.set(id, run)
    // immediately send the current value to our new subscriber
    run(this.value)

    // return an unsubscribe function
    return () => {
      this.subscribers.delete(id)
      // if we have no listeners, stop listening to our sources for updates
      // this makes it possible for us to be properly garbage collected
      if (this.subscribers.size === 0) this.unsubscribeFromSources()
    }
  }

  /**
   * Provided as a last ditch avenue to clean up memory after rogue subscribers forget
   * to unsubscribe themselves. For example, in an SSR environment one could clear out
   * global stores anytime a request finishes and no other requests are being processed.
   */
  clearSubscribers () {
    this.subscribers.clear()
    this.unsubscribeFromSources()
  }

  /**
   * Stores that subscribe to external events should set it up with a start/stop mentality
   * so that the external events can be unsubscribed when the store itself has no listeners
   * to notify. This helps ensure unused stores can be garbage collected.
   *
   * To do this, pass registerSource a function that initializes the subscription to the external
   * event, and returns a function that can unsubscribe from the external event. This parent
   * class will take care of running those functions at appropriate times.
   */
  protected registerSource (fn: () => () => void) {
    if (this.subscribers.size) this.cleanups.push(fn())
    this.sourceInits.push(fn)
  }

  /**
   * Provided in case a child class has a need to change out the external resources
   */
  protected unregisterSources () {
    this.unsubscribeFromSources()
    this.sourceInits = []
  }

  private subscribeToSources () {
    for (const fn of this.sourceInits) {
      this.cleanups.push(fn())
    }
  }

  private unsubscribeFromSources () {
    for (const fn of this.cleanups) fn()
    this.cleanups = []
  }
}
