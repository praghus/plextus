import React from 'react'
import PropTypes from 'prop-types'
import Box from '@material-ui/core/Box'

const TabPanel = ({ children, value, index, ...other }): JSX.Element => (
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

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired
}

export default TabPanel
