const imageElement: any = document.createElement('canvas')
const ctx: CanvasRenderingContext2D = imageElement.getContext('2d')

export const getImageDimensions = (file: any): Promise<{ w: number; h: number }> =>
    new Promise((resolve, reject) => {
        const i = new Image()
        i.src = file
        i.onload = () => resolve({ w: i.width, h: i.height })
        i.onerror = reject
    })

export const createEmptyImage = (width: number, height: number): Promise<Blob> =>
    new Promise(resolve => {
        imageElement.width = width
        imageElement.height = height
        ctx.clearRect(0, 0, imageElement.width, imageElement.height)
        imageElement.toBlob((blob: Blob) => resolve(blob), 'image/png')
    })

export const downloadImage = (canvas: HTMLCanvasElement) => {
    const downloadLink = document.createElement('a')
    const dataURL = canvas.toDataURL('image/png')
    const url = dataURL.replace(/^data:image\/png/, 'data:application/octet-stream')
    downloadLink.setAttribute('download', 'tileset.png')
    downloadLink.setAttribute('href', url)
    downloadLink.click()
}

export const uploadImage = (file: Blob): Promise<{ blob: Blob; width: number; height: number }> =>
    new Promise((resolve, reject) => {
        const img = new window.Image()
        const imageReader = new FileReader()

        imageReader.readAsDataURL(file)
        imageReader.onload = async ev => {
            if (ev.target) {
                const { result } = ev.target
                if (result) {
                    const { w: width, h: height } = await getImageDimensions(result)
                    imageElement.width = width
                    imageElement.height = height
                    img.src = result as string
                    img.onload = () => {
                        ctx.clearRect(0, 0, imageElement.width, imageElement.height)
                        ctx.drawImage(img, 0, 0)
                        imageElement.toBlob((blob: Blob) => resolve({ blob, width, height }), 'image/png')
                    }
                }
            } else reject()
        }
    })
