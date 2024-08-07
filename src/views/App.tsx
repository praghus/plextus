import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import { useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { usePreventUnload } from '../hooks/usePreventUnload'
import { createCanvasElement, getImage } from '../common/utils/image'
import { THEMES } from '../common/constants'
import { selectIsLoading } from '../stores/app/selectors'
import { selectIsPristine } from '../stores/history/selectors'
import { selectCanvas, selectTileset } from '../stores/editor/selectors'
import { adjustWorkspaceSize } from '../stores/editor/actions'
import { changeAppTheme } from '../stores/app/actions'
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
import { useAppDispatch, useAppSelector } from '../hooks/useStore'

const App = () => {
    const theme = useTheme()

    const canvas = useAppSelector(selectCanvas)
    const isLoading = useAppSelector(selectIsLoading)
    const tileset = useAppSelector(selectTileset)
    const isPristine = useAppSelector(selectIsPristine)
    const isDarkModeEnabled = useMediaQuery('(prefers-color-scheme: dark)')

    const [tilesetCanvas, setTilesetCanvas] = useState<HTMLCanvasElement>(createCanvasElement()[0])

    const dispatch = useAppDispatch()
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
            logger.info('Tileset update', 'CANVAS')
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
            {canvas ? (
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
            ) : null}
            <ToastContainer position="bottom-left" theme={theme.palette.mode} autoClose={2000} />
        </StyledWrapper>
    )
}
App.displayName = 'App'

export default App
