/* Modern Objectivity: the 24 EU language targets. GPL-2.0-only. */
globalThis.MOLanguages = Object.freeze([
  ['bg', 'Български'], ['hr', 'Hrvatski'], ['cs', 'Čeština'],
  ['da', 'Dansk'], ['nl', 'Nederlands'], ['en', 'English'],
  ['et', 'Eesti'], ['fi', 'Suomi'], ['fr', 'Français'],
  ['de', 'Deutsch'], ['el', 'Ελληνικά'], ['hu', 'Magyar'],
  ['ga', 'Gaeilge'], ['it', 'Italiano'], ['lv', 'Latviešu'],
  ['lt', 'Lietuvių'], ['mt', 'Malti'], ['pl', 'Polski'],
  ['pt', 'Português'], ['ro', 'Română'], ['sk', 'Slovenčina'],
  ['sl', 'Slovenščina'], ['es', 'Español'], ['sv', 'Svenska']
].map(([code, name]) => Object.freeze({
  code, name, formatLocale: code === 'pt' ? 'pt-PT' : code === 'en' ? 'en-GB' : code
})));
