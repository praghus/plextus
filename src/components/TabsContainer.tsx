import React, { useCallback, useState } from 'react'
import styled from '@emotion/styled'
import { useDispatch, useSelector } from 'react-redux'
import { debounce } from 'lodash'
import { makeStyles } from '@material-ui/core/styles'
import { RgbaColorPicker } from 'react-colorful'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { selectSelected } from '../store/editor/selectors'
import { changePrimaryColor } from '../store/editor/actions'
import TabPanel from './TabPanel'
import Tileset from './Tileset'
import Palette from './Palette'

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
    const [r, g, b, a] = selected.color
    const color = { r, g, b, a: a / 255 }
    const onChangeColor = useCallback(
        debounce(color => dispatch(changePrimaryColor([color.r, color.g, color.b, color.a * 255])), 300),
        []
    )
    const [tab, setTab] = useState(0)
    const onChange = (event: any, value: any) => setTab(value)

    return (
        <>
            <AppBar position="static" color="default">
                <Tabs value={tab} {...{ onChange }}>
                    <Tab label="Tileset" className={classes.tab} />
                    <Tab label="Colors" className={classes.tab} />
                    <Tab label="Tool" className={classes.tab} />
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
                Tool
            </TabPanel>
        </>
    )
}

export default TabContainer
