import Backend from './lib/i18next-http-backend/index.js'

export function initI18n() {

  if (!window.listLocales || !i18next) {
    setTimeout(initI18n, 100);
    return;
  }
  i18next
    .use(Backend)
    .init({
      lng: window.getLocale() || 'en_US',
      backend: {
        loadPath: (lngs, namespaces) => `/assets/translations/${lngs[0]}.json`,
        requestOptions: {
          mode: 'cors',
          credentials: 'same-origin',
          cache: 'default',
        },
      }
    });
}
initI18n();
