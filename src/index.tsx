import React from 'react'
import ReactDOM from 'react-dom'
import Favicon from 'react-favicon'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { Global, css } from '@emotion/react'
import { store } from './store/store'
import faviconUrl from './assets/favicon.ico'
import history from './common/utils/history'
import App from './App'

import 'sanitize.css/sanitize.css'

const styles = css`
    html,
    body {
        height: 100%;
        width: 100%;
        overflow: hidden;
        background-color: #252525;
    }
    body {
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
            <ConnectedRouter {...{ history }}>
                <Global {...{ styles }} />
                <Favicon url={faviconUrl} />
                <App />
            </ConnectedRouter>
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
