import React, { useState } from 'react'
import styled from '@emotion/styled'
import { useDispatch, useSelector } from 'react-redux'
import { debounce } from 'lodash'
import { RgbaColorPicker } from 'react-colorful'
import { makeStyles } from '@material-ui/core/styles'
import { AppBar, Tab, Tabs } from '@material-ui/core'
import { selectSelected } from '../store/editor/selectors'
import { changePrimaryColor } from '../store/editor/actions'
import Palette from './Palette'
import PropertiesTab from './PropertiesTab'
import TabPanel from './TabPanel'
import Tileset from './Tileset'

const StyledColorPicker = styled(RgbaColorPicker)`
    width: auto !important;
    margin: 15px 10px;
`

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
    const dispatch = useDispatch()
    const selected = useSelector(selectSelected)

    const [tab, setTab] = useState(0)
    const [r, g, b, a] = selected.color
    const color = { r, g, b, a: (isNaN(a) && 255) || (a > 0 && a / 255) || 0 }
    const onChange = (e: any, value: any) => setTab(value)
    const onChangeColor = debounce(
        color => dispatch(changePrimaryColor([color.r, color.g, color.b, color.a * 255])),
        300
    )

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
                <StyledColorPicker color={color} onChange={onChangeColor} />
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
