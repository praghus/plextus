export const getImageDimensions = (file: any): Promise<{ w: number; h: number }> =>
    new Promise((resolve, reject) => {
        const i = new Image()
        i.src = file
        i.onload = () => resolve({ w: i.width, h: i.height })
        i.onerror = reject
    })
