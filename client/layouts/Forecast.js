import React from 'react'
import PropTypes from 'prop-types'
import { Switch, Route, Redirect } from 'react-router-dom'
import URL from 'url'
import Forecast from 'layouts/pages/Forecast'
import NorthRockies from 'layouts/pages/NorthRockies'
import ForecastRegionList from 'layouts/ForecastRegionList'
import ArchiveForecast from 'layouts/pages/ArchiveForecast'
import isAfter from 'date-fns/is_after'
import endOfYesterday from 'date-fns/end_of_yesterday'
import externals from 'router/externals'
import * as utils from 'utils/search'

ForecastLayout.propTypes = {
    match: PropTypes.object.isRequired,
}

function archive({ match, history }) {
    const { name, date } = match.params

    if (externals.has(name) && date && name) {
        const url = URL.parse(externals.get(name), true)

        url.query.d = date

        delete url.search

        window.open(URL.format(url), name)
    }

    if (date && isAfter(utils.parseDate(date), endOfYesterday())) {
        return <Redirect to={`/forecasts/${name}`} push={false} />
    }

    function onParamsChange({ name, date }) {
        const paths = [
            '/forecasts/archives',
            name,
            date && utils.formatDate(date),
        ].filter(Boolean)

        history.push(paths.join('/'))
    }

    return (
        <ArchiveForecast
            name={name}
            date={utils.parseDate(date)}
            onParamsChange={onParamsChange}
        />
    )
}

function forecast({ match }) {
    const { name } = match.params

    if (externals.has(name)) {
        window.open(externals.get(name), name)

        return <Redirect to="/forecasts" push={false} />
    }

    return <Forecast name={name} />
}

export default function ForecastLayout({ match }) {
    const { path } = match

    return (
        <Switch>
            <Route path={`${path}/archives/:name?/:date?`} render={archive} />
            <Route path={`${path}/north-rockies`} component={NorthRockies} />
            <Route path={`${path}/:name`} render={forecast} />
            <Route path={path} component={ForecastRegionList} />
        </Switch>
    )
}
