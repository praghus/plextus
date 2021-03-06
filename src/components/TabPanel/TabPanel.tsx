import React from 'react'
import Box from '@mui/material/Box'

interface Props {
    children?: React.ReactNode
    index: number
    value: number
}

const TabPanel: React.FunctionComponent<Props> = ({ children, value, index, ...other }) => (
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
