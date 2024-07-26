import pako from 'pako'

export const compressLayerData = (data: (number | null)[]): string =>
    arrayBufferToBase64(pako.deflate(JSON.stringify(data)))

export const parseLayerData = (data: string): (number | null)[] =>
    JSON.parse(pako.inflate(urlBase64ToUint8Array(data), { to: 'string' }))

export function arrayBufferToBase64(buffer: Uint8Array) {
    let binary = ''
    const bytes = [].slice.call(new Uint8Array(buffer))
    bytes.forEach(b => (binary += String.fromCharCode(b)))
    return window.btoa(binary)
}

export function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}
