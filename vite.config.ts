import { defineConfig } from 'vite'

import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        electron({
            main: {
                // Shortcut of `build.lib.entry`.
                entry: 'electron/main.ts'
            },
            preload: {
                // Shortcut of `build.rollupOptions.input`.
                // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
                input: path.join(__dirname, 'electron/preload.ts')
            },
            // Ployfill the Electron and Node.js API for Renderer process.
            // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
            // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
            renderer:
                process.env.NODE_ENV === 'test'
                    ? // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
                      undefined
                    : {}
        })
    ],
    resolve: {
        preserveSymlinks: true,
        alias: {
            buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
            process: 'rollup-plugin-node-polyfills/polyfills/process-es6',
            util: 'rollup-plugin-node-polyfills/polyfills/util',
            sys: 'util',
            events: 'rollup-plugin-node-polyfills/polyfills/events',
            stream: 'rollup-plugin-node-polyfills/polyfills/stream',
            path: 'rollup-plugin-node-polyfills/polyfills/path',
            querystring: 'rollup-plugin-node-polyfills/polyfills/qs',
            punycode: 'rollup-plugin-node-polyfills/polyfills/punycode',
            url: 'rollup-plugin-node-polyfills/polyfills/url',
            string_decoder: 'rollup-plugin-node-polyfills/polyfills/string-decoder',
            http: 'rollup-plugin-node-polyfills/polyfills/http',
            https: 'rollup-plugin-node-polyfills/polyfills/http',
            os: 'rollup-plugin-node-polyfills/polyfills/os',
            assert: 'rollup-plugin-node-polyfills/polyfills/assert',
            constants: 'rollup-plugin-node-polyfills/polyfills/constants',
            _stream_duplex: 'rollup-plugin-node-polyfills/polyfills/readable-stream/duplex',
            _stream_passthrough: 'rollup-plugin-node-polyfills/polyfills/readable-stream/passthrough',
            _stream_readable: 'rollup-plugin-node-polyfills/polyfills/readable-stream/readable',
            _stream_writable: 'rollup-plugin-node-polyfills/polyfills/readable-stream/writable',
            _stream_transform: 'rollup-plugin-node-polyfills/polyfills/readable-stream/transform',
            timers: 'rollup-plugin-node-polyfills/polyfills/timers',
            console: 'rollup-plugin-node-polyfills/polyfills/console',
            vm: 'rollup-plugin-node-polyfills/polyfills/vm',
            zlib: 'rollup-plugin-node-polyfills/polyfills/zlib',
            tty: 'rollup-plugin-node-polyfills/polyfills/tty',
            domain: 'rollup-plugin-node-polyfills/polyfills/domain'
        }
    },
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis'
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    process: true,
                    buffer: true
                }),
                NodeModulesPolyfillPlugin()
            ]
        }
    },
    build: {
        rollupOptions: {
            plugins: [
                // Enable rollup polyfills plugin
                // used during production bundling
                {
                    name: 'rollup-plugin-node-polyfills',
                    resolveId(importee) {
                        return {
                            id: importee,
                            moduleSideEffects: false
                        }
                    },
                    load(id) {
                        if (id === 'rollup-plugin-node-polyfills/polyfills/buffer-es6') {
                            return 'export default require("buffer-es6");'
                        }
                        if (id === 'rollup-plugin-node-polyfills/polyfills/process-es6') {
                            return 'export default require("process-es6");'
                        }
                        // Add other polyfills as needed
                        return undefined
                    },
                    transform(code) {
                        // Add any necessary transformations
                        return code
                    }
                }
            ]
        }
    }
})
