import { DeepStore } from './deepstore'
import rfdc from 'rfdc'
const cloneDeep = rfdc()

export class SafeStore<T> extends DeepStore<T> {
  clone (value: T) {
    return cloneDeep(value)
  }
}
