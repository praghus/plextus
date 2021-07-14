import React, { useEffect, useRef, useState } from 'react'
import Konva from 'konva'
import { useDispatch, useSelector } from 'react-redux'
import { Image, Layer, Rect, Stage } from 'react-konva'
// import Grid from "@material-ui/core/Grid";
import AddIcon from '@material-ui/icons/Add'
import SaveAltIcon from '@material-ui/icons/SaveAlt'
import RemoveIcon from '@material-ui/icons/Remove'
import IconButton from '@material-ui/core/IconButton'
// import Typography from "@material-ui/core/Typography";
import Slider from '@material-ui/core/Slider'
import styled from '@emotion/styled'
// import GridLines from './GridLines'
import { getTilesetDimensions, getCoordsFromPos, getPointerRelativePos, addNewTile } from '../store/editor/utils'
import { changeSelectedTile, changeTilesetImage, changeTileset } from '../store/editor/actions'
import { selectGrid, selectSelected, selectTileset } from '../store/editor/selectors'
import { RIGHT_BAR_WIDTH, SCALE_STEP } from '../common/constants'
import { Workspace } from 'store/editor/types'

const StyledTilesetImageContainer = styled.div`
    overflow: auto;
    margin-bottom: 10px;
    height: calc(45vh);
`

const StyledBottomContainer = styled.div`
    display: flex;
    justify-content: flex-end;
`

const StyledButtonContainer = styled.div`
    width: 72px;
    display: flex;
    padding: 4px;
    margin-right: 10px;
`

const StyledSliderContainer = styled.div`
    width: 240px;
    display: flex;
    padding-top: 4px;
    padding-right: 10px;
`

type Props = {
    tilesetCanvas: HTMLCanvasElement
}

const Tileset = ({ tilesetCanvas }: Props): JSX.Element => {
    const containerRef = useRef<HTMLDivElement>(null)
    const stageRef = useRef<Konva.Stage>(null)

    const grid = useSelector(selectGrid)
    const tileset = useSelector(selectTileset)
    const selected = useSelector(selectSelected)
    const imageDimensions = getTilesetDimensions(tileset)

    const [scale, setScale] = useState({ x: 2, y: 2 })
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [size, setSize] = useState({
        width: RIGHT_BAR_WIDTH - 20,
        height: 500
    })

    const { columns, tilecount, tilewidth, tileheight } = tileset

    const dispatch = useDispatch()
    const onChangeSelectedTile = (tileId: number) => dispatch(changeSelectedTile(tileId))
    const onChangeTileset = (tileset: any) => dispatch(changeTileset(tileset))
    const onSaveTilesetImage = (blob: Blob) => dispatch(changeTilesetImage(blob))

    const onMouseDown = () => {
        const stage = stageRef.current
        if (stage) {
            const localPos = getPointerRelativePos(
                {
                    x: stage.x(),
                    y: stage.y(),
                    scale: scale.x
                } as Workspace,
                stage.getPointerPosition() as Konva.Vector2d
            )
            const { x, y } = getCoordsFromPos(grid, localPos)
            const tileId = x + y * columns + 1
            if (tileId <= tilecount) {
                onChangeSelectedTile(tileId)
            }
        }
    }

    const repositionStage = (left: number, top: number): void => {
        const stage = stageRef.current
        if (stage) {
            const boundsX = imageDimensions.w * scale.x - size.width
            const boundsY = imageDimensions.h * scale.y - size.height
            const dx = left < boundsX ? left : boundsX
            const dy = top < boundsY ? top : boundsY

            stage.container().style.transform = `translate(${dx}px, ${dy}px)`
            stage.x(-dx)
            stage.y(-dy)
            stage.batchDraw()
        }
    }

    const onResize = () => {
        const container = containerRef.current
        if (container) {
            setSize({
                width: container.offsetWidth,
                height: container.offsetHeight
            })
        }
    }

    const onScroll = (e: React.UIEvent<HTMLElement>): void => {
        const element = e.currentTarget as HTMLInputElement
        if (element) {
            repositionStage(element.scrollLeft, element.scrollTop)
        }
    }

    const onScale = (newScale: any): void => {
        const stage = stageRef.current
        const container = containerRef.current
        if (stage && container) {
            stage.scale(scale)
            container.scrollTop = 0
            container.scrollLeft = 0
            repositionStage(0, 0)
            setScale({ x: newScale, y: newScale })
        }
    }

    const onAddTile = () => {
        addNewTile(tileset, tilesetCanvas, (blob: Blob, newTileId: number) => {
            onSaveTilesetImage(blob)
            onChangeTileset({ ...tileset, tilecount: newTileId })
            onChangeSelectedTile(newTileId)
        })
    }

    const onDownloadTilesetImage = () => {
        const downloadLink = document.createElement('a')
        const dataURL = tilesetCanvas.toDataURL('image/png')
        const url = dataURL.replace(/^data:image\/png/, 'data:application/octet-stream')
        downloadLink.setAttribute('download', 'tileset.png')
        downloadLink.setAttribute('href', url)
        downloadLink.click()
    }

    useEffect(() => {
        // const defaultScale = (RIGHT_BAR_WIDTH - 11) / (tilewidth * columns)
        // setScale({ x: defaultScale, y: defaultScale })
        // stageRef.current.scale(scale)
        onResize()
        window.addEventListener('resize', onResize)
        return () => {
            window.removeEventListener('resize', onResize)
        }
    }, [tileset])

    useEffect(() => {
        const x = ((selected.tileId - 1) % columns) * tilewidth
        const y = Math.ceil(selected.tileId / columns - 1) * tileheight
        setPosition({ x, y })
    }, [selected.tileId])

    return (
        <>
            <StyledTilesetImageContainer ref={containerRef} {...{ onScroll }}>
                <div
                    style={{
                        width: imageDimensions.w * scale.x,
                        height: imageDimensions.h * scale.y
                    }}
                >
                    <Stage ref={stageRef} width={size.width} height={size.height} {...{ scale }}>
                        <Layer imageSmoothingEnabled={false}>
                            {/* <Rect
                                width={imageDimensions.w}
                                height={imageDimensions.h}
                                fillPatternImage={BG_IMAGE_DARK}
                                fillPatternScaleX={1 / scale.x}
                                fillPatternScaleY={1 / scale.y}
                            /> */}
                            {tilesetCanvas && <Image image={tilesetCanvas} {...{ onMouseDown }} />}
                            {/* <GridLines
                                dash={false}
                                width={imageDimensions.w}
                                height={imageDimensions.h}
                                scale={scale.x}
                                {...{ grid }}
                            /> */}
                            <Rect
                                x={position.x}
                                y={position.y}
                                width={tilewidth}
                                height={tileheight}
                                shadowBlur={5}
                                strokeWidth={1}
                                stroke="#fff"
                                fill="rgba(255,255,255,0.3)"
                            />
                        </Layer>
                    </Stage>
                </div>
            </StyledTilesetImageContainer>

            <StyledBottomContainer>
                <StyledSliderContainer>
                    <Slider
                        step={SCALE_STEP}
                        min={0.5}
                        max={10}
                        value={scale.x}
                        onChange={(event, value) => onScale(value)}
                    />
                </StyledSliderContainer>
                <StyledButtonContainer>
                    <IconButton size="small" onClick={onAddTile}>
                        <AddIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                        <RemoveIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={onDownloadTilesetImage}>
                        <SaveAltIcon fontSize="small" />
                    </IconButton>
                </StyledButtonContainer>
            </StyledBottomContainer>
        </>
    )
}

export default Tileset
