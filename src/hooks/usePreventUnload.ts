import { useEffect, useRef } from 'react'

export const usePreventUnload = (isPristine: boolean) => {
    const eventListenerRef = useRef<(event: BeforeUnloadEvent) => void>()

    useEffect(() => {
        eventListenerRef.current = (event: BeforeUnloadEvent) => {
            if (!isPristine) {
                event.returnValue = 'If you leave this page you will lose your unsaved changes.'
            } else {
                event.preventDefault()
                event.returnValue = ''
            }
        }
    }, [isPristine])

    useEffect(() => {
        const onUnload = (event: BeforeUnloadEvent) => eventListenerRef.current?.(event)
        window.addEventListener('beforeunload', onUnload)
        return () => {
            window.removeEventListener('beforeunload', onUnload)
        }
    }, [])
}
