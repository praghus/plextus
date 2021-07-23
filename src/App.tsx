import { hot } from 'react-hot-loader'
import * as React from 'react'
import { Helmet } from 'react-helmet'
import { Switch, Route } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/core/styles'
import styled from '@emotion/styled'
import theme from './themes/theme-dark'
import Editor from './pages/Editor'
import NotFound from './pages/NotFound'

import './common/translations/i18n'

const StyledWrapper = styled.div`
    flex-direction: column;
    display: flex;
    margin: 0 auto;
    padding: 0;
    background-color: #222;
    min-height: 100%;
    min-width: 100%;
`

const App = () => (
    <StyledWrapper>
        <ThemeProvider {...{ theme }}>
            <Helmet titleTemplate="%s - Plextus" defaultTitle="Plextus">
                <meta name="description" content="A minimal tiled map editor made with React, Redux and Konva" />
            </Helmet>
            <Editor />
            <Switch>
                <Route exact path="/" component={Editor} />
                <Route path="" component={NotFound} />
            </Switch>
        </ThemeProvider>
    </StyledWrapper>
)

declare let module: Record<string, unknown>

export default hot(module)(App)
