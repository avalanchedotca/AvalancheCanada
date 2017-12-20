import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Link, withRouter } from 'react-router-dom'
import Url from 'url'
import ForecastRegions from 'containers/ForecastRegions'
import Container from 'containers/Forecast'
import { Page, Content, Header, Main } from 'components/page'
import Forecast from 'components/forecast'
import { Muted } from 'components/text'
import { DateElement } from 'components/time'
import { Status } from 'components/misc'
import Alert, { WARNING } from 'components/alert'
import { Metadata, Entry } from 'components/metadata'
import ForecastMetadata from 'components/forecast/Metadata'
import { DropdownFromOptions as Dropdown, DayPicker } from 'components/controls'
import formatDate from 'date-fns/format'
import endOfYesterday from 'date-fns/end_of_yesterday'

// TODO: Move these to constants with appropriate function
const PARKS_CANADA = 'parks-canada'
const CHIC_CHOCS = 'chics-chocs'
const VANCOUVER_ISLAND = 'vancouver-island'

function getWarningText(region) {
    const owner = region.get('owner')
    const name = region.get('name')

    switch (owner) {
        case PARKS_CANADA:
            return `Archived forecast bulletins for ${
                name
            } region are available on the Parks Canada - Public Avalanche Information website`
        case CHIC_CHOCS:
        case VANCOUVER_ISLAND:
            return `You can get more information for ${
                name
            } region on their website`
        default:
            throw new Error(`Owner ${owner} not supported yet.`)
    }
}

const PARKS = 'parks'
const LINK = 'link'

function getWarningUrl(region, date) {
    const type = region.get('type')
    const url = region.get('url')

    switch (type) {
        case PARKS: {
            const externalUrl = region.get('externalUrl')
            const url = Url.parse(externalUrl, true)

            delete url.search

            Object.assign(url.query, {
                d: formatDate(date, 'YYYY-MM-DD'),
            })

            return Url.format(url)
        }
        case LINK:
            return url.replace('http://avalanche.ca', '')
        default:
            throw new Error(`Type ${type} not supported yet.`)
    }
}

@withRouter
export default class ArchiveForecast extends PureComponent {
    static propTypes = {
        name: PropTypes.string,
        date: PropTypes.instanceOf(Date),
        history: PropTypes.object.isRequired,
    }
    state = {
        name: this.props.name,
        date: this.props.date,
    }
    constructor(props) {
        super(props)

        this.disabledDays = {
            after: endOfYesterday(),
        }
    }
    componentWillReceiveProps({ name, date }) {
        if (name !== this.state.name || date !== this.state.date) {
            this.setState({
                name,
                date,
            })
        }
    }
    handleNameChange = name => this.setState({ name }, this.pushToHistory)
    handleDateChange = date => this.setState({ date }, this.pushToHistory)
    pushToHistory = () => {
        const { name, date } = this.state
        const paths = [
            '/forecasts/archives',
            name,
            date && formatDate(date, 'YYYY-MM-DD'),
        ].filter(Boolean)

        this.props.history.push(paths.join('/'))
    }
    regionsDropdown = regions => (
        <Dropdown
            options={new Map(regions.map(createRegionOption))}
            value={this.state.name}
            onChange={this.handleNameChange}
            disabled
            placeholder="Select a region"
        />
    )
    renderWarning(region) {
        const to = getWarningUrl(region, this.props.date)

        return (
            <Link to={to} target={region.get('id')}>
                <Alert type={WARNING}>{getWarningText(region)}</Alert>
            </Link>
        )
    }
    forecast = ({ forecast, region, status }) => [
        <Status {...status} />,
        forecast ? ForecastMetadata.render(forecast) : null,
        forecast ? Forecast.render(forecast) : null,
        !forecast && status.isLoaded && region
            ? this.renderWarning(region)
            : null,
    ]
    get container() {
        const { name, date } = this.state

        if (!name) {
            return <Muted>Select a forecast region.</Muted>
        }

        if (!date) {
            return <Muted>Select a forecast date.</Muted>
        }

        return (
            <Container name={name} date={date}>
                {this.forecast}
            </Container>
        )
    }
    get metadata() {
        const { name, date } = this.state

        return (
            <Metadata>
                <Entry>
                    <ForecastRegions>{this.regionsDropdown}</ForecastRegions>
                </Entry>
                {name && (
                    <Entry>
                        <DayPicker
                            date={date}
                            onChange={this.handleDateChange}
                            disabledDays={this.disabledDays}>
                            {date ? (
                                <DateElement value={date} />
                            ) : (
                                'Select a date'
                            )}
                        </DayPicker>
                    </Entry>
                )}
            </Metadata>
        )
    }
    render() {
        return (
            <Page>
                <Header title="Forecast Archive" />
                <Content>
                    <Main>
                        {this.metadata}
                        {this.container}
                    </Main>
                </Content>
            </Page>
        )
    }
}

// Utils
function createRegionOption(region) {
    return [region.get('id'), region.get('name')]
}
