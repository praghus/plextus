import React, { useState } from 'react'

import { Box, Tab, Tabs } from '@mui/material'

import {
    ColorLens as ColorLensIcon,
    GridView as GridViewIcon,
    Layers as LayersIcon,
    Settings as SettingsIcon
} from '@mui/icons-material'

import { Palette } from '../Palette'
import { PropertiesTab } from '../PropertiesTab'
import { TabPanel } from '../TabPanel'
import { Tileset } from '../Tileset'
import { LayersList } from '../LayersList'

interface Props {
    tilesetCanvas: HTMLCanvasElement
}

const TabContainer: React.FunctionComponent<Props> = ({ tilesetCanvas }) => {
    const [tab, setTab] = useState(0)

    return (
        <Box sx={{ width: '100%' }}>
            <Tabs value={tab} variant="fullWidth" onChange={(_, value) => setTab(value as number)}>
                <Tab icon={<LayersIcon />} sx={{ minWidth: '30px' }} />
                <Tab icon={<GridViewIcon />} sx={{ minWidth: '30px' }} />
                <Tab icon={<ColorLensIcon />} sx={{ minWidth: '30px' }} />
                <Tab icon={<SettingsIcon />} sx={{ minWidth: '30px' }} />
            </Tabs>
            <TabPanel value={tab} index={0}>
                <LayersList />
            </TabPanel>
            <TabPanel value={tab} index={1}>
                <Tileset {...{ tilesetCanvas }} />
            </TabPanel>
            <TabPanel value={tab} index={2}>
                <Palette />
            </TabPanel>
            <TabPanel value={tab} index={3}>
                <PropertiesTab />
            </TabPanel>
        </Box>
    )
}
TabContainer.displayName = 'TabContainer'

export default TabContainer
