import React from 'react'
import SvgIcon from '@mui/material/SvgIcon'

const LineIcon = (props): JSX.Element => (
    <SvgIcon width="24" height="24" viewBox="0 0 24 24" {...props}>
        <path
            d="M 19.9375 1.9375 L 1.9375 19.9375 L 4.0625 22.0625 L 22.0625 4.0625 L 19.9375 1.9375 z"
            overflow="visible"
            enableBackground="accumulate"
            fontFamily="Bitstream Vera Sans"
        />
    </SvgIcon>
)
LineIcon.displayName = 'LineIcon'

export default LineIcon
