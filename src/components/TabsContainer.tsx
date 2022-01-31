import React, { useState } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import { AppBar, Tab, Tabs } from '@material-ui/core'
import Palette from './Palette'
import PropertiesTab from './PropertiesTab'
import TabPanel from './TabPanel'
import Tileset from './Tileset'

const useStyles = makeStyles(() => ({
    tab: {
        minWidth: 60
    }
}))

type Props = {
    tilesetCanvas: HTMLCanvasElement
}

const TabContainer = ({ tilesetCanvas }: Props): JSX.Element => {
    const classes = useStyles()
    const [tab, setTab] = useState(0)

    const onChange = (e: any, value: any) => setTab(value)

    return (
        <>
            <AppBar position="static" color="default">
                <Tabs value={tab} {...{ onChange }}>
                    <Tab label="Tileset" className={classes.tab} />
                    <Tab label="Colors" className={classes.tab} />
                    <Tab label="Properties" className={classes.tab} />
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
