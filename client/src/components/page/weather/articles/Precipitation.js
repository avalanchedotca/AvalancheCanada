import React from 'react'
import {Tab, TabSet} from 'components/tab'
import {Article} from 'components/page'
import Tutorial from './Tutorial'
import {Loop} from 'components/weather'

export default function Precipitation() {
    return (
        <Article title='Precipitation'>
            <TabSet>
                <Tab title='BC (HR)'>
                    <Loop type='AC_HRDPS_BC_wms-1hr-precip' />
                </Tab>
                <Tab title='South Coast (HR)'>
                    <Loop type='AC_HRDPS_BC-S-Cst_1hr-precip' />
                </Tab>
                <Tab title='South Interior (HR)'>
                    <Loop type='AC_HRDPS_BC-S-Int_1hr-precip' />
                </Tab>
                <Tab title='Type (R)'>
                    <Loop type='AC_RDPS_BC_precip-types' />
                </Tab>
                <Tab title='Tutorial'>
                    <Tutorial uid='precipitation' />
                </Tab>
            </TabSet>
        </Article>
    )
}
