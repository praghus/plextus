# Plextus [![Build Status](https://app.travis-ci.com/praghus/plextus.svg?branch=main)](https://app.travis-ci.com/praghus/plextus)

Plextus is a pixel art editor designed to make tiled maps and tilesets. In addition to the usual tile placement, it also allows you to draw directly on map and edit the tiles.

**Plextus is fully compatible with [Tiled](https://www.mapeditor.org/) map editor and allows you to export your finished project to `.tmx` format.**

## [Demo](https://praghus.github.io/plextus/)
![showcase](https://user-images.githubusercontent.com/5312169/174476343-20c1e62d-15d1-4c3b-a5b8-b34b06148d06.gif)

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
-   [ ] Convert image layer into tiled
-   [x] Copy, paste
-   [x] Crop and resize map
-   [x] Export to `.tmx` format
-   [x] Image layers
-   [x] Layer offset tool
-   [x] Light and dark color theme
-   [x] Lighten / darken tool
-   [x] Line tool
-   [ ] More pixel tools (Circle, Rectangle)
-   [x] Pixel bucket tool
-   [x] Pixel tool size change
-   [x] Remove tile from tileset
-   [x] Replace tile
-   [x] Set and change map background color
-   [x] Tile clone
-   [x] Undo and redo

## License

Plextus is [MIT licensed](./LICENSE).

## See also

-   [Konva](https://konvajs.org/)
-   [MUI](https://mui.com/)
-   [Tiled](https://www.mapeditor.org/)
