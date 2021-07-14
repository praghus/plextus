import React, { useEffect, useLayoutEffect, useState } from 'react'
import Konva from 'konva'
import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useInjectReducer, useInjectSaga } from 'redux-injectors'
import { Helmet } from 'react-helmet'
import { actions as undoActions } from 'redux-undo-redo'
import { FOOTER_HEIGHT, RIGHT_BAR_WIDTH } from '../common/constants'
import { EDITOR_RESOURCE_NAME } from '../store/editor/constants'
import { getTilesetDimensions } from '../store/editor/utils'
import { selectIsLoaded, selectIsImportDialogOpen } from '../store/app/selectors'
import { selectCanvas, selectTileset } from '../store/editor/selectors'
import { adjustWorkspaceSize } from '../store/editor/actions'
import reducer from '../store/editor/reducer'
import saga from '../store/editor/saga'
import logger from '../common/utils/logger'
import LoadingIndicator from '../components/LoadingIndicator'
import LayersList from '../components/LayersList'
import ToolBar from '../components/ToolBar'
import KonvaStage from '../components/KonvaStage'
import Footer from '../components/Footer'
import StatusBar from '../components/StatusBar'
import TabContainer from '../components/TabsContainer'
import WelcomeDialog from '../components/WelcomeDialog'
// import LogoImg from '../assets/logo.png'

const StyledContainer = styled.div`
    height: calc(100vh - ${FOOTER_HEIGHT}px);
    display: flex;
`

const StyledFooter = styled(Footer)`
    height: ${FOOTER_HEIGHT}px;
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

const Editor = (): JSX.Element => {
    useInjectReducer({ key: EDITOR_RESOURCE_NAME, reducer })
    useInjectSaga({ key: EDITOR_RESOURCE_NAME, saga })

    const { t } = useTranslation()

    const canvas = useSelector(selectCanvas)
    const isImportDialogOpen = useSelector(selectIsImportDialogOpen)
    const isLoaded = useSelector(selectIsLoaded)
    const tileset = useSelector(selectTileset)

    const [tilesetCanvas, setTilesetCanvas] = useState<HTMLCanvasElement>(document.createElement('canvas'))
    // const [stage, setStage] = useState<Konva.Stage>()

    const dispatch = useDispatch()
    const onAdjustWorkspaceSize = () => dispatch(adjustWorkspaceSize())

    // Undo/Redo actions
    const onClear = () => dispatch(undoActions.clear())
    const onUndo = () => dispatch(undoActions.undo())
    const onRedo = () => dispatch(undoActions.redo())

    const onKeyDown = e => {
        if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) {
            e.shiftKey ? onRedo() : onUndo()
        }
    }

    useEffect(() => {
        if (isLoaded) {
            window.addEventListener('resize', onAdjustWorkspaceSize)
            window.addEventListener('keydown', onKeyDown)
            onAdjustWorkspaceSize()
            onClear()
        }
        return () => {
            window.removeEventListener('resize', onAdjustWorkspaceSize)
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [isLoaded])

    useLayoutEffect(() => {
        if (tileset.image && !isImportDialogOpen) {
            const { w, h } = getTilesetDimensions(tileset)
            const img = new window.Image()
            const canvasElement: any = document.createElement('canvas')
            const ctx: CanvasRenderingContext2D = canvasElement.getContext('2d')

            img.src = tileset.image
            img.onload = () => {
                canvasElement.width = w
                canvasElement.height = h
                ctx.drawImage(img, 0, 0)
                setTilesetCanvas(canvasElement)
                logger.info('New tileset', 'CANVAS')
            }
        }
    }, [tileset, isImportDialogOpen])

    return (
        <>
            <Helmet>
                <title>{t('editor')}</title>
            </Helmet>
            <StyledContainer>
                <LoadingIndicator loading={!isLoaded} />
                <ToolBar />
                <StyledMiddleContainer>{canvas && <KonvaStage {...{ tilesetCanvas }} />}</StyledMiddleContainer>
                <StyledRightContainer>
                    <TabContainer {...{ tilesetCanvas }} />
                    <LayersList />
                </StyledRightContainer>
            </StyledContainer>
            {!canvas && isLoaded && <WelcomeDialog />}
            <StyledFooter />
        </>
    )
}

export default Editor
