import React, { PureComponent } from 'react'
import StaticComponent from 'components/StaticComponent'
import PropTypes from 'prop-types'
import Panel from './Panel'
import ForecastContainer from 'containers/Forecast'
import { List, Entry, Definition, Term } from 'components/description'
import { Status } from 'components/misc'
import { LEVELS, Texts as ForecastRatingTexts } from 'constants/forecast/rating'
import { Texts as ElevationTexts } from 'constants/forecast/elevation'
import {
    SIMPLE,
    CHALLENGING,
    COMPLEX,
    Texts as TerrainRatingTexts,
} from 'constants/forecast/ates'
import { DropdownFromOptions } from 'components/controls'
import styles from '../TripPlanner.css'
import { Locate } from 'components/button'
import { Position } from 'components/misc'

export default class AvaluatorPanel extends PureComponent {
    static propTypes = {
        location: PropTypes.object.isRequired,
        header: PropTypes.string,
        region: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        terrainRating: PropTypes.oneOf([SIMPLE, CHALLENGING, COMPLEX])
            .isRequired,
        onLocateClick: PropTypes.func.isRequired,
        onAreaLocateClick: PropTypes.func.isRequired,
        onLocationLocateClick: PropTypes.func.isRequired,
    }
    static defaultProps = {
        header: 'Avaluator',
    }
    state = {
        elevation: null,
    }
    componentWillReceiveProps({ name }) {
        if (name !== this.props.name) {
            this.setState({ elevation: null })
        }
    }
    handleElevationChange = elevation => this.setState({ elevation })
    get simple() {
        return (
            <div className={styles.PanelContent}>
                <p>
                    When travelling in "Simple" terrain, you must use
                    appropriate elevation to plan properly.
                </p>
                <DropdownFromOptions
                    onChange={this.handleElevationChange}
                    value={this.state.elevation}
                    placeholder="Choose an elevation"
                    options={ElevationTexts}
                />
            </div>
        )
    }
    renderChart(forecast) {
        const dangerRatings = forecast
            .getIn(['dangerRatings', 0, 'dangerRating'])
            .toObject()
        const { terrainRating } = this.props
        let dangerRating = null

        if (terrainRating === SIMPLE) {
            const { elevation } = this.state

            if (!elevation) {
                return null
            }

            dangerRating = dangerRatings[elevation.toLowerCase()]
        } else {
            dangerRating =
                LEVELS[
                    Math.max(
                        LEVELS.indexOf(dangerRatings.alp),
                        LEVELS.indexOf(dangerRatings.tln),
                        LEVELS.indexOf(dangerRatings.btl)
                    )
                ]
        }

        const danger = LEVELS.indexOf(dangerRating)
        const { lng, lat } = this.props.location

        return [
            <Chart terrain={terrainRating} danger={danger} />,
            <Legend />,
            <List style={LIST_STYLE}>
                <Entry term="Terrain rating">
                    {TerrainRatingTexts.get(terrainRating)}
                </Entry>
                <Entry term="Danger rating">
                    {ForecastRatingTexts.get(dangerRating)}
                </Entry>
                <Term>
                    <div className={styles.Location}>
                        <span>Pin location</span>
                        <Locate onClick={this.props.onLocationLocateClick} />
                    </div>
                </Term>
                <Definition>
                    <Position longitude={lng} latitude={lat} />
                </Definition>
            </List>,
        ]
    }
    renderChildren({ status, forecast }) {
        return (
            <div className={styles.PanelContent}>
                <Status {...status} />
                {this.props.terrainRating === SIMPLE && this.simple}
                {forecast && this.renderChart(forecast)}
            </div>
        )
    }
    render() {
        const { name, region, header } = this.props

        return (
            <Panel expanded header={header}>
                <header>
                    <h2>{name}</h2>
                    <Locate onClick={this.props.onAreaLocateClick} />
                </header>
                <ForecastContainer name={region}>
                    {data => this.renderChildren(data)}
                </ForecastContainer>
            </Panel>
        )
    }
}

