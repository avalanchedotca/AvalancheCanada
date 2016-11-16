import React from 'react'
import {Tab, TabSet} from 'components/tab'
import {Article} from 'components/page'
import Tutorial from './Tutorial'
import {Loop} from 'components/weather'

export default function Precipitation12h() {
    return (
        <Article title='Precipitation 12 hours Totals'>
            <TabSet>
                <Tab title='BC (R)'>
                    <Loop type='AC_RDPS_BC_12hr-precip' />
                </Tab>
                <Tab title='South Coast (HR)'>
                    <Loop type='AC_HRDPS_BC-S-Cst_12hr-precip' />
                </Tab>
                <Tab title='Sourth Interior (HR)'>
                    <Loop type='AC_HRDPS_BC-S-Int_12hr-precip' />
                </Tab>
                <Tab title='Tutorial'>
                    <Tutorial uid='precipitation-12h' />
                </Tab>
            </TabSet>
        </Article>
    )
}
