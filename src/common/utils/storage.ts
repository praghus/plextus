import localforage from 'localforage'

export const clearCache = localforage.clear

export const setCacheItem = (key: string, data: Record<string, unknown>): Promise<Record<string, unknown>> =>
    localforage.setItem(key, data)

export const setCacheBlob = (key: string, blob: Blob | string, type: string): Promise<Blob> =>
    localforage.setItem(key, new Blob([blob], { type }))

export const getCacheItem = (key: string): Promise<null> => localforage.getItem(key)
