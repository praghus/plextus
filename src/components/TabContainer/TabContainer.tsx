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
import { StyledTabContainer } from './TabContainer.styled'

const tabIcons = [LayersIcon, GridViewIcon, ColorLensIcon, SettingsIcon]

interface Props {
    tilesetCanvas: HTMLCanvasElement
}

const TabContainer: React.FunctionComponent<Props> = ({ tilesetCanvas }) => {
    const [value, setValue] = useState(0)
    const [closed, setClosed] = useState(false)

    return (
        <StyledTabContainer>
            <Box sx={{ width: '100%' }}>
                <Tabs
                    {...{ value }}
                    variant="fullWidth"
                    TabIndicatorProps={{ hidden: true }}
                    onChange={(_, v) => {
                        setValue(v)
                        setClosed(false)
                    }}
                >
                    {tabIcons.map((Icon, idx) => (
                        <Tab
                            icon={<Icon />}
                            key={`tab-icon-${idx}`}
                            sx={{ minWidth: '30px' }}
                            onClick={() => value === idx && setClosed(!closed)}
                        />
                    ))}
                </Tabs>
                <TabPanel {...{ closed, value }} index={0}>
                    <LayersList />
                </TabPanel>
                <TabPanel {...{ closed, value }} index={1}>
                    <Tileset {...{ tilesetCanvas }} />
                </TabPanel>
                <TabPanel {...{ closed, value }} index={2}>
                    <Palette />
                </TabPanel>
                <TabPanel {...{ closed, value }} index={3}>
                    <PropertiesTab />
                </TabPanel>
            </Box>
        </StyledTabContainer>
    )
}
TabContainer.displayName = 'TabContainer'

export default TabContainer
