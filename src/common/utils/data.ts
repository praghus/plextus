import request from './fetch-api'

export async function dataURLToBlob(dataUrl: string): Promise<Blob> {
    const base64Response = await fetch(dataUrl)
    const blob = await base64Response.blob()
    return blob
}

export async function dataURLToObjectURL(dataUrl: string): Promise<string> {
    const blob = await dataURLToBlob(dataUrl)
    return window.URL.createObjectURL(blob)
}

export async function blobToDataURL(blob: Blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = reject
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(blob)
    })
}

export async function getDataFromObjectURL(objectUrl: string) {
    const imageBlob = await request.blob(objectUrl)
    const dataUrl = await blobToDataURL(imageBlob as Blob)
    return dataUrl
}

export async function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png'): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob: Blob | null) => {
            blob ? resolve(blob) : reject()
        }, type)
    })
}

export function downloadProjectFile(fileName: string, content: string): void {
    const file = new Blob([content], { type: 'application/json' })
    createDownloadLink(fileName, URL.createObjectURL(file))
}

export function createDownloadLink(fileName: string, url: string) {
    const downloadLink = document.createElement('a')
    downloadLink.href = url
    downloadLink.download = fileName
    downloadLink.click()
}
