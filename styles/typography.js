/* Local typography experiment. GPL-2.0-only. No remote requests or preload calls. */
(() => {
  'use strict';
  const assetRoot = new URL('fonts/liberation/', document.currentScript.src);
  const manifest = window.MOFontManifest;
  const family = document.getElementById('font-family');
  const face = document.getElementById('font-face');
  const language = document.getElementById('font-language');
  const size = document.getElementById('font-size');
  const input = document.getElementById('font-text');
  const preview = document.getElementById('font-preview');
  const rows = document.getElementById('font-loading-rows');
  const summary = document.getElementById('font-loading-summary');
  const coverage = document.getElementById('font-coverage');
  const hasAPI = typeof FontFace === 'function' && !!document.fonts;
  const registered = new Map();
  const t = (key, values) => window.MOSite.t('fonts.' + key, values);
  const number = (value, options) => window.MOSite.number(value, options);
  const samples = {
    bg: 'Наблюдението превръща въпросите в знание. 0123456789',
    hr: 'Pažljivo promatranje otkriva nova znanja. Č ć đ š ž.',
    cs: 'Přesné měření přináší nové poznání. Č ď ě ň ř š ť ů ž.',
    da: 'Nysgerrighed åbner nye døre. Æ æ Ø ø Å å.',
    nl: 'Nauwkeurig waarnemen leidt tot nieuwe inzichten. IJ ij é ë.',
    en: 'Observation turns questions into knowledge. 0123456789',
    et: 'Tähelepanelik vaatlus aitab maailma mõista. Õ õ Ä ä Ö ö Ü ü.',
    fi: 'Tarkka havainto auttaa ymmärtämään maailmaa. Ä ä Ö ö Å å.',
    fr: 'L’observation précise ouvre de nouvelles idées. À æ ç é è ê ë œ.',
    de: 'Größe, Maß und Präzision: Überprüfe jede Beobachtung. 0123456789',
    el: 'Η προσεκτική παρατήρηση γεννά νέες γνώσεις. Ά έ ή ί ό ύ ώ.',
    hu: 'A pontos megfigyelés új tudáshoz vezet. Á é í ó ö ő ú ü ű.',
    ga: 'Tagann eolas nua as breathnóireacht chúramach. Á é í ó ú.',
    it: 'L’osservazione attenta apre nuove possibilità. À è é ì ò ù.',
    lv: 'Rūpīgi novērojumi palīdz izprast pasauli. Ā č ē ģ ī ķ ļ ņ š ū ž.',
    lt: 'Atidus stebėjimas padeda pažinti pasaulį. Ą č ę ė į š ų ū ž.',
    mt: 'Osservazzjoni bir-reqqa twassal għal għarfien ġdid. Ċ ċ Ġ ġ Ħ ħ Ż ż.',
    pl: 'Dokładna obserwacja prowadzi do wiedzy. Zażółć gęślą jaźń.',
    pt: 'A observação cuidadosa revela novas relações. Ã ã õ ç á â é ê ó.',
    ro: 'Observația atentă deschide noi întrebări. Ă ă Â â Î î Ș ș Ț ț.',
    sk: 'Presné pozorovanie prináša nové poznatky. Ä č ď ľ ĺ ň ô ŕ š ť ž.',
    sl: 'Natančno opazovanje vodi do novega znanja. Č č Š š Ž ž.',
    es: 'La observación cuidadosa abre nuevas preguntas. ¿Qué? ¡Sí! Ñ ñ á é í ó ú ü.',
    sv: 'Noggranna observationer väcker nya frågor. Å å Ä ä Ö ö.',
    math: 'Δx = 0.25 · ∑ x ≈ √2 · x ≤ 10 · ∞'
  };
  const descriptors = {
    Regular: {weight: '400', style: 'normal'},
    Italic: {weight: '400', style: 'italic'},
    Bold: {weight: '700', style: 'normal'},
    BoldItalic: {weight: '700', style: 'italic'}
  };
  for (const item of MOLanguages) {
    const option = new Option(item.name, item.code);
    option.lang = item.code;
    language.append(option);
  }
  language.append(new Option(t('math'), 'math'));
  language.value = 'en';

  // Separate face names isolate the specimen from fonts used by the page UI.
  // Registering a URL-backed face does not explicitly load it. Layout requests
  // matching faces when the specimen uses their characters, weight and style.
  if (hasAPI) {
    for (const file of manifest.files) {
      // A separate URL keeps UI font requests out of the specimen's loading state.
      const url = new URL(file.file, assetRoot);
      url.searchParams.set('specimen', manifest.commit.slice(0, 12));
      const definition = new FontFace('MO Specimen ' + file.family,
        `url("${url.href}") format("woff2")`,
        {...descriptors[file.face], unicodeRange: file.unicodeRange, display: 'swap'});
      document.fonts.add(definition);
      registered.set(file.file, definition);
    }
  }
  const selectedFiles = () => manifest.files.filter(file => file.family === family.value && file.face === face.value);
  const printable = () => [...new Set(Array.from(input.value).filter(char => !/\s/.test(char)).map(char => char.codePointAt(0)))];
  const contains = (file, cp) => file.coverage.some(([start, end]) => cp >= start && cp <= end);
  function report() {
    const files = selectedFiles(), points = printable();
    let loaded = 0, bytes = 0;
    const fragment = document.createDocumentFragment();
    for (const file of files) {
      const state = registered.get(file.file)?.status || 'unloaded';
      if (state === 'loaded') { loaded++; bytes += file.bytes; }
      const row = document.createElement('tr');
      row.dataset.subset = file.subset;
      const subset = document.createElement('td');
      const label = document.createElement('strong'); label.textContent = file.subset;
      const filename = document.createElement('code'); filename.textContent = file.file;
      subset.append(label, filename);
      const used = document.createElement('td'); used.textContent = t(points.some(cp => contains(file, cp)) ? 'used' : 'unused');
      const amount = document.createElement('td'); amount.className = 'mo-num';
      amount.textContent = number(file.bytes / 1024, {minimumFractionDigits: 1, maximumFractionDigits: 1}) + ' KiB';
      const status = document.createElement('td'), badge = document.createElement('span');
      badge.className = 'font-face-status'; badge.dataset.state = hasAPI ? state : 'error';
      badge.textContent = t(hasAPI ? state : 'error'); status.append(badge);
      row.append(subset, used, amount, status); fragment.append(row);
    }
    rows.replaceChildren(fragment);
    summary.textContent = hasAPI ? t('summary', {loaded: number(loaded), total: number(files.length), size: number(bytes / 1024, {maximumFractionDigits: 1})}) : t('noApi');
    const missing = points.filter(cp => !files.some(file => contains(file, cp)));
    coverage.dataset.fallback = String(missing.length > 0);
    coverage.textContent = !points.length ? t('empty') : missing.length ? t('fallback', {
      characters: missing.slice(0, 24).map(cp => `${String.fromCodePoint(cp)} (U+${cp.toString(16).toUpperCase().padStart(4, '0')})`).join(' · ') + (missing.length > 24 ? ' …' : '')
    }) : t('covered');
  }
  function update() {
    const definition = descriptors[face.value];
    preview.style.fontFamily = hasAPI ? `"MO Specimen ${family.value}", ${manifest.families[family.value].fallback}` : `"${manifest.families[family.value].name}", ${manifest.families[family.value].fallback}`;
    preview.style.fontWeight = definition.weight;
    preview.style.fontStyle = definition.style;
    preview.style.fontSize = size.value + 'px';
    preview.lang = language.value === 'math' ? 'und' : language.value;
    input.lang = preview.lang;
    preview.textContent = input.value;
    document.getElementById('font-size-value').textContent = number(Number(size.value)) + ' px';
    report();
    requestAnimationFrame(() => { if (hasAPI) document.fonts.ready.then(report); });
  }
  for (const control of [family, face]) control.addEventListener('change', update);
  size.addEventListener('input', update);
  input.addEventListener('input', update);
  language.addEventListener('change', () => { input.value = samples[language.value]; update(); });
  if (hasAPI) for (const event of ['loading', 'loadingdone', 'loadingerror']) document.fonts.addEventListener(event, report);
  window.addEventListener('mo:language', () => {
    language.querySelector('option[value="math"]').textContent = t('math');
    update();
  });
  update();
})();
