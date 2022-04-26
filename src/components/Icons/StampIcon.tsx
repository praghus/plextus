import React from 'react'
import SvgIcon from '@mui/material/SvgIcon'

const StampIcon: React.FunctionComponent = props => (
    <SvgIcon {...props} viewBox="0 0 229.885 229.885">
        <path
            d={`M209.442,140.885h-54.674c-7.302-8.819-10.738-18.59-10.738-30.487c0-19.465,11.974-43.381,12.075-43.582
        c0.033-0.064,0.065-0.127,0.096-0.189c3.918-6.768,5.987-14.439,5.987-22.203C162.189,19.928,142.261,0,117.767,0
        C93.271,0,73.342,19.929,73.342,44.425c0,7.767,2.068,15.439,5.982,22.203c0.024,0.049,0.05,0.1,0.076,0.153
        c0.121,0.239,12.101,24.196,12.101,43.616c0,11.898-3.436,21.67-10.739,30.487h-60.32v60h13v29h164v-29h12V140.885z
        M182.442,214.885h-134v-14h134V214.885z`}
        />
    </SvgIcon>
)
StampIcon.displayName = 'StampIcon'

export default StampIcon
