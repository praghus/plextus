import request from './fetch-api'

export const dataURLToBlob = async (dataUrl: string): Promise<Blob> => {
    const base64Response = await fetch(dataUrl)
    const blob = await base64Response.blob()
    return blob
}

export const dataURLToObjectURL = async (dataUrl: string): Promise<string> => {
    const blob = await dataURLToBlob(dataUrl)
    return window.URL.createObjectURL(blob)
}

export const blobToDataURL = (blob: Blob) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = reject
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(blob)
    })

export const getDataFromObjectURL = async (objectUrl: string) => {
    const imageBlob = await request.blob(objectUrl)
    const dataUrl = await blobToDataURL(imageBlob as Blob)
    return dataUrl
}

export const canvasToBlob = (canvas: HTMLCanvasElement, type = 'image/png'): Promise<Blob> =>
    new Promise((resolve, reject) => {
        canvas.toBlob((blob: Blob | null) => {
            blob ? resolve(blob) : reject()
        }, type)
    })
