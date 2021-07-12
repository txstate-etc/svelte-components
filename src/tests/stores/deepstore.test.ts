import { get, writable } from 'svelte/store'
import { Store, subStore, convertStore, SafeStore, derivedStore } from '../../lib'

const teststore = new Store({ deep: { value: 'here' }, hello: 'world' })

test('store notifies subscribers when updated, but not when nothing changes', async () => {
  let updatecount = 0
  const unsubscribe = teststore.subscribe(v => updatecount++)
  expect(updatecount).toEqual(1)
  const unsubscribe2 = teststore.subscribe(v => updatecount++)
  expect(updatecount).toEqual(2)
  teststore.update(v => ({ ...v, anotherprop: 'test' }))
  expect(updatecount).toEqual(4)
  teststore.update(v => ({ ...v, anotherprop: 'test' }))
  expect(updatecount).toEqual(4)
  unsubscribe()
  unsubscribe2()
})

test('deepstore can stay in sync with a writable', async () => {
  const store = writable(0)
  const syncstore = convertStore(store)
  store.set(5)
  expect(get(store)).toEqual(5)
  expect(get(syncstore)).toEqual(5)
  syncstore.set(20)
  expect(get(store)).toEqual(20)
  expect(get(syncstore)).toEqual(20)
})

test('derivedstore can stay in sync with one parent store', async () => {
  const derivedstore = derivedStore(teststore, v => v.deep.value)
  teststore.update(v => ({ ...v, deep: { ...v.deep, value: 'there' } }))
  expect(get(derivedstore)).toEqual('there')
  teststore.update(v => ({ ...v, deep: { ...v.deep, value: 'here' } }))
  expect(get(derivedstore)).toEqual('here')
})

test('derivedstore can stay in sync with two parent stores', async () => {
  const a = new Store(1)
  const b = new Store(1)
  const sumstore = derivedStore([a, b], ([va, vb]) => va + vb)
  expect(get(sumstore)).toEqual(2)
  a.set(4)
  expect(get(sumstore)).toEqual(5)
  b.set(4)
  expect(get(sumstore)).toEqual(8)
})

test('substore should stay in sync with parent', async () => {
  const substore = subStore(teststore, 'deep.value')

  expect(get(substore)).toEqual('here')
  substore.set('there')
  expect(get(substore)).toEqual('there')
  expect(get(teststore).deep.value).toEqual('there')

  teststore.update(v => ({ ...v, deep: { value: 'here' } }))
  expect(get(substore)).toEqual('here')
  expect(get(teststore).deep.value).toEqual('here')
})

test('safestore should be safe against mutations', async () => {
  const safestore = new SafeStore({ hello: 'there' })
  let count = 0
  const unsubscribe = safestore.subscribe(v => {
    count++
    if (count === 1) expect(v.hello).toEqual('there')
    else expect(v.hello).toEqual('friend')
  })
  safestore.update(v => { v.hello = 'friend'; return v })
  expect(count).toBeGreaterThan(1)
  unsubscribe()
})
