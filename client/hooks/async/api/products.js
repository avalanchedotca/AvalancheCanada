import * as requests from 'requests/api'
import * as types from 'requests/api/types'
import { useCacheAsync, createKey } from '../'
import { useLanguage } from 'contexts/intl'
import { DateParam } from 'hooks/params'

export function useProduct(id) {
    const language = useLanguage()
    const params = [language, id]
    const key = createKey('product', params)

    return useCacheAsync(requests.product, params, undefined, key)
}

export function useProducts(date) {
    const language = useLanguage()
    const params = [language, date]
    const key = createKey('products', language, DateParam.format(date))

    return useCacheAsync(requests.products, params, undefined, key)
}

export function useForecasts() {
    return useProductOfType(types.FORECAST)
}

export function useSPAW() {
    return useProductOfType(types.SPAW)
}

function useProductsOfType(type, date) {
    const [allProducts = [], ...rest] = useProducts(date)
    const products = allProducts.filter(product => product.type === type)

    return [products, ...rest]
}

function useProductOfType(type) {
    const [products, ...rest] = useProductsOfType(type)

    return [products[0], ...rest]
}
