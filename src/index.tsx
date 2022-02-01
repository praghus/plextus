import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { Global, css } from '@emotion/react'
import { store } from './store/store'
import App from './App'

import './common/translations/i18n'
import 'react-toastify/dist/ReactToastify.min.css'
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
`

const theme = createTheme({
    components: {
        MuiButtonBase: {
            defaultProps: {
                disableRipple: true
            }
        }
    },
    palette: {
        mode: 'dark'
    }
})

const MOUNT_NODE = document.getElementById('root') as HTMLElement

const render = () => {
    ReactDOM.render(
        <Provider {...{ store }}>
            <ThemeProvider {...{ theme }}>
                <Global {...{ styles }} />
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
