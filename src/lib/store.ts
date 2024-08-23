import { listenKeys } from 'nanostores'
import { useEffect, useState } from 'hono/jsx'
import type { Store, StoreValue } from 'nanostores'

type StoreKeys<T> = T extends { setKey: (k: infer K, v: any) => unknown }
  ? K
  : never

export interface UseStoreOptions<SomeStore> {
  /**
   * Will re-render components only on specific key changes.
   */
  keys?: StoreKeys<SomeStore>[]
}

/**
 * Subscribe to store changes and get store’s value.
 *
 * Can be user with store builder too.
 *
 * ```js
 * import { useStore } from '@/lib/store'
 *
 * import { router } from '../store/router'
 *
 * export const Layout = () => {
 *   let page = useStore(router)
 *   if (page.router === 'home') {
 *     return <HomePage />
 *   } else {
 *     return <Error404 />
 *   }
 * }
 * ```
 */
export function useStore<SomeStore extends Store>(store: SomeStore, opts: UseStoreOptions<SomeStore> = {}): StoreValue<SomeStore> {
  let [, forceRender] = useState({})
  let [valueBeforeEffect] = useState(store.get())

  useEffect(() => {
    valueBeforeEffect !== store.get() && forceRender({})
  }, [])

  useEffect(() => {
    let batching: number | undefined, timer: number | undefined, unlisten: () => void
    let rerender = () => {
      if (!batching) {
        batching = 1
        timer = setTimeout(() => {
          batching = undefined
          forceRender({})
        })
      }
    }
    if (opts.keys) {
      unlisten = listenKeys(store as any, opts.keys, rerender)
    } else {
      unlisten = store.listen(rerender)
    }
    return () => {
      unlisten()
      clearTimeout(timer)
    }
  }, [store, '' + opts.keys])

  return store.get()
}