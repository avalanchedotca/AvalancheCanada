import React, {
    createContext,
    useState,
    useEffect,
    useMemo,
    useContext,
} from 'react'
import { IntlProvider } from 'react-intl'
import { useLocalStorage } from 'hooks'
import { loadMessages } from 'services/intl'
import LOCALE from 'constants/locale'

const LocaleContext = createContext()

export function useLocale() {
    return useContext(LocaleContext)
}

export function useLocaleCode(short = false) {
    const { locale } = useLocale()

    return short ? locale.substr(0, 2) : locale
}

export function Provider({
    children,
    defaultLocale = navigator.language || LOCALE,
}) {
    const [locale, set] = useLocalStorage('locale', defaultLocale)
    const context = useMemo(() => ({ locale, set }), [locale])
    const [messages, setMessages] = useState(null)

    useEffect(() => {
        loadMessages(locale).then(setMessages)
    }, [locale])

    return (
        <LocaleContext.Provider value={context}>
            {messages && (
                <IntlProvider
                    key={locale}
                    locale={locale}
                    messages={messages}
                    defaultLocale={LOCALE}>
                    {children}
                </IntlProvider>
            )}
        </LocaleContext.Provider>
    )
}
