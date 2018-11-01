import React, { Component } from 'react'
import PropTypes from 'prop-types'
import RelativeHumidity from './charts/RelativeHumidity'
import Snow from './charts/Snow'
import Temperature from './charts/Temperature'
import Wind from './charts/Wind'
import { getDateExtent } from './utils'
import { Ratio } from 'components/misc'
import ErrorBoundary from 'components/ErrorBoundary'
import { Error } from 'components/text'
import styles from './Station.css'

const MIN_HEIGHT = 200

export default class ChartSet extends Component {
    static propTypes = {
        measurements: PropTypes.arrayOf(PropTypes.object).isRequired,
    }
    renderError() {
        return (
            <Error>
                An error happened while showing charts. Not worries we are
                already loooking into it.
            </Error>
        )
    }
    renderCharSet = (ref, { width, height }) => {
        const { measurements } = this.props
        const { min, max } = getDateExtent(measurements)

        height = Math.max(MIN_HEIGHT, height)

        return (
            <ErrorBoundary fallback={this.renderError}>
                <div ref={ref} className={styles.ChartSet}>
                    <Snow
                        data={measurements}
                        min={min}
                        max={max}
                        width={width}
                        height={height}
                    />
                    <Temperature
                        data={measurements}
                        min={min}
                        max={max}
                        width={width}
                        height={height}
                    />
                    <Wind
                        data={measurements}
                        min={min}
                        max={max}
                        width={width}
                        height={height}
                    />
                    <RelativeHumidity
                        data={measurements}
                        min={min}
                        max={max}
                        width={width}
                        height={height}
                    />
                </div>
            </ErrorBoundary>
        )
    }
    render() {
        return <Ratio>{this.renderCharSet}</Ratio>
    }
}
