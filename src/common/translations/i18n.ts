import { use, changeLanguage } from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import { TRANSLATIONS_PL } from './pl/translations'
import { TRANSLATIONS_EN } from './en/translations'

use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: TRANSLATIONS_EN
            },
            pl: {
                translation: TRANSLATIONS_PL
            }
        }
    })

changeLanguage('en')
