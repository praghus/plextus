const COLOR_BALANCE = [
  [0.9, 0, 0.01],
  [0.3, 0, 0],
  [0.5, 0.2, 0.1],
];

export const convertColor = {
  arr: (c) => [c.rgb.r, c.rgb.g, c.rgb.b, c.rgb.a * 255],
  rgba: (c) => `rgba(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b}, ${c.rgb.a})`,
  rgb: (c) => `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`,
  hex: (c) => c.hex,
  rgba_rgb: (c) => (c.rgb.a === 1 ? convertColor.rgb(c) : convertColor.rgba(c)),
  rgba_hex: (c) => (c.rgb.a === 1 ? convertColor.hex(c) : convertColor.rgba(c)),
};

export function componentToHex(c) {
  const hex = c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

export const rgbToHex = (r, g, b) =>
  `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;

export const getRgbaValue = (c) =>
  `rgba(${c[0]},${c[1]},${c[2]},${(c[3] / 255).toPrecision(1)})`;

export const hexToRgb = (hex) => {
  hex = hex.substring(1, hex.length);
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return [r, g, b];
};

export const hexToRgba = (hex, a = 1) => {
  const [r, g, b] = hexToRgb(hex);
  return [r, g, b, a];
};

export function rgbToHsl(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h;
  let s;

  if (max === min) {
    h = 0;
    s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    // eslint-disable-next-line default-case
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h * 360, s * 360, l * 360];
}

export function rgb2hsv(a1, a2, a3) {
  const r = a1 / 255;
  const g = a2 / 255;
  const b = a3 / 255;
  const v = Math.max(r, g, b);
  const diff = v - Math.min(r, g, b);
  const diffc = (c) => (v - c) / 6 / diff + 1 / 2;

  let h;
  let s;
  let rr;
  let bb;
  let gg;

  if (diff === 0) {
    h = 0;
    s = 0;
  } else {
    s = diff / v;
    rr = diffc(r);
    gg = diffc(g);
    bb = diffc(b);

    if (r === v) {
      h = bb - gg;
    } else if (g === v) {
      h = 1 / 3 + rr - bb;
    } else if (b === v) {
      h = 2 / 3 + gg - rr;
    }

    if (h < 0) {
      h += 1;
    } else if (h > 1) {
      h -= 1;
    }
  }

  return [Math.round(h * 360), Math.round(s * 360), Math.round(v * 360)];
}

export function colorDistanceHsl(_color1, _color2) {
  let color1 = _color1;
  let color2 = _color2;
  let result = 0;
  color1 = rgbToHsl(color1[0], color1[1], color1[2]);
  color2 = rgbToHsl(color2[0], color2[1], color2[2]);
  for (let i = 0; i < 3; i += 1) {
    result +=
      (color1[i] - color2[i]) * (color1[i] - color2[i]) * COLOR_BALANCE[1][i];
  }
  if (Math.floor(color1[0] / 30) !== Math.floor(color2[0] / 30)) {
    return 0;
  }
  return result;
}

export function colorDistanceRgb(_color1, _color2) {
  const color1 = _color1;
  const color2 = _color2;
  let result = 0;
  for (let i = 0; i < 3; i += 1) {
    result +=
      (color1[i] - color2[i]) * (color1[i] - color2[i]) * COLOR_BALANCE[2][i];
  }
  return result;
}

export function colorDistance(_color1, _color2) {
  let color1 = _color1;
  let color2 = _color2;
  let result = 0;
  result += colorDistanceRgb(color1, color2);
  result += colorDistanceHsl(color1, color2);
  color1 = rgb2hsv(color1[0], color1[1], color1[2]);
  color2 = rgb2hsv(color2[0], color2[1], color2[2]);
  for (let i = 0; i < 3; i += 1) {
    result +=
      (color1[i] - color2[i]) * (color1[i] - color2[i]) * COLOR_BALANCE[0][i];
  }
  return result;
}

export function sortColors(colors) {
  // Calculate distance between each color
  const distances = [];
  for (let i = 0; i < colors.length; i += 1) {
    distances[i] = [];
    for (let j = 0; j < i; j += 1) {
      distances.push([
        colors[i],
        colors[j],
        colorDistance(colors[i], colors[j]),
      ]);
    }
  }
  distances.sort((a, b) => a[2] - b[2]);

  // Put each color into separate cluster initially
  const colorToCluster = {};
  for (let i = 0; i < colors.length; i += 1) {
    colorToCluster[colors[i]] = [colors[i]];
  }

  // Merge clusters, starting with lowest distances
  let lastCluster;
  for (let i = 0; i < distances.length; i += 1) {
    const color1 = distances[i][0];
    const color2 = distances[i][1];
    const cluster1 = colorToCluster[color1];
    const cluster2 = colorToCluster[color2];
    if (cluster1 && cluster2 && cluster1 !== cluster2) {
      // Make sure color1 is at the end of its cluster and color2 at the beginning.
      if (color1 !== cluster1[cluster1.length - 1]) {
        cluster1.reverse();
      }
      if (color2 !== cluster2[0]) {
        cluster2.reverse();
      }

      // Merge cluster2 into cluster1
      cluster1.push(...cluster2);
      delete colorToCluster[color1];
      delete colorToCluster[color2];
      colorToCluster[cluster1[0]] = cluster1;
      colorToCluster[cluster1[cluster1.length - 1]] = cluster1;
      lastCluster = cluster1;
    }
  }
  // By now all colors should be in one cluster
  return lastCluster;
}

export function getOrderedPalette(palette) {
  const rgbArr = palette.map((c) => c.split(",").map(Number));
  return sortColors(rgbArr);
  // const sortedRgbArr = sortColors(rgbArr)
  // return sortedRgbArr.map(
  //   // eslint-disable-next-line no-bitwise
  //   (rgb) => `#${((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1)}`
  // )
}
