import styled from "styled-components";
import Slider from "@material-ui/core/Slider";

import { SCALE_MIN, SCALE_MAX, SCALE_STEP } from "../../constants";

export const StyledStatusBar = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  height: 30px;
  padding: 0;
  font-size: 12px;
  line-height: 30px;
  background-color: #151515;
`;

export const StyledInfoContainer = styled.div`
  display: flex;
  width: 50%;
`;

export const StyledSliderContainer = styled.div`
  display: flex;
  width: 50%;
  color: #666;
  font-size: 11px;
  svg {
    color: #333;
    margin: 5px;
  }
`;

export const StyledScaleContainer = styled.div`
  width: 50px;
  margin-left: 15px;
`;

export const StyledCol = styled.div`
  color: #666;
  margin: 0 10px;
  svg {
    color: #333;
    margin-right: 5px;
  }
`;

export const StyledSlider = styled(Slider).attrs(() => ({
  step: SCALE_STEP,
  min: SCALE_MIN,
  max: SCALE_MAX,
}))``;
