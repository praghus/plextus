# Plextus

### Pixel art editor designed to make tiled maps and tilesets.

-   Plextus allows you to create and edit tile maps and tile sets, it also allows you to draw directly on tiles and track changes on your map in real time.
-   Plextus is fully compatible with [Tiled](https://www.mapeditor.org/) map editor and allows you to export your finished project to `.tmx` format.

# [Demo](http://plextus.surge.sh/)

![showcase](https://user-images.githubusercontent.com/5312169/125956013-1d561a40-bafb-481b-8ddd-8234318b5c92.gif)

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

- [x] Line tool
- [x] Paint bucket tool
- [ ] More pixel tools (Circle, Rectangle)
- [ ] Crop and resize
- [ ] Change grid color
- [ ] Support tile flips
- [ ] Tile clone
- [ ] Tile bucket fill tool
- [ ] Remove tile from tileset
- [ ] Set and change map background color 


## See also

-   [Konva](https://konvajs.org/)
-   [Material-UI](https://material-ui.com/)
-   [Tiled](https://www.mapeditor.org/)
