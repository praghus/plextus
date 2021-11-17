import React from 'react'
import SvgIcon from '@material-ui/core/SvgIcon'

const TileReplaceIcon = (props): JSX.Element => (
    <SvgIcon viewBox="0 0 1024 1024" {...props}>
        <path
            d={`M620.544 137.6c103.936 10.432 187.328 72.96 205.12 180.224h-60.16l97.088 144.448 
        97.152-144.448h-67.008c-17.792-144.448-127.168-238.336-265.344-251.712-19.136-1.536-36.864 
        14.848-36.864 35.712 1.28 17.92 13.568 34.24 30.016 35.776z m-150.4-73.024H132.416c-19.136 
        0-34.176 16.384-34.176 37.248v321.728c0 20.864 15.04 37.248 34.176 37.248h337.728c19.136 0 
        34.176-16.384 34.176-37.248V101.824c0-20.864-15.04-37.248-34.176-37.248z 
        m-32.832 324.736H165.248V136.064h272.128v253.248h-0.064zM404.48 
        883.84c-116.224-10.432-205.12-87.872-209.216-216h64.256L162.496 523.392l-97.088 144.448h64.256c2.688 
        165.376 118.912 272.576 268.032 287.488 19.136 1.472 36.928-14.912 36.928-35.776a35.648 35.648 0 0 
        0-30.144-35.712z m489.6-323.264H556.288c-19.2 0-34.176 16.448-34.176 37.248v323.264c0 20.8 14.976 37.184 
        34.176 37.184h337.728c19.136 0 34.112-16.384 34.112-37.184V597.824c0.064-20.8-16.32-37.248-34.048-37.248z 
        m-32.896 324.736H589.12V633.536h272.064v251.776z`}
        />
    </SvgIcon>
)
TileReplaceIcon.displayName = 'TileReplaceIcon'

export default TileReplaceIcon
