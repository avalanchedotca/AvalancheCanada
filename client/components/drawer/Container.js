import React, { useState, useEffect, memo } from 'react'
import PropTypes from 'prop-types'
import { Motion, spring, presets } from 'react-motion'
import Cabinet from './Cabinet'
import styles from './Drawer.css'
import noop from 'lodash/noop'
import { findNode, getPath, getParent } from 'utils/tree'

Layout.propTypes = {
    menu: PropTypes.object,
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
}

function Layout({ menu, location, ...props }) {
    const [node, setNode] = useState(null)

    useEffect(
        () => {
            props.onClose()
        },
        [location]
    )

    return <Animated root={menu} node={node} {...props} setNode={setNode} />
}

export default memo(
    Layout,
    (prevProps, nextProps) =>
        prevProps.show === nextProps.show &&
        prevProps.location === nextProps.location
)

const preset = presets.noWobble

// Handlers
function handleClick(id, event) {
    event.preventDefault()
    const node = findNode(this.root, id)

    this.setNode(node)
}

function handleContainerClick(event) {
    const { target, currentTarget } = event

    if (target !== currentTarget) {
        return
    }

    this.onClose()
}

function handleClose(id, event) {
    event.preventDefault()

    if (id === this.root.id) {
        this.onClose(id)
    } else {
        this.setNode(getParent(this.root, id))
    }
}

function handleCloseChildren(id, event) {
    event.preventDefault()
    const node = findNode(this.root, id)

    this.setNode(node)
}

function createDrawer({ id, children, ...drawer }) {
    return {
        key: id,
        data: {
            ...drawer,
            home: {
                to: this.root.to,
                label: this.root.label,
            },
            onClose: handleClose.bind(this, id),
            onClick: handleCloseChildren.bind(this, id),
            children: children.map(item => ({
                ...item,
                onClick: handleClick.bind(this, item.id),
            })),
        },
    }
}

function getStyle({ x }) {
    const transform = `translateX(${x * 100}%)`

    return {
        transform,
        WebkitTransform: transform,
    }
}

const defaultStyle = {
    x: -1,
}

Animated.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    root: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
    setNode: PropTypes.func.isRequired,
}

function Animated({ show = false, onClose = noop, root, node, setNode }) {
    const path = getPath(root, node)
    const onRest = show ? noop : onClose
    const context = { node, setNode, root, onClose }
    const drawers = path.reverse().map(createDrawer, context)
    const onClick = handleContainerClick.bind(context)
    const style = {
        x: spring(show ? 0 : -1, preset),
    }

    return (
        <Motion defaultStyle={defaultStyle} style={style} onRest={onRest}>
            {value => (
                <Container
                    style={getStyle(value)}
                    onClick={onClick}
                    drawers={drawers}
                />
            )}
        </Motion>
    )
}

Container.propTypes = {
    style: PropTypes.object,
    drawers: PropTypes.arrayOf(PropTypes.object).isRequired,
    onClick: PropTypes.func.isRequired,
}

function Container({ style = null, drawers, onClick }) {
    return (
        <div style={style} className={styles.Container} onClick={onClick}>
            <Cabinet drawers={drawers} />
        </div>
    )
}

// TODO: Remove the need for that function, which function?
