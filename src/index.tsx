import React from 'react'
import ReactDOM from 'react-dom'
import Favicon from 'react-favicon'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@material-ui/core/styles'
import { Global, css } from '@emotion/react'
import { store } from './store/store'
import theme from './themes/theme-dark'
import faviconUrl from './assets/favicon.ico'
import App from './App'

import './common/translations/i18n'
import 'sanitize.css/sanitize.css'

const styles = css`
    html {
        scroll-behavior: smooth;
    }
    body {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        overflow: hidden;
        background-color: #252525;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    &::-webkit-scrollbar {
        width: 0.7em;
        height: 0.7em;
    }
    &::-webkit-scrollbar-corner {
        background-color: #252525;
    }
    &::-webkit-scrollbar-track {
        background-color: #252525;
    }
    &::-webkit-scrollbar-thumb {
        background-color: #666;
        outline: 1px solid #666;
    }
`

const MOUNT_NODE = document.getElementById('root') as HTMLElement

const render = () => {
    ReactDOM.render(
        <Provider {...{ store }}>
            <ThemeProvider {...{ theme }}>
                <Global {...{ styles }} />
                <Favicon url={faviconUrl} />
                <App />
            </ThemeProvider>
        </Provider>,
        MOUNT_NODE
    )
}

if (module.hot) {
    module.hot.accept(['./App'], () => {
        ReactDOM.unmountComponentAtNode(MOUNT_NODE)
        render()
    })
}
render()
