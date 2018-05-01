import Immutable from 'immutable'
import RESULT from 'reducers/result'
import { paramsToKey } from 'actions/prismic'

const MAP = new Immutable.Map()

function results(state) {
    return state.prismic.results
}

export function getResult(state, params) {
    return results(state).get(paramsToKey(params), RESULT)
}

export function hasResult(state, params) {
    return results(state).has(paramsToKey(params))
}

export function getDocumentsOfType(state, type) {
    const ids = state.prismic.ids.get(type, MAP).toMap()
    const { documents } = state.prismic

    return ids.map(id => documents.get(id))
}

export function getDocumentForUid(state, type, uid) {
    const id = getDocumentId(state, type, uid)

    return state.prismic.documents.get(id)
}

export function hasDocumentForUid(state, type, uid) {
    const id = getDocumentId(state, type, uid)

    return hasDocumentForId(state, id)
}

function hasDocumentForId(state, id) {
    return state.prismic.documents.has(id)
}

function getDocumentId(state, type, uid) {
    return state.prismic.uids.getIn([type, uid])
}

export function getDocumentFromParams(state, params) {
    const { ids } = getResult(state, params)
    const [id] = Array.from(ids)

    return state.prismic.documents.get(id)
}

export function getDocumentsFromParams(state, params) {
    const { ids } = getResult(state, params)
    const { documents } = state.prismic

    return Array.from(ids).map(id => documents.get(id))
}
