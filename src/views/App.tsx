import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { useInjectReducer, useInjectSaga } from 'redux-injectors'
import { useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { usePreventUnload } from '../hooks/usePreventUnload'
import { createCanvasElement, getImage } from '../common/utils/image'
import { THEMES } from '../common/constants'
import { APP_RESOURCE_NAME } from '../store/app/constants'
import { EDITOR_RESOURCE_NAME } from '../store/editor/constants'
import { selectIsLoading } from '../store/app/selectors'
import { selectIsPristine } from '../store/history/selectors'
import { selectCanvas, selectTileset } from '../store/editor/selectors'
import { adjustWorkspaceSize } from '../store/editor/actions'
import { changeAppTheme } from '../store/app/actions'
import appReducer from '../store/app/reducer'
import editorReducer from '../store/editor/reducer'
import editorSaga from '../store/editor/saga'
import logger from '../common/utils/logger'
import {
    ImportDialog,
    KonvaStage,
    LoadingIndicator,
    MainMenu,
    NewProjectDialog,
    TabContainer,
    ThemeSwitch,
    ToolBar,
    WelcomeDialog
} from '../components'
import { StyledWrapper, StyledContainer, StyledMiddleContainer, StyledThemeSwitchContainer } from './App.styled'

const App = () => {
    useInjectReducer({ key: APP_RESOURCE_NAME, reducer: appReducer })
    useInjectReducer({ key: EDITOR_RESOURCE_NAME, reducer: editorReducer })
    useInjectSaga({ key: EDITOR_RESOURCE_NAME, saga: editorSaga })

    const theme = useTheme()

    const canvas = useSelector(selectCanvas)
    const isLoading = useSelector(selectIsLoading)
    const tileset = useSelector(selectTileset)
    const isPristine = useSelector(selectIsPristine)
    const isDarkModeEnabled = useMediaQuery('(prefers-color-scheme: dark)')

    const [tilesetCanvas, setTilesetCanvas] = useState<HTMLCanvasElement>(createCanvasElement()[0])

    const dispatch = useDispatch()
    const onAdjustWorkspaceSize = useCallback(() => dispatch(adjustWorkspaceSize()), [dispatch])
    const onChangeAppTheme = useCallback((theme: string) => dispatch(changeAppTheme(theme)), [dispatch])

    usePreventUnload(isPristine)

    useEffect(() => {
        window.addEventListener('resize', onAdjustWorkspaceSize)
        window.addEventListener('orientationchange', onAdjustWorkspaceSize)
        onAdjustWorkspaceSize()
        return () => {
            window.removeEventListener('resize', onAdjustWorkspaceSize)
            window.removeEventListener('orientationchange', onAdjustWorkspaceSize)
        }
    }, [onAdjustWorkspaceSize])

    useEffect(() => {
        onChangeAppTheme(isDarkModeEnabled ? THEMES.DARK : THEMES.LIGHT)
    }, [isDarkModeEnabled, onChangeAppTheme])

    useLayoutEffect(() => {
        async function getTilesetImage(src: string) {
            const image = await getImage(src)
            const [canvasElement, ctx] = createCanvasElement()
            canvasElement.width = image.width
            canvasElement.height = image.height
            ctx.drawImage(image, 0, 0)
            setTilesetCanvas(canvasElement)
            logger.info('New tileset', 'CANVAS')
        }
        if (tileset.image) {
            getTilesetImage(tileset.image)
        }
    }, [tileset])

    return (
        <StyledWrapper>
            <WelcomeDialog />
            <ImportDialog />
            <NewProjectDialog />
            {canvas && (
                <StyledContainer>
                    <LoadingIndicator loading={isLoading} />
                    <MainMenu />
                    <ToolBar />
                    <TabContainer {...{ tilesetCanvas }} />
                    <StyledThemeSwitchContainer>
                        <ThemeSwitch tiny />
                    </StyledThemeSwitchContainer>
                    <StyledMiddleContainer>
                        <KonvaStage {...{ tilesetCanvas }} />
                    </StyledMiddleContainer>
                </StyledContainer>
            )}
            <ToastContainer position="bottom-left" theme={theme.palette.mode} autoClose={2000} />
        </StyledWrapper>
    )
}

export default App
