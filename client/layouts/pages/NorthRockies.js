import React from 'react'
import { Page, Header, Main, Content, Aside } from 'components/page'
import { Sidebar } from 'layouts/products/forecast'
import { NorthRockiesBlogFeed } from 'layouts/feed'
import { SPAW as SPAWComponent } from 'components/misc'
import { Region as SPAW } from 'layouts/SPAW'
import { isTouchable } from 'utils/device'

export default function NorthRockies() {
    return (
        <Page>
            <Header title="North Rockies" />
            <Content>
                <Main>
                    <SPAW name="north-rockies">{renderSPAW}</SPAW>
                    <NorthRockiesBlogFeed />
                </Main>
                <Aside>
                    <Sidebar />
                </Aside>
            </Content>
        </Page>
    )
}

function renderSPAW({ document }) {
    const { link, description } = document.data
    const style = {
        display: 'block',
        marginTop: '1em',
    }

    return (
        <SPAWComponent link={link} style={style}>
            <p>
                {description[0].text} {isTouchable ? 'Tap' : 'Click'} for more
                information.
            </p>
        </SPAWComponent>
    )
}
