import React from 'react'
import { useTheme } from '@mui/material/styles'

interface Props {
    width?: number
    height?: number
}

const PlextusLogo = (props: Props) => {
    const theme = useTheme()
    const colors = {
        background: theme.palette.background.default || '#fff',
        text: theme.palette.text.primary || '#111'
    }
    return (
        <svg height="60" viewBox="0 0 137 60" {...props}>
            <g fill={colors.text}>
                <path d="M13.239 12 c5.1164 0 9.2784 4.1624 9.2784 9.2784 s-4.162 9.2784 -9.2784 9.2784 l-7.2468 0 l0 7.247 c0 1.2128 -0.98328 2.196 -2.196 2.196 s-2.196 -0.98328 -2.196 -2.196 l0 -9.4431 c0 -1.2128 0.98328 -2.196 2.196 -2.196 l9.4428 0 c2.6943 0 4.8864 -2.192 4.8864 -4.8864 s-2.1922 -4.8864 -4.8864 -4.8864 l-4.1412 0 l4.5136 4.5136 c0.85756 0.85756 0.85756 2.248 0 3.1056 c-0.85784 0.85784 -2.248 0.85784 -3.1058 0 l-8.2628 -8.2628 c-0.62808 -0.62808 -0.81584 -1.5726 -0.47576 -2.3932 s1.1408 -1.3555 2.0289 -1.3555 l9.4428 0 z M34.643 35.608 c1.2128 0 2.1961 0.98332 2.1961 2.1961 s-0.98328 2.196 -2.196 2.196 c-5.7668 0 -10.459 -4.692 -10.459 -10.459 l0 -15.345 c0 -1.2128 0.98328 -2.196 2.196 -2.196 s2.196 0.98328 2.196 2.196 l0 15.345 c0 3.3452 2.7215 6.0668 6.0668 6.0668 z M46.821999999999996 19.412 c5.6764 0 10.294 4.6176 10.294 10.294 c0 1.2128 -0.98328 2.196 -2.196 2.196 l-13.576 0 c0.87292 2.17 2.9995 3.7059 5.4784 3.7059 c1.5765 0 3.0586 -0.6138 4.1732 -1.7286 c0.85784 -0.85756 2.248 -0.85732 3.1058 0 c0.85784 0.85784 0.85756 2.2482 0 3.1058 c-1.9446 1.9443 -4.5296 3.0149 -7.2792 3.0149 c-5.6764 0 -10.294 -4.6176 -10.294 -10.294 s4.6176 -10.294 10.294 -10.294 z M41.343599999999995 27.509999999999998 l10.957 0 c-0.87292 -2.17 -2.9995 -3.7059 -5.4784 -3.7059 s-4.6056 1.5359 -5.4784 3.7059 z M70.192 29.706 l6.5452 6.5448 c0.85756 0.85756 0.85756 2.248 0 3.1056 c-0.4288 0.4288 -0.99072 0.64316 -1.5529 0.64316 s-1.1241 -0.21438 -1.5529 -0.64316 l-6.5452 -6.5452 l-6.5452 6.5452 c-0.4288 0.4288 -0.99072 0.64316 -1.5529 0.64316 s-1.1241 -0.21438 -1.5529 -0.64316 c-0.85756 -0.85756 -0.85756 -2.248 0 -3.1056 l6.5452 -6.5452 l-6.5452 -6.5452 c-0.85756 -0.85756 -0.85756 -2.248 0 -3.1056 c0.85784 -0.85756 2.248 -0.85756 3.1058 0 l6.5452 6.5452 l6.5452 -6.5448 c0.85784 -0.85756 2.248 -0.85756 3.1058 0 c0.85756 0.85756 0.85756 2.248 0 3.1056 z M89.51499999999999 35.608 c1.2128 0 2.1961 0.98332 2.1961 2.1961 s-0.98328 2.196 -2.196 2.196 c-5.7668 0 -10.459 -4.692 -10.459 -10.459 l0 -15.345 c0 -1.2128 0.98328 -2.196 2.196 -2.196 s2.196 0.98328 2.196 2.196 l0 5.2217 l6.0666 0 c1.2128 0 2.196 0.98328 2.196 2.196 s-0.98328 2.196 -2.196 2.196 l-6.0666 0 l0 5.7312 c0 3.3452 2.7215 6.0668 6.0668 6.0668 z M111.79199999999999 19.412 c1.2128 0 2.196 0.98328 2.196 2.196 l0 8.098 c0 5.6764 -4.6176 10.294 -10.294 10.294 s-10.294 -4.6176 -10.294 -10.294 l0 -8.098 c0 -1.2128 0.98328 -2.196 2.196 -2.196 s2.196 0.98328 2.196 2.196 l0 8.098 c0 3.2543 2.6476 5.902 5.902 5.902 s5.902 -2.6476 5.902 -5.902 l0 -8.098 c0 -1.2128 0.98328 -2.196 2.196 -2.196 z M129.60699999999997 27.509999999999998 c3.4434 0 6.2452 2.8016 6.2452 6.2452 s-2.8016 6.2452 -6.2452 6.2452 l-8.098 0 c-1.2128 0 -2.196 -0.98328 -2.196 -2.196 s0.98328 -2.196 2.196 -2.196 l8.098 0 c1.0217 0 1.8529 -0.8312 1.8529 -1.8529 s-0.8312 -1.8529 -1.8529 -1.8529 l-8.098 0 c-3.4434 0 -6.2452 -2.8016 -6.2452 -6.2452 s2.8016 -6.2452 6.2452 -6.2452 l8.098 0 c1.2128 0 2.196 0.98328 2.196 2.196 s-0.98328 2.196 -2.196 2.196 l-8.098 0 c-1.0217 0 -1.8529 0.8312 -1.8529 1.8529 s0.8312 1.8529 1.8529 1.8529 l8.098 0 z" />
            </g>
        </svg>
    )
}

export default PlextusLogo
