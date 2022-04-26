import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { ThemeWrapper } from './components'
import App from './views/App'

import './common/translations/i18n'
import 'react-toastify/dist/ReactToastify.min.css'
import 'sanitize.css/sanitize.css'

const root = createRoot(document.getElementById('root') as HTMLElement)

root.render(
    <Provider {...{ store }}>
        <ThemeWrapper>
            <App />
        </ThemeWrapper>
    </Provider>
)

if (module.hot) {
    module.hot.accept()
}
