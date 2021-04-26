import { writable } from 'svelte/store'
import { DeepStore } from '../..'
import { SubStore } from '../../lib/substore'

const teststore = new DeepStore({ deep: { value: 'here' }, hello: 'world' })

test('deepstore notifies subscribers when updated, but not when nothing changes', async () => {
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
  const syncstore = new DeepStore(store)
  let storevalue
  let syncstorevalue
  const unsubscribe = store.subscribe(v => { storevalue = v })
  const unsubscribe2 = syncstore.subscribe(v => { syncstorevalue = v })
  store.set(5)
  expect(storevalue).toEqual(5)
  expect(syncstorevalue).toEqual(5)
  syncstore.set(20)
  expect(storevalue).toEqual(20)
  expect(syncstorevalue).toEqual(20)
  unsubscribe()
  unsubscribe2()
})

test('substore should stay in sync with parent', async () => {
  const substore = new SubStore(teststore, 'deep.value')
  let storevalue: any
  let substorevalue: any
  const unsubscribe = teststore.subscribe(v => { storevalue = v })
  const unsubscribe2 = substore.subscribe(v => { substorevalue = v })

  expect(substorevalue).toEqual('here')
  substore.set('there')
  expect(substorevalue).toEqual('there')
  expect(storevalue.deep.value).toEqual('there')

  teststore.update(v => ({ ...v, deep: { value: 'here' } }))
  expect(substorevalue).toEqual('here')
  expect(storevalue.deep.value).toEqual('here')

  unsubscribe()
  unsubscribe2()
  substore.complete()
})
