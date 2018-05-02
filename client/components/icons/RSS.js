import React from 'react'
import Icon from './Icon'
import COLOR from 'constants/colors'

export default function RSS({ color = COLOR, ...props }) {
    return (
        <Icon fill="#000000" {...props}>
            <path d="M0 0h24v24H0z" fill="none" />
            <circle cx="6.18" cy="17.82" r="2.18" fill={color} />
            <path
                d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"
                fill={color}
            />
        </Icon>
    )
}
