/**
 * i18n: path-based locale
 * - / or /<base>/ = English
 * - /ar or /<base>/ar = Arabic (RTL)
 * - /pl or /<base>/pl = Polish
 * Set <meta name="app-base-path" content="/your-subpath"> if deployed under a subpath.
 */
(function () {
  const pathname = window.location.pathname;

  // Allow backend to set base path explicitly (e.g. when behind reverse proxy or subpath)
  let appBasePath = '';
  const meta = document.querySelector('meta[name="app-base-path"]');
  if (meta && meta.getAttribute('content')) {
    appBasePath = meta.getAttribute('content').replace(/\/$/, '');
  } else {
    // Auto-detect: if path contains /ar or /pl, base is everything before it
    const localeMatch = pathname.match(/^(.*)\/(?:ar|pl)(\/|$)/);
    if (localeMatch) {
      appBasePath = localeMatch[1] || '';
    } else if (pathname !== '/' && pathname !== '') {
      // English page at e.g. /portal/index.html -> base = /portal
      appBasePath = pathname.replace(/\/$/, '').replace(/\/[^/]*$/, '');
    }
  }

  const pathAfterBase = appBasePath ? pathname.slice(appBasePath.length) || '/' : pathname;
  const isAr = pathAfterBase === '/ar' || pathAfterBase.startsWith('/ar/');
  const isPl = pathAfterBase === '/pl' || pathAfterBase.startsWith('/pl/');
  const locale = isAr ? 'ar' : isPl ? 'pl' : 'en';
  const localePrefix = isAr ? appBasePath + '/ar' : isPl ? appBasePath + '/pl' : appBasePath;

  window.getLocale = function () { return locale; };
  window.isRTL = function () { return isAr; };
  window.getBasePath = function () { return appBasePath; };
  window.getLocalePrefix = function () { return localePrefix; };

  const strings = locale === 'ar' ? (window.I18N_AR || {}) : locale === 'pl' ? (window.I18N_PL || {}) : (window.I18N_EN || {});
  window.t = function (key) {
    const val = strings[key];
    return val !== undefined ? val : key;
  };

  function setDocumentDirection() {
    document.documentElement.lang = locale === 'ar' ? 'ar' : locale === 'pl' ? 'pl' : 'en';
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', isAr);
  }

  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      const val = window.t(key);
      if (el.getAttribute('data-i18n-html')) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      if (!el.getAttribute('data-i18n')) {
        const key = el.getAttribute('data-i18n-html');
        el.innerHTML = window.t(key);
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.placeholder = window.t(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.title = window.t(el.getAttribute('data-i18n-title'));
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      el.alt = window.t(el.getAttribute('data-i18n-alt'));
    });
  }

  function fixInternalLinks() {
    if (!isAr && !isPl) return;
    var localeRoot = appBasePath + '/' + locale;
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href) return;
      if (href.startsWith('http') || href.startsWith('mailto:')) return;
      // Logo / hash links: point to locale home so tab switch keeps locale prefix
      if (href.startsWith('#')) {
        if (a.classList.contains('logo') || (a.getAttribute('aria-label') && a.getAttribute('aria-label').indexOf('logo') !== -1)) {
          a.setAttribute('href', localeRoot + href);
        }
        return;
      }
      if (href.indexOf(localeRoot) === 0) return;
      var path = href.startsWith('/') ? href : ('/' + href.replace(/^\.\//, ''));
      if (path.indexOf('/' + locale) !== -1) return;
      var targetPath = (path === '/' || path === '/index.html') ? localeRoot : (localeRoot + path);
      a.setAttribute('href', targetPath);
    });
  }

  function fixFormLinks() {
    if (!isAr && !isPl) return;
    var localeRoot = appBasePath + '/' + locale;
    document.querySelectorAll('form').forEach(function (form) {
      var action = form.getAttribute('action');
      if (action && !action.startsWith('http') && action.indexOf('/' + locale) === -1) {
        form.setAttribute('action', localeRoot + (action.startsWith('/') ? action : '/' + action));
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setDocumentDirection();
      applyI18n();
      fixInternalLinks();
      fixFormLinks();
      if (typeof window.onI18nReady === 'function') window.onI18nReady();
    });
  } else {
    setDocumentDirection();
    applyI18n();
    fixInternalLinks();
    fixFormLinks();
    if (typeof window.onI18nReady === 'function') window.onI18nReady();
  }
})();
