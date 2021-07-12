import { Store } from './store'
import rfdc from 'rfdc'
const cloneDeep = rfdc()

export class SafeStore<T> extends Store<T> {
  clone (value: T) {
    return cloneDeep(value)
  }
}
