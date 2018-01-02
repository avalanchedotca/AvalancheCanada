import React, { PureComponent, Children, cloneElement } from 'react'
import PropTypes from 'prop-types'
import styles from './Tabs.css'

export default class PanelSet extends PureComponent {
    static propTypes = {
        children: PropTypes.arrayOf(PropTypes.element).isRequired,
        activeTab: PropTypes.number,
    }
    get children() {
        const { children } = this.props

        return Array.isArray(children) ? children : Children.toArray(children)
    }
    render() {
        const { activeTab } = this.props

        return this.children[activeTab] || null
    }
}

const EAGER_STYLES = new Map([
    [true, { display: 'inherit' }],
    [false, { display: 'none' }],
])

export class EagerPanelSet extends PureComponent {
    static propTypes = {
        children: PropTypes.arrayOf(PropTypes.element).isRequired,
        activeTab: PropTypes.number,
    }
    renderPanel = (panel, index) =>
        cloneElement(panel, {
            style: EAGER_STYLES.get(index === this.props.activeTab),
        })
    render() {
        return Children.map(this.props.children, this.renderPanel)
    }
}

Panel.propTypes = {
    style: PropTypes.object,
    children: PropTypes.number,
}

export function Panel({ children, style }) {
    return (
        <div role="tabpanel" className={styles.Panel} style={style}>
            {children}
        </div>
    )
}
