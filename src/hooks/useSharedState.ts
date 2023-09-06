import { useState, useEffect } from 'react'

export function createSharedStateHook(initialValue: boolean) {
    let sharedValue = initialValue

    const stateSetters: ((v: boolean) => void)[] = []

    function setAllStates(value: boolean) {
        sharedValue = value
        stateSetters.forEach(set => {
            set(value)
        })
    }

    return function useSharedState(): [boolean, (v: boolean) => void] {
        const [state, setState] = useState(sharedValue)

        useEffect(() => {
            const length = stateSetters.push(setState)
            const index = length - 1
            return () => {
                stateSetters.splice(index, 1)
            }
        }, [setState])

        return [state, setAllStates]
    }
}
