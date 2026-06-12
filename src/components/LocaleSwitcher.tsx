// Locale switcher refs:
// - Paraglide docs: https://inlang.com/m/gerre34r/library-inlang-paraglideJs
// - Router example: https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#switching-locale
import { getLocale, locales, setLocale } from '#/paraglide/runtime'
import { m } from '#/paraglide/messages'

export default function ParaglideLocaleSwitcher() {
  const currentLocale = getLocale()

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        color: 'inherit',
      }}
      aria-label={m.language_label()}
    >
      <span style={{ opacity: 0.85 }} className="hidden md:inline">
        {m.current_locale({ locale: currentLocale })}
      </span>
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {locales.map((locale) => (
          <button
            type="button"
            key={locale}
            onClick={() => setLocale(locale)}
            aria-pressed={locale === currentLocale}
            className={`
              cursor-pointer
              px-3 py-[0.35rem]
              rounded-full
              border border-[#d1d5db]
              tracking-[0.01em]
              transition-colors
              ${
                locale === currentLocale
                  ? 'bg-slate-900 text-slate-50 font-bold'
                  : 'bg-transparent text-inherit font-medium'
              }
            `}
          >
            {locale.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
