import React from 'react'

type Props = {
    className?: string
}

const LineIcon = ({ className }: Props): JSX.Element => (
    <svg width="24" height="24" viewBox="0 0 24 24" className={className}>
        <path
            d="M 19.9375 1.9375 L 1.9375 19.9375 L 4.0625 22.0625 L 22.0625 4.0625 L 19.9375 1.9375 z"
            overflow="visible"
            enableBackground="accumulate"
            fontFamily="Bitstream Vera Sans"
        />
    </svg>
)

export default LineIcon