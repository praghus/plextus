import React, { useState } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import AppsIcon from "@material-ui/icons/Apps";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
import AspectRatioIcon from "@material-ui/icons/AspectRatio";
import { SCALE_MIN, SCALE_MAX, SCALE_BY } from "../../constants";
import { changePosition, changeScale } from "../../../store/editor/actions";
import {
  StyledCol,
  StyledStatusBar,
  StyledInfoContainer,
  StyledScaleContainer,
  StyledSlider,
  StyledSliderContainer,
} from "./StatusBar.styled";

const StatusBar = ({ canvas, grid, stage, workspace }): JSX.Element => {
  const { scale } = workspace;

  const [value, setValue] = useState(scale);

  const dispatch = useDispatch();
  const onChangePosition = (x, y) => dispatch(changePosition(x, y));
  const onChangeScale = (scale) => dispatch(changeScale(scale));

  const onChange = (event, value) => {
    const sx = workspace.width / 2;
    const sy = workspace.height / 2;
    const oldScale = stage.scaleX();
    const newPos = {
      x: sx - ((sx - stage.x()) / oldScale) * value,
      y: sy - ((sy - stage.y()) / oldScale) * value,
    };
    stage.scale({ x: value, y: value });
    stage.position(newPos);
    setValue(value);
  };

  const onChangeCommitted = () => {
    onChangeScale(stage.scaleX());
    onChangePosition(stage.x(), stage.y());
  };

  const onZoomIn = () =>
    scale < SCALE_MAX && onChange(null, stage.scaleX() * SCALE_BY);

  const onZoomOut = () =>
    scale > SCALE_MIN && onChange(null, stage.scaleX() / SCALE_BY);

  const onCenter = () => {
    const dimension = workspace.height > workspace.width ? "height" : "width";
    const newScale = workspace[dimension] / canvas[dimension];

    stage.scale({ x: newScale, y: newScale });
    stage.position({
      x: (workspace.width - canvas.width * newScale) / 2,
      y: (workspace.height - canvas.height * newScale) / 2,
    });

    onChangeScale(newScale);
    onChangePosition(stage.x(), stage.y());
  };

  return (
    <StyledStatusBar className="status-bar">
      <StyledInfoContainer>
        <StyledCol>
          <AspectRatioIcon onClick={onCenter} />
          {canvas.width}x{canvas.height}
        </StyledCol>
        <StyledCol>
          <AppsIcon />
          {grid.width}x{grid.height}
        </StyledCol>
      </StyledInfoContainer>
      <StyledSliderContainer>
        <ZoomOutIcon onClick={onZoomOut} />
        <StyledSlider {...{ value, onChange, onChangeCommitted }} />
        <StyledScaleContainer>{Math.round(100 * scale)}%</StyledScaleContainer>
        <ZoomInIcon onClick={onZoomIn} />
      </StyledSliderContainer>
    </StyledStatusBar>
  );
};

StatusBar.propTypes = {
  canvas: PropTypes.object.isRequired,
  grid: PropTypes.object.isRequired,
  onChangePosition: PropTypes.func.isRequired,
  onChangeScale: PropTypes.func.isRequired,
  onScale: PropTypes.func.isRequired,
  workspace: PropTypes.object.isRequired,
  stage: PropTypes.object,
};

export default StatusBar;
