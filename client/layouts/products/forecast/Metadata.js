import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, useIntl } from 'react-intl'
import { useForecast } from './Context'
import { DateTime } from 'components/time'
import {
    Metadata,
    Entry,
    ShareEntry,
    TimestampEntry,
} from 'components/metadata'
import differenceInDays from 'date-fns/difference_in_days'

ForecastMetadata.propTypes = {
    shareUrl: PropTypes.string,
}

export default function ForecastMetadata({ shareUrl }) {
    const forecast = useForecast()
    const intl = useIntl()

    return forecast ? (
        <Metadata>
            <TimestampEntry
                term={intl.formatMessage({
                    description: 'FX Metadata',
                    defaultMessage: 'Date Issued',
                })}
                value={forecast.dateIssued}
            />
            <ValidUntil
                dateIssued={forecast.dateIssued}
                validUntil={forecast.validUntil}
            />
            <Entry
                term={intl.formatMessage({
                    description: 'FX Metadata',
                    defaultMessage: 'Prepared by',
                })}>
                {forecast.forecaster}
            </Entry>
            {shareUrl && <ShareEntry url={shareUrl} />}
        </Metadata>
    ) : null
}

// Components
ValidUntil.propTypes = {
    validUntil: PropTypes.instanceOf(Date).isRequired,
    dateIssued: PropTypes.instanceOf(Date).isRequired,
}

function ValidUntil({ dateIssued, validUntil }) {
    const intl = useIntl()
    const term = intl.formatMessage({
        description: 'FX Metadata',
        defaultMessage: 'Valid Until',
    })

    return (
        <Entry term={term}>
            {differenceInDays(dateIssued, validUntil) > FURTHER_NOTICE_DAYS ? (
                <span>
                    <FormattedMessage
                        defaultMessage="Until further notice"
                        description="FX Metadata"
                    />
                </span>
            ) : (
                <DateTime value={validUntil} />
            )}
        </Entry>
    )
}
const FURTHER_NOTICE_DAYS = 7
