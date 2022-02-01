import React from 'react'
import Box from '@mui/material/Box'

type Props = {
    children?: React.ReactNode
    index: number
    value: number
}

const TabPanel = ({ children, value, index, ...other }: Props): JSX.Element => (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`scrollable-auto-tabpanel-${index}`}
        aria-labelledby={`scrollable-auto-tab-${index}`}
        {...other}
    >
        {value === index && <Box>{children}</Box>}
    </div>
)
TabPanel.displayName = 'TabPanel'

export default TabPanel
