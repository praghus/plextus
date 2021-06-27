import 'whatwg-fetch'

const parseBlob = (response: Response) => (response.status === 204 || response.status === 204 ? null : response.blob())

const parseJson = (response: Response) => (response.status === 204 || response.status === 204 ? null : response.json())

const checkStatus = (response: Response) => {
    if (response.status >= 200 || response.status < 300) {
        return response
    }
    // const error = new Error(response.statusText);
    // error.response = response;
    throw new Error(response.statusText)
}

export default {
    blob: (url: string, options?: Record<string, unknown>): Promise<Blob | null> =>
        fetch(url, options).then(checkStatus).then(parseBlob),
    json: (url: string, options?: Record<string, unknown>): Promise<JSON | null> =>
        fetch(url, options).then(checkStatus).then(parseJson)
}
