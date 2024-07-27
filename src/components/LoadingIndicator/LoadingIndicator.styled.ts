import { css } from '@emotion/react'

export const cssOverride = css`
    margin: 2em auto;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 64px;
    height: 64px;
    margin-left: -32px;
    margin-top: -32px;
    z-index: 100;
` as React.CSSProperties
