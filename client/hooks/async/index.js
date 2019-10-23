import { useEffect, useRef, useReducer } from 'react'
import { useMounted } from 'hooks'
import { Memory } from 'services/cache'

export function useAsync(
    fn,
    params = [],
    initialState = [undefined, true, null]
) {
    const [state, dispatch] = useReducer(reducer, initialState)
    const controller = useRef(null)
    const mounted = useMounted()

    useEffect(() => {
        // If there is a "data", we are not dispatching a "Pending"
        if (!initialState[0]) {
            dispatch([controller.current ? Pending : InitialPending])
        }

        controller.current = createAbortController()

        fn.apply(null, [...params, controller.current.signal])
            .then(data => {
                if (!mounted) {
                    return
                }

                const { aborted } = controller.current.signal || {}

                dispatch([Fulfilled, aborted ? undefined : data])
            })
            .catch(error => {
                if (mounted) {
                    dispatch([Rejected, error])
                }
            })

        return () => {
            controller.current.abort()
        }
    }, params)

    return state
}

export function useCacheAsync(fn, params = [], initialData, key, lifespan) {
    const data = CACHE.get(key, initialData)
    const func = data
        ? () => Promise.resolve(data)
        : (...args) =>
              fn.apply(null, args).then(data => {
                  CACHE.set(key, data, lifespan)

                  return data
              })

    return useAsync(func, params, [data, !data, null])
}

// Cache
// TODO Big hack to clear cache for MIN reports once a new one got created.
export const CACHE = new Memory()

// Utils
export function createKey(...paths) {
    return paths
        .flat() // Because you can pass arrays, just in case!
        .filter(Boolean)
        .join(':')
}
const Pending = Symbol('Pending')
const InitialPending = Symbol('InitialPending')
const Fulfilled = Symbol('Fulfilled')
const Rejected = Symbol('Rejected')
function reducer(state, [type, payload]) {
    switch (type) {
        case InitialPending:
            // Initial pending, we do not want to loose the initial state!
            return [state[0], true, null]
        case Pending:
            return [undefined, true, null]
        case Fulfilled: {
            const [data, pending, error] = state

            // Look of we can bail out on a dispatch to avoid a rerender
            if (data === payload && pending === false && error === null) {
                return state
            }

            return [payload, false, null]
        }
        case Rejected:
            return [undefined, false, payload]
        default:
            return state
    }
}
function createAbortController() {
    try {
        return new AbortController()
    } catch {
        return {
            abort() {},
        }
    }
}
