import React from 'react'
import Box from '@mui/material/Box'

interface Props {
    children?: React.ReactNode
    closed: boolean
    index: number
    value: number
}

const TabPanel: React.FunctionComponent<Props> = ({ children, closed, value, index, ...other }) => (
    <div
        role="tabpanel"
        hidden={closed}
        id={`scrollable-auto-tabpanel-${index}`}
        aria-labelledby={`scrollable-auto-tab-${index}`}
        style={{
            opacity: value !== index ? 0 : 1,
            transition: 'opacity 600ms'
        }}
        {...other}
    >
        {value === index && <Box>{children}</Box>}
    </div>
)
TabPanel.displayName = 'TabPanel'

export default TabPanel
