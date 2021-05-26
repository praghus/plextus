import React from "react";
import PropTypes from "prop-types";
import { Group, Line, Rect, Text } from "react-konva";

import { getRgbaValue } from "../../utils/colors";

const GridLines = ({ grid, width, height, selectedLayer, scale, dash }) => {
  if (!grid.visible || grid.width * scale < 8) {
    return null;
  }

  const lines = [];
  const line = (key, points) => (
    <Line
      dash={dash && [2 / scale, 2 / scale]}
      {...{
        key,
        points,
        stroke: getRgbaValue(grid.color),
        strokeWidth: 0.8 / scale,
      }}
    />
  );
  for (let i = 1; i < width / grid.width; i += 1) {
    lines.push(
      line(`w${i}`, [
        Math.round(i * grid.width),
        0,
        Math.round(i * grid.width),
        height,
      ]),
    );
  }
  for (let j = 1; j < height / grid.height; j += 1) {
    lines.push(
      line(`h${j}`, [
        0,
        Math.round(j * grid.height),
        width,
        Math.round(j * grid.height),
      ]),
    );
  }

  return (
    <Group {...{ width, height }} listening={false} type="div">
      {lines}
      {/* {selectedLayer && selectedLayer.data && selectedLayer.data.map((gid, i) => {
        const x = 1 + (i % selectedLayer.width) * grid.width
        const y = 1 + Math.ceil(((i + 1) / selectedLayer.width) - 1) * grid.height
        return gid ?
          <Text {...{ x, y }} fill={getRgbaValue(grid.color)} fontSize={4.5} text={gid} key={`${x}-${y}`} /> :
          null
      })} */}
    </Group>
  );
};

GridLines.propTypes = {
  grid: PropTypes.object.isRequired,
  height: PropTypes.number.isRequired,
  scale: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  selectedLayer: PropTypes.object,
  dash: PropTypes.bool,
};

GridLines.defaultProps = {
  dash: true,
};

export default GridLines;
