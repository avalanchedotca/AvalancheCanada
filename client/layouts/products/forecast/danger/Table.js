import React from 'react'
import PropTypes from 'prop-types'
import styles from './Danger.css'
import * as Modes from 'constants/forecast/mode'

Table.propTypes = {
    mode: PropTypes.oneOf(Array.from(Modes)).isRequired,
    children: PropTypes.node.isRequired,
}

export default function Table({ children, mode }) {
    if (UNHANDLED.has(mode)) {
        return null
    }

    return <div className={styles.Table}>{children}</div>
}

// Constants
const UNHANDLED = new Set([
    Modes.SUMMER,
    Modes.SPRING,
    Modes.OFF,
    Modes.EARLY_SEASON,
])
