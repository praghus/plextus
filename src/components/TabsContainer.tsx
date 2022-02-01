import React, { useState } from 'react'

import { AppBar, Tab, Tabs } from '@mui/material'
import Palette from './Palette'
import PropertiesTab from './PropertiesTab'
import TabPanel from './TabPanel'
import Tileset from './Tileset'

type Props = {
    tilesetCanvas: HTMLCanvasElement
}

const TabContainer = ({ tilesetCanvas }: Props): JSX.Element => {
    const [tab, setTab] = useState(0)

    return (
        <>
            <AppBar position="static" color="default">
                <Tabs value={tab} onChange={(_, value) => setTab(value as number)}>
                    <Tab label="Tileset" />
                    <Tab label="Colors" />
                    <Tab label="Properties" />
                </Tabs>
            </AppBar>
            <TabPanel value={tab} index={0}>
                <Tileset {...{ tilesetCanvas }} />
            </TabPanel>
            <TabPanel value={tab} index={1}>
                <Palette />
            </TabPanel>
            <TabPanel value={tab} index={2}>
                <PropertiesTab />
            </TabPanel>
        </>
    )
}
TabContainer.displayName = 'TabContainer'

export default TabContainer
