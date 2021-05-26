/** @jsx jsx */
import React, { useCallback, useEffect, useRef } from "react";
import Konva from "konva";
import { debounce } from "lodash";
import { jsx, css } from "@emotion/react";
import { useDispatch } from "react-redux";
import { Stage, Layer, Rect } from "react-konva";

import { SCALE_BY, TOOLS, BG_IMAGE } from "../../constants";
import {
  changeLayerData,
  changePosition,
  changePrimaryColor,
  changeScale,
  changeSelectedTile,
  changeTilesetImage,
} from "../../../store/editor/actions";
// import { getCoordsFromPos, getPointerRelativePos } from "../../../store/editor/utils";
import logger from "../../utils/logger";

import GridLines from "../GridLines";
import MapLayer from "../MapLayer";
// import KonvaTransformer from "../KonvaTransformer";

const styles = ({ selected }) => css`
  ${(selected.tool === TOOLS.DRAG &&
    `
    cursor: move;
    cursor: grab;
    cursor: -moz-grab;
    cursor: -webkit-grab;

    :active {
      cursor: grabbing;
      cursor: -moz-grabbing;
      cursor: -webkit-grabbing;
    }
  `) ||
  `
    cursor: auto;
  `}
`;

type Props = {
  canvas: any;
  grid: any;
  layers: any;
  selected: any;
  setStage: any;
  tileset: any;
  tilesetCanvas: HTMLCanvasElement;
  workspace: any;
};

const KonvaStage = ({
  canvas,
  grid,
  layers,
  selected,
  setStage,
  tileset,
  tilesetCanvas,
  workspace,
}: Props): JSX.Element => {
  const dispatch = useDispatch();
  const onChangeLayerData = (layerId, data) =>
    dispatch(changeLayerData(layerId, data));
  const onChangePrimaryColor = (color) => dispatch(changePrimaryColor(color));
  const onChangeSelectedTile = (tileId) => dispatch(changeSelectedTile(tileId));
  const onSaveTilesetImage = (blob) => dispatch(changeTilesetImage(blob));
  const onChangePosition = useCallback(
    debounce((x, y) => dispatch(changePosition(x, y)), 300),
    [],
  );
  const onChangeScale = useCallback(
    debounce((scale) => dispatch(changeScale(scale)), 300),
    [],
  );

  const stageRef = useRef<Konva.Stage>(null);
  const selectedLayer = layers.find(({ id }) => id === selected.layerId);
  const stage = stageRef.current;

  useEffect(() => {
    if (stageRef.current) {
      const { scale, x, y } = workspace;
      if (x && y) {
        stageRef.current.position({ x, y });
      } else {
        stageRef.current.position({
          x: (workspace.width - canvas.width * scale) / 2,
          y: (workspace.height - canvas.height * scale) / 2,
        });
        onChangePosition(stageRef.current.x(), stageRef.current.y());
      }
      stageRef.current.scale({ x: scale, y: scale });
      stageRef.current.batchDraw();
      setStage(stageRef.current);
    }
  }, []);

  const onScale = (newScale, pointer) => {
    if (stage) {
      const sx = pointer.x;
      const sy = pointer.y;
      const oldScale = stage.scaleX();
      const newPos = {
        x: sx - ((sx - stage.x()) / oldScale) * newScale,
        y: sy - ((sy - stage.y()) / oldScale) * newScale,
      };
      onChangeScale(newScale);
      onChangePosition(newPos.x, newPos.y);
      stage.scale({ x: newScale, y: newScale });
      stage.position(newPos);
      stage.batchDraw();
    }
  };

  const onWheel = (e) => {
    const { altKey, deltaX, deltaY } = e.evt;
    if (stage) {
      if (altKey) {
        const newScale =
          deltaY > 0 ? stage.scaleX() / SCALE_BY : stage.scaleX() * SCALE_BY;
        onScale(newScale, stage.getPointerPosition());
      } else {
        const newPos = {
          x: stage.x() - deltaX,
          y: stage.y() - deltaY,
        };
        stage.position(newPos);
        onChangePosition(newPos.x, newPos.y);
      }
      stage.batchDraw();
    }
    e.evt.preventDefault();
  };

  const onDragEnd = () => {
    if (stage) {
      onChangePosition(stage.x(), stage.y());
    }
  };

  logger.info("render", "STAGE");

  return (
    <React.Fragment>
      <div css={styles({ selected })}>
        <Stage
          ref={stageRef}
          width={workspace.width}
          height={workspace.height}
          draggable={selected.tool === TOOLS.DRAG}
          onContextMenu={(e) => {
            e.evt.preventDefault();
          }}
          {...{
            onWheel,
            onDragEnd,
          }}
        >
          <Layer imageSmoothingEnabled={false}>
            <Rect
              shadowBlur={10}
              width={canvas.width}
              height={canvas.height}
              fillPatternImage={BG_IMAGE}
              fillPatternScaleX={1 / workspace.scale}
              fillPatternScaleY={1 / workspace.scale}
            />
            {stage &&
              layers.map((layer) => (
                <MapLayer
                  key={`layer-${layer.id}`}
                  {...{
                    canvas,
                    grid,
                    layer,
                    onChangeLayerData,
                    onChangePrimaryColor,
                    onChangeSelectedTile,
                    onSaveTilesetImage,
                    selected,
                    stage,
                    tileset,
                    tilesetCanvas,
                    workspace,
                  }}
                />
              ))}
            <GridLines
              width={canvas.width}
              height={canvas.height}
              scale={workspace.scale}
              {...{ grid, selectedLayer }}
            />
          </Layer>
        </Stage>
      </div>
    </React.Fragment>
  );
};

export default KonvaStage;
// export default memo(
//   KonvaStage,
//   (prevProps, nextProps) =>
//     prevProps.grid === nextProps.grid &&
//     prevProps.workspace === nextProps.workspace &&
//     prevProps.selected === nextProps.selected &&
//     prevProps.tilesetCanvas === nextProps.tilesetCanvas,
// );
