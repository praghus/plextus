import './init.ts'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './views/App.tsx'
import { Provider } from 'react-redux'
import { store } from './stores/store'
import { ThemeWrapper } from './components'

import './common/translations/i18n'
import 'react-toastify/dist/ReactToastify.min.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemeWrapper>
                <App />
            </ThemeWrapper>
        </Provider>
    </React.StrictMode>
)

// Use contextBridge
// window?.ipcRenderer?.on("main-process-message", (_event, message) => {
//   console.log(message);
// });
