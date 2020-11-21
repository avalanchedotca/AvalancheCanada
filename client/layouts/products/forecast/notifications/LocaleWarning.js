import React from 'react'
import { LocaleSwitch, LocaleSwitcher } from 'contexts/intl'
import { ButtonSet } from 'components/button'
import { Warning } from 'components/alert'
import { useReport } from '../Context'

export default function LocaleWarning() {
    const report = useReport()

    if (report?.isFullTranslation) {
        return null
    }

    return (
        <LocaleSwitch>
            <Warning>
                <p>
                    Les prévisions d'avalanches ne sont pas complètement
                    traduites.
                </p>
                <p>Vous pouvez consulter ces prévisions d'avalanches en:</p>
                <ButtonSet>
                    <LocaleSwitcher />
                </ButtonSet>
            </Warning>
        </LocaleSwitch>
    )
}