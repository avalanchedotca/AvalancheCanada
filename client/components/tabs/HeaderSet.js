import React, { cloneElement, Children } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames/bind'
import { Expand } from 'components/button'
import { useToggle } from 'hooks'
import { WHITE } from 'constants/colors'
import styles from './Tabs.css'

const COMPACT = 'COMPACT'
const LOOSE = 'LOOSE'

HeaderSet.propTypes = {
    children: PropTypes.arrayOf(PropTypes.element).isRequired,
    activeTab: PropTypes.number,
    onTabChange: PropTypes.func,
    theme: PropTypes.oneOf([LOOSE, COMPACT]),
    stacked: PropTypes.bool,
}

export default function HeaderSet({
    theme = COMPACT,
    stacked,
    children,
    onTabChange,
    activeTab,
}) {
    const [expanded, toggleExpanded] = useToggle(false)
    const className = classNames({
        HeaderSet: true,
        'HeaderSet--Loose': theme === LOOSE,
        'HeaderSet--Compact': theme === COMPACT,
        'HeaderSet--Stacked': stacked,
        'HeaderSet--Expanded': expanded,
    })

    return (
        <div
            className={className}
            onClick={stacked ? toggleExpanded : undefined}>
            {Children.toArray(children)
                .filter(Boolean)
                .map((header, index) =>
                    cloneElement(header, {
                        isActive: index === activeTab,
                        onActivate() {
                            if (header.props.disabled) {
                                return
                            }

                            onTabChange(index)
                        },
                    })
                )}
            {stacked && <Expand chevron expanded={expanded} color={WHITE} />}
        </div>
    )
}

Header.propTypes = {
    isActive: PropTypes.bool,
    disabled: PropTypes.bool,
    arrow: PropTypes.bool,
    onActivate: PropTypes.func,
    style: PropTypes.object,
    children: PropTypes.node.isRequired,
}

export function Header({
    isActive,
    disabled,
    arrow,
    onActivate,
    children,
    style,
}) {
    const className = classNames({
        Header: true,
        'Header--Arrow': arrow,
        'Header--isActive': isActive,
        'Header--Disabled': disabled,
    })

    return (
        <div
            role="tab"
            className={className}
            style={style}
            onClick={onActivate}>
            {children}
        </div>
    )
}

ColoredHeader.propTypes = {
    color: PropTypes.string,
    isActive: PropTypes.bool,
    disabled: PropTypes.bool,
    arrow: PropTypes.bool,
    onActivate: PropTypes.func,
    style: PropTypes.object,
    children: PropTypes.node.isRequired,
}

export function ColoredHeader({ color, ...props }) {
    const { disabled, isActive } = props
    const style = color && {
        backgroundColor: disabled ? null : isActive ? color : null,
        color: disabled ? null : isActive ? 'white' : null,
        borderBottomColor: color,
    }

    return <Header {...props} style={style} />
}

const classNames = classnames.bind(styles)
