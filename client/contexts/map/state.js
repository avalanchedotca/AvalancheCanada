import React, { createContext, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useSessionStorage } from 'hooks'

const MapStateContext = createContext()

export default MapStateContext

Provider.propTypes = {
    children: PropTypes.element.isRequired,
}

export function Provider({ children }) {
    const [zoom, setZoom] = useSessionStorage('zoom', 4.3)
    const [center, setCenter] = useSessionStorage('center', {
        lng: -125.15,
        lat: 54.8,
    })
    const value = useMemo(() => ({ zoom, setZoom, center, setCenter }), [
        zoom,
        center.lng,
        center.lat,
    ])

    return (
        <MapStateContext.Provider value={value}>
            {children}
        </MapStateContext.Provider>
    )
}

export const { Consumer } = MapStateContext
