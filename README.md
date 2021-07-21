# Plextus

Plextus is a pixel art editor designed to make tiled maps and tilesets. In addition to the usual tile placement, it also allows you to draw directly on map and edit the contents of the tiles themselves.

**Plextus is fully compatible with [Tiled](https://www.mapeditor.org/) map editor and allows you to export your finished project to `.tmx` format.**

## [Demo](https://praghus.github.io/)

![showcase](https://user-images.githubusercontent.com/5312169/126199565-7960b91f-c6d9-4fc0-939f-95c07061c791.gif)

## Installation

1. Clone/download repo
2. `yarn install` (or `npm install` for npm)

## Usage

**Development**

`yarn run start-dev`

-   Build app continuously (HMR enabled)
-   App served @ `http://localhost:8080`

**Production**

`yarn run start-prod`

-   Build app once (HMR disabled) to `/dist/`
-   App served @ `http://localhost:3000`

---

**All commands**

| Command               | Description                                                                   |
| --------------------- | ----------------------------------------------------------------------------- |
| `yarn run start-dev`  | Build app continuously (HMR enabled) and serve @ `http://localhost:8080`      |
| `yarn run start-prod` | Build app once (HMR disabled) to `/dist/` and serve @ `http://localhost:3000` |
| `yarn run build`      | Build app to `/dist/`                                                         |
| `yarn run test`       | Run tests                                                                     |
| `yarn run lint`       | Run linter                                                                    |
| `yarn run lint --fix` | Run linter and fix issues                                                     |
| `yarn run start`      | (alias of `yarn run start-dev`)                                               |

## TODO

-   [ ] Bucket fill tool for tiles
-   [x] Change grid color
-   [ ] Copy, paste
-   [ ] Crop and resize map
-   [x] Image layers
-   [ ] Lighten / darken tool
-   [x] Line tool
-   [ ] More pixel tools (Circle, Rectangle)
-   [x] Paint bucket tool
-   [x] Pixel tool size change
-   [x] Remove tile from tileset
-   [ ] Set and change map background color
-   [ ] Support tile flips
-   [ ] Tile clone

## See also

-   [Konva](https://konvajs.org/)
-   [Material-UI](https://material-ui.com/)
-   [Tiled](https://www.mapeditor.org/)