// Components
class Chart extends PureComponent {
    static X_COORDINATES = [42.3, 111.9, 181.3]
    static Y_COORDINATES = [149.6, 117.7, 85.9, 53.9, 25.7]
    static propTypes = {
        terrain: PropTypes.number.isRequired,
        danger: PropTypes.number.isRequired,
    }
    get indicator() {
        const { terrain, danger } = this.props
        const x = this.constructor.X_COORDINATES[terrain - 1]
        const y = this.constructor.Y_COORDINATES[danger - 1]

        return <circle cx={x} cy={y} r="7" />
    }
    render() {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 225 173">
                <path
                    d="M6.3 28.4c0 .6 46.7 19.4 86.2 38.9s123.7 30 123.7 30V152s1 14.4-11.3 14.4h-58.6s-8.3-49-43-69-97-50.8-97-50.8V28.4z"
                    fill="#fcee23"
                />
                <path
                    d="M6.3 31.8v-8.9c0-13.5 1-16.1 13.8-16 13.6.1 157.1 0 180.8 0 16.7 0 15.3 4.8 15.3 18.6V98s-80.7-8.3-124.3-27C51.3 53.5 6.3 31.8 6.3 31.8z"
                    fill="#ec2227"
                />
                <path
                    d="M6.3 50v100.4c0 13.3 1.8 15.9 20.3 15.9s140.5-.1 140.5-.1c-5-21.6-8.5-30.5-19.8-43.3-16.6-18.8-28.3-28-65-45.5-12.6-6-76-35.5-76-35.5V50z"
                    fill="#12b24b"
                />
                <path
                    d="M6.3 30.4s45 21.8 85.6 39.3c43.6 18.8 124.3 27 124.3 27V98s-80.7-8.3-124.3-27C51.3 53.5 6.3 31.8 6.3 31.8v-1.4z"
                    fill="#f15b25"
                />
                <path
                    d="M6.3 31.6s45 21.8 85.6 39.3c43.6 18.8 124.3 27 124.3 27v1.4s-80.7-8.3-124.3-27C51.3 54.8 6.3 33 6.3 33v-1.4z"
                    fill="#f58220"
                />
                <path
                    d="M6.3 33s45 21.8 85.6 39.3c43.6 18.8 124.3 27 124.3 27v1.4s-80.7-8.3-124.3-27C51.3 56.1 6.3 34.4 6.3 34.4V33z"
                    fill="#faa71b"
                />
                <path
                    d="M6.3 34.1s45 21.8 85.6 39.3c43.6 18.8 124.3 27 124.3 27v1.4s-80.7-8.3-124.3-27C51.3 57.3 6.3 35.5 6.3 35.5v-1.4z"
                    fill="#ffcc04"
                />
                <path
                    d="M6.3 46s62 28.2 74.6 34.1c36.8 17.2 48.4 25.8 65.1 44.3 11.5 12.6 14.8 20.6 19.8 41.9h1.5c-5-21.2-8.5-29.9-19.8-42.5-16.6-18.4-28.3-27.5-65.1-44.7C69.7 73.2 6.3 44.3 6.3 44.3V46z"
                    fill="#51b848"
                />
                <path
                    d="M6.3 44.3s62.5 28.6 75.3 34.6c37.1 17.4 48.8 26.1 65.7 44.9 11.6 12.8 14.9 20.9 19.9 42.5h1.5c-5-21.5-8.6-30.4-19.9-43-16.7-18.7-28.5-27.9-65.6-45.3C70.4 72 6.5 42.7 6.5 42.7l-.2 1.6z"
                    fill="#8fc640"
                />
                <path
                    d="M6.3 43s63.1 28.9 75.9 35c37.4 17.6 49.2 26.4 66.2 45.4 11.7 13 15 21.2 20.1 42.9h1.5c-5-21.8-8.7-30.7-20.1-43.5C133 103.9 121.1 94.6 83.7 77 70.8 71 6.3 41.3 6.3 41.3V43z"
                    fill="#bed731"
                />
                <path
                    d="M6.3 41.3s63.6 29.3 76.5 35.5c37.7 17.9 49.6 26.8 66.8 46 11.8 13.1 15.2 21.5 20.2 43.5h1.5c-5.1-22.1-8.7-31.1-20.3-44.1-17-19.1-29-28.6-66.7-46.4-13-6.1-78-36.2-78-36.2v1.7z"
                    fill="#ede80a"
                />
                <path
                    d="M6.3 22.9H216M6.3 146.8h209.5M6.3 118.6H216M6.3 86.6H216M6.3 54.8H216M112.4 6.9v159.5M42.8 6.9v159.5m139-159.5v159.5"
                    opacity=".6"
                    fill="none"
                    stroke="#fff"
                    strokeDasharray="2,1,2,1,2,1"
                />
                {this.indicator}
            </svg>
        )
    }
}

class Legend extends StaticComponent {
    render() {
        return (
            <div className={styles.Legend}>
                {COLORS.map((color, index) => (
                    <div key={color} style={{ color }}>
                        {TEXTS[index]}
                    </div>
                ))}
            </div>
        )
    }
}

const COLORS = ['#EC2227', '#FCEE23', '#12B24B']
const TEXTS = ['Not recommended', 'Extra caution', 'Caution']
const LIST_STYLE = {
    alignItems: 'center',
}
