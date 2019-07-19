import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import {
    List,
    ListItem,
    Page,
    Content,
    Header,
    Main,
    Headline,
} from 'components/page'
import { Metadata, Station, Footer } from 'components/weather/station'
import { Error, Muted, Loading } from 'components/text'
import ErrorBoundary from 'components/ErrorBoundary'
import { Fulfilled, Pending } from 'components/fetch'
import * as containers from 'containers/weather'
import { path } from 'utils/station'

WeatherStation.propTypes = {
    id: PropTypes.string.isRequired,
}

export default function WeatherStation({ id }) {
    const error = (
        <Error>An error happened while loading weather station data.</Error>
    )

    return (
        <Page>
            <ErrorBoundary fallback={error}>
                <containers.Station id={id}>
                    {props => (
                        <Fragment>
                            <Header title={getTitle(props)} />
                            <Content>
                                <Main>
                                    <Pending>
                                        <Loading>
                                            Loading weather station data...
                                        </Loading>
                                    </Pending>
                                    <Fulfilled.Found>
                                        <StationLayout />
                                    </Fulfilled.Found>
                                    <Fulfilled.NotFound>
                                        <NoStation id={id} />
                                    </Fulfilled.NotFound>
                                </Main>
                            </Content>
                        </Fragment>
                    )}
                </containers.Station>
            </ErrorBoundary>
        </Page>
    )
}

function StationLayout({ data }) {
    return (
        <Fragment>
            <Metadata {...data} />
            <containers.Measurements id={data.stationId}>
                {renderMeasurements.bind(null, data)}
            </containers.Measurements>
            <Footer />
        </Fragment>
    )
}
function NoStation({ id }) {
    return (
        <Fragment>
            <Headline>
                Weather station #{id} does not exist. Click on a link below to
                see another weather station.
            </Headline>
            <containers.Stations>
                {() => (
                    <Fragment>
                        <Pending>
                            <Loading>Loading all weather stations...</Loading>
                        </Pending>
                        <Fulfilled>
                            {data => (
                                <List>
                                    {data.map(({ stationId, name }) => (
                                        <ListItem
                                            key={stationId}
                                            to={path(stationId)}>
                                            {name}
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Fulfilled>
                    </Fragment>
                )}
            </containers.Stations>
        </Fragment>
    )
}
function renderMeasurements({ utcOffset }, { pending, data }) {
    return pending || !data ? (
        <Muted>Loading measurements...</Muted>
    ) : (
        <Station utcOffset={utcOffset} measurements={data} />
    )
}
function getTitle({ pending, data }) {
    return pending ? 'Loading...' : data?.name || 'No weather station'
}
