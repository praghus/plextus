import { FONT_SPRITE } from "../../common/constants";

const noop = () => {};

export const getLayerById = (layers, id) =>
  layers.find((layer) => layer.id === id);

export const getCoordsFromPos = (grid, pos) => ({
  x: Math.ceil(pos.x / grid.width) - 1,
  y: Math.ceil(pos.y / grid.height) - 1,
});

export const getPointerRelativePos = (workspace, pos) => {
  const { x, y, scale } = workspace;
  return {
    x: (pos.x - x) / scale,
    y: (pos.y - y) / scale,
  };
};

export const getTilePos = (gid, tileset) => {
  const { firstgid, columns, tilewidth, tileheight } = tileset;
  const x = ((gid - firstgid) % columns) * tilewidth;
  const y = (Math.ceil((gid - firstgid + 1) / columns) - 1) * tileheight;
  return { x, y };
};

export const getTilesetDimensions = (tileset) => ({
  w: tileset.columns * tileset.tilewidth,
  h: Math.ceil(tileset.tilecount / tileset.columns) * tileset.tileheight,
});

export const textRenderer = (ctx) => (text, x, y) => {
  text
    .split("\n")
    .reverse()
    .forEach((output, index) => {
      for (let i = 0; i < output.length; i += 1) {
        const chr = output.charCodeAt(i);
        const size = 5;
        ctx.drawImage(
          FONT_SPRITE,
          (chr % 16) * size,
          Math.ceil((chr + 1) / 16 - 1) * size,
          size,
          size,
          Math.floor(x + i * size),
          Math.floor(y - index * (size + 1)),
          size,
          size,
        );
      }
    });
};

export const getImageData = (ctx, size, rgba = []) => {
  const [r, g, b, a] = rgba;
  const imgData = ctx.createImageData(size, size);
  for (let i = 0; i < imgData.data.length; i += 4) {
    imgData.data[i + 0] = r;
    imgData.data[i + 1] = g;
    imgData.data[i + 2] = b;
    imgData.data[i + 3] = a;
  }
  return imgData;
};

export const drawLine = (x1, y1, x2, y2, pixel = noop) => {
  let x;
  let y;
  let px;
  let py;
  let xe;
  let ye;
  let i;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const dx1 = Math.abs(dx);
  const dy1 = Math.abs(dy);

  px = 2 * dy1 - dx1;
  py = 2 * dx1 - dy1;

  if (dy1 <= dx1) {
    if (dx >= 0) {
      x = x1;
      y = y1;
      xe = x2;
    } else {
      x = x2;
      y = y2;
      xe = x1;
    }
    pixel(x, y);

    for (i = 0; x < xe; i += 1) {
      x += 1;
      if (px < 0) {
        px += 2 * dy1;
      } else {
        if ((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) {
          y += 1;
        } else {
          y -= 1;
        }
        px += 2 * (dy1 - dx1);
      }

      pixel(x, y);
    }
  } else {
    if (dy >= 0) {
      x = x1;
      y = y1;
      ye = y2;
    } else {
      x = x2;
      y = y2;
      ye = y1;
    }

    pixel(x, y);

    for (i = 0; y < ye; i += 1) {
      y += 1;
      if (py <= 0) {
        py += 2 * dx1;
      } else {
        if ((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) {
          x += 1;
        } else {
          x -= 1;
        }
        py += 2 * (dx1 - dy1);
      }

      pixel(x, y);
    }
  }
};
