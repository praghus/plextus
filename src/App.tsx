import React, { useEffect, useLayoutEffect, useState } from 'react'
import styled from '@emotion/styled'
import { hot } from 'react-hot-loader'
import { ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { useInjectReducer, useInjectSaga } from 'redux-injectors'
import { getImage } from './common/utils/image'
import { RIGHT_BAR_WIDTH } from './common/constants'
import { EDITOR_RESOURCE_NAME } from './store/editor/constants'
import { selectIsLoading } from './store/app/selectors'
import { selectCanvas, selectTileset } from './store/editor/selectors'
import { adjustWorkspaceSize } from './store/editor/actions'
import reducer from './store/editor/reducer'
import saga from './store/editor/saga'
import logger from './common/utils/logger'
import LoadingIndicator from './components/LoadingIndicator'
import LayersList from './components/LayersList'
import ToolBar from './components/ToolBar'
import KonvaStage from './components/KonvaStage'
import TabContainer from './components/TabsContainer'
import WelcomeDialog from './components/WelcomeDialog'
import ImportDialog from './components/ImportDialog'
import NewProjectDialog from './components/NewProjectDialog'

const StyledWrapper = styled.div`
    flex-direction: column;
    display: flex;
    margin: 0 auto;
    padding: 0;
    background-color: #222;
    min-height: 100%;
    min-width: 100%;
`

const StyledContainer = styled.div`
    height: calc(100vh);
    display: flex;
`

const StyledMiddleContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: #222;
    width: 100%;
    height: 100%;
`

const StyledRightContainer = styled.div`
    width: ${RIGHT_BAR_WIDTH}px;
    min-width: ${RIGHT_BAR_WIDTH}px;
    max-width: ${RIGHT_BAR_WIDTH}px;
    display: flex;
    flex-direction: column;
    padding: 5px;
    height: 100%;
    background-color: #333;
    border-top: 1px solid #222;
    border-left: 1px solid #222;
    color: #ccc;
    font-size: small;
`

const App = (): JSX.Element => {
    useInjectReducer({ key: EDITOR_RESOURCE_NAME, reducer })
    useInjectSaga({ key: EDITOR_RESOURCE_NAME, saga })

    const canvas = useSelector(selectCanvas)
    const isLoading = useSelector(selectIsLoading)
    const tileset = useSelector(selectTileset)

    const [tilesetCanvas, setTilesetCanvas] = useState<HTMLCanvasElement>(document.createElement('canvas'))

    const dispatch = useDispatch()
    const onAdjustWorkspaceSize = () => dispatch(adjustWorkspaceSize())

    useEffect(() => {
        window.addEventListener('resize', onAdjustWorkspaceSize)
        onAdjustWorkspaceSize()
        return () => {
            window.removeEventListener('resize', onAdjustWorkspaceSize)
        }
    }, [])

    useLayoutEffect(() => {
        async function getTilesetImage(src: string) {
            const image = await getImage(src)
            const canvasElement = document.createElement('canvas')
            const ctx = canvasElement.getContext('2d') as CanvasRenderingContext2D
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
            <ToastContainer position="bottom-left" theme="dark" autoClose={2000} />
            <WelcomeDialog />
            <ImportDialog />
            <NewProjectDialog />
            <StyledContainer>
                <LoadingIndicator loading={isLoading} />
                <ToolBar />
                <StyledMiddleContainer>{canvas && <KonvaStage {...{ tilesetCanvas }} />}</StyledMiddleContainer>
                <StyledRightContainer>
                    <TabContainer {...{ tilesetCanvas }} />
                    <LayersList />
                </StyledRightContainer>
            </StyledContainer>
        </StyledWrapper>
    )
}
App.displayName = 'Plextus'

declare let module: Record<string, unknown>
export default hot(module)(App)
