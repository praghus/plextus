export const HISTORY_RESOURCE_NAME = 'history'
export const HISTORY_ADD = `${HISTORY_RESOURCE_NAME}/ADD`
export const HISTORY_CLEAR = `${HISTORY_RESOURCE_NAME}/CLEAR`
export const HISTORY_UNDO = `${HISTORY_RESOURCE_NAME}/UNDO`
export const HISTORY_REDO = `${HISTORY_RESOURCE_NAME}/REDO`

export const HISTORY_LIMIT = 100

export const INITIAL_STATE = {
    redo: [],
    undo: []
}
