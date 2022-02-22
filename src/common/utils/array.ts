import { StringTMap } from 'common/types'

export const { isArray } = Array

export function isValidArray(array: any[]): boolean {
    return isArray(array) && array.length > 0
}

export function changeItemPosition(array: any[], from: number, to: number): any[] {
    ;[array[from], array[to]] = [array[to], array[from]]
    return array
}

export function addOrRemoveItem<T>(array = [], element: T): any[] {
    const arr: any[] = [].concat(array)

    if (arr.includes(element)) {
        arr.splice(arr.indexOf(element), 1)
        return arr.sort()
    }

    arr.push(element)
    return arr.sort()
}

export function removeItem<T>(array = [], element: T): any[] {
    const arr: any[] = [].concat(array)

    if (arr.includes(element)) {
        arr.splice(arr.indexOf(element), 1)
        return arr.sort()
    }

    return arr.sort()
}

export function convertArrayToObject<T>(array: any[], key: string): StringTMap<T> {
    const initialValue = {}
    return array.reduce(
        (obj, item) => ({
            ...obj,
            [item[key]]: item
        }),
        initialValue
    )
}

export function spliceIntoChunks<T>(arr: T[], chunkSize = 1): T[][] {
    const res: any[] = []
    while (arr.length > 0) {
        const chunk = arr.splice(0, chunkSize)
        res.push(chunk)
    }
    return res
}
