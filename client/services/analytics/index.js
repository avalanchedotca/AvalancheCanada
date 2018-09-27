import { Component } from 'react'
import PropTypes from 'prop-types'
import supported from '@mapbox/mapbox-gl-supported'

// From: https://developers.google.com/analytics/devguides/collection/analyticsjs/events
export function handleOutboundSponsorClick(event) {
    navigation('Outbound Sponsor', event.currentTarget.href)
}

export function handleForecastTabActivate(label) {
    navigation('Forecast Tab activation', label)
}

export function notFound({ pathname }) {
    navigation('Not Found', pathname, { nonInteraction: true })
}

export default class Analytics extends Component {
    static propTypes = {
        location: PropTypes.object.isRequired,
        children: PropTypes.element.isRequired,
    }
    log() {
        const { pathname } = this.props.location

        ga('send', 'pageview', pathname)
    }
    componentDidMount() {
        ga('set', 'transport', 'beacon')
        ga('set', MAPBOXGL_SUPPORTED, supported().toString())
        this.log()
    }
    componentDidUpdate({ location }) {
        if (this.props.location.pathname !== location.pathname) {
            this.log()
        }
    }
    render() {
        return this.props.children
    }
}

// Utils and constants
const { ga } = window
const MAPBOXGL_SUPPORTED = 'dimension1'
function navigation(...args) {
    ga('send', 'event', 'Navigation', ...args)
}
