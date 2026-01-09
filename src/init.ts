// Ensure global is defined for browser environments
if (typeof globalThis.global === 'undefined') {
    globalThis.global = globalThis
    window.global = globalThis
}

// Ensure Buffer is available globally
import { Buffer } from 'buffer'
if (typeof globalThis.Buffer === 'undefined') {
    globalThis.Buffer = Buffer
}

// Ensure process is available globally
if (typeof globalThis.process === 'undefined') {
    globalThis.process = {
        env: {
            APP_ROOT: '',
            VITE_PUBLIC: ''
        },
        cwd: () => '/',
        nextTick: (callback: (...args: unknown[]) => void, ...args: unknown[]) => {
            setTimeout(callback, 0, ...args)
        }
    } as NodeJS.Process
}
