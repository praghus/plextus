import React, { useState } from 'react'

import { Box, Tab, Tabs } from '@mui/material'
import { Palette } from '../Palette'
import { PropertiesTab } from '../PropertiesTab'
import { TabPanel } from '../TabPanel'
import { Tileset } from '../Tileset'

interface Props {
    tilesetCanvas: HTMLCanvasElement
}

const TabContainer: React.FunctionComponent<Props> = ({ tilesetCanvas }) => {
    const [tab, setTab] = useState(0)

    return (
        <Box sx={{ width: '100%' }}>
            <Tabs value={tab} onChange={(_, value) => setTab(value as number)}>
                <Tab label="Tileset" />
                <Tab label="Colors" />
                <Tab label="Properties" />
            </Tabs>
            <TabPanel value={tab} index={0}>
                <Tileset {...{ tilesetCanvas }} />
            </TabPanel>
            <TabPanel value={tab} index={1}>
                <Palette />
            </TabPanel>
            <TabPanel value={tab} index={2}>
                <PropertiesTab />
            </TabPanel>
        </Box>
    )
}
TabContainer.displayName = 'TabContainer'

export default TabContainer
