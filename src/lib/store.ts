import deepEqual from 'fast-deep-equal'
import { ActiveStore } from './activestore'

/**
 * An alternative to svelte's "writable" that also checks deep equality (fast-deep-equal) before
 * notifying subscribers. A writable will notify subscribers after a shallow equality check, which
 * only works for scalars.
 *
 * Note that this strategy is weak against mutable state updates:
 * store.update(v => { v.someprop = 'newvalue'; return v })
 *
 * This line would NOT notify subscribers because the state will be compared against
 * itself and always found to be equal. If you are making updates in a mutable fashion,
 * use a SafeStore instead.
 */
export class Store<T> extends ActiveStore<T> {
  equal (a: T, b: T) {
    return deepEqual(a, b)
  }
}
