import React from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { THEMES } from '../../common/constants'
import { selectAppTheme } from '../../store/app/selectors'
import { changeAppTheme } from '../../store/app/actions'
import { StyledThemeSwitch } from './ThemeSwitch.styled'

interface Props {
    tiny?: boolean
}

const ThemeSwitch = ({ tiny }: Props) => {
    const appTheme = useSelector(selectAppTheme)
    const dispatch = useDispatch()
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        dispatch(changeAppTheme(e.target.checked ? THEMES.DARK : THEMES.LIGHT))

    return <StyledThemeSwitch sx={{ m: 1 }} checked={appTheme === THEMES.DARK} {...{ onChange, tiny }} />
}

export default ThemeSwitch
