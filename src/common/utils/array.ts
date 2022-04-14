export const { isArray } = Array

export function changeItemPosition<T>(array: T[], from: number, to: number): T[] {
    ;[array[from], array[to]] = [array[to], array[from]]
    return array
}

export function addOrRemoveItem<T>(array = [], element: T): T[] {
    const arr: T[] = [].concat(array)

    if (arr.includes(element)) {
        arr.splice(arr.indexOf(element), 1)
        return arr.sort()
    }

    arr.push(element)
    return arr.sort()
}

export function removeItem<T>(array = [], element: T): T[] {
    const arr: T[] = [].concat(array)

    if (arr.includes(element)) {
        arr.splice(arr.indexOf(element), 1)
        return arr.sort()
    }

    return arr.sort()
}

export function spliceIntoChunks<T>(arr: T[], chunkSize = 1): T[][] {
    const res: T[][] = []
    while (arr.length > 0) {
        const chunk = arr.splice(0, chunkSize)
        res.push(chunk)
    }
    return res
}
