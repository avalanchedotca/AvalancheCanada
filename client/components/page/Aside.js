import React from 'react'
import PropTypes from 'prop-types'
import styles from './Page.css'

Aside.propTypes = {
    children: PropTypes.node.isRequired,
}

export default function Aside({ children, ...props }) {
    return (
        <aside className={styles.Aside} {...props}>
            {children}
        </aside>
    )
}
