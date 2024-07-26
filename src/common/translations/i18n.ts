import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import { TRANSLATIONS_PL } from './pl/translations'
import { TRANSLATIONS_EN } from './en/translations'

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        },
        lng: 'en',
        resources: {
            en: {
                translation: TRANSLATIONS_EN
            },
            pl: {
                translation: TRANSLATIONS_PL
            }
        }
    })
export default i18n
// i18n.changeLanguage('en')
