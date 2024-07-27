import { AppDispatch, AppStore, RootState } from './../stores/store'
import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from 'react-redux'

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppStore = useStore.withTypes<AppStore>()
