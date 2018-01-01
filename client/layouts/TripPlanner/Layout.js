import React, { Component } from 'react'
import styles from './TripPlanner.css'
import Map from './Map'
import Welcome from './panels/Welcome'
import Avaluator from './panels/Avaluator'
import Forecast from './panels/Forecast'
import TerrainRating from './panels/TerrainRating'
import { Disclaimer, DangerRatings } from 'components/forecast/Footer'
import bbox from '@turf/bbox'
import { geometryCollection } from '@turf/helpers'
import get from 'lodash/get'

export default class TripPlannerLayout extends Component {
    state = {
        area: null,
        region: null,
    }
    fitBounds = geometry => {
        this.map.fitBounds(bbox(geometry), {
            padding: 25,
        })
    }
    handleForecastSelect = region => this.setState({ region })
    handleAreaSelect = area => this.setState({ area })
    handleMapLoad = event => {
        const map = event.target

        this.map = map
    }
    handleAreaLocateClick = () => {
        const { ATES_RECREATION_BNDRY_NAME } = this.state.area.properties
        const areas = this.map.querySourceFeatures('composite', {
            sourceLayer: 'ates-terrain-7cew5b',
            filter: [
                '==',
                'ATES_RECREATION_BNDRY_NAME',
                ATES_RECREATION_BNDRY_NAME,
            ],
        })
        const geometries = areas.map(area => area.geometry)

        this.fitBounds(geometryCollection(geometries))
    }
    get forecast() {
        return (
            <Forecast
                onLocateClick={this.fitBounds}
                name={this.state.region.properties.id}
            />
        )
    }
    get avaluator() {
        const {
            ATES_RECREATION_BNDRY_NAME,
            ATES_ZONE_CLASS_CODE,
        } = this.state.area.properties

        return (
            <Avaluator
                region={get(this.state.region, 'properties.id')}
                name={ATES_RECREATION_BNDRY_NAME}
                terrainRating={ATES_ZONE_CLASS_CODE}
                onAreaLocateClick={this.handleAreaLocateClick}
            />
        )
    }
    render() {
        const { area, region } = this.state

        return (
            <div className={styles.Layout}>
                <Map
                    onLoad={this.handleMapLoad}
                    onForecastSelect={this.handleForecastSelect}
                    onAreaSelect={this.handleAreaSelect}
                />
                <div className={styles.Sidebar}>
                    {area ? null : <Welcome />}
                    {area ? this.avaluator : null}
                    {region ? this.forecast : null}
                    <TerrainRating />
                    <DangerRatings />
                    <Disclaimer />
                </div>
            </div>
        )
    }
}
