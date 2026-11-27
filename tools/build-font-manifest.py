#!/usr/bin/env python3
"""Author-side font inventory. Needs fontTools with Brotli support; no runtime build.

Run after copying an inspected LiberationFontsWeb revision to styles/fonts/liberation:
    python3 tools/build-font-manifest.py <upstream-commit>
Copies the exact font bundle into the two standalone distributions.
"""
import hashlib
import json
import re
import shutil
import sys
from pathlib import Path
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / 'styles/fonts/liberation'
FAMILIES = {
    'Sans': {'name': 'Liberation Sans Web', 'fallback': 'sans-serif'},
    'Serif': {'name': 'Liberation Serif Web', 'fallback': 'serif'},
    'Mono': {'name': 'Liberation Mono Web', 'fallback': 'monospace'},
    'SansNarrow': {'name': 'Liberation Sans Narrow Web', 'fallback': 'sans-serif'}
}

def intervals(points):
    result = []
    for cp in sorted(points):
        if result and cp == result[-1][1] + 1:
            result[-1][1] = cp
        else:
            result.append([cp, cp])
    return result

def main(commit):
    if not re.fullmatch(r'[0-9a-f]{40}', commit):
        raise ValueError('Pass the full inspected upstream commit SHA')
    descriptors = {}
    for css in FONTS.glob('*.css'):
        for body in re.findall(r'@font-face\s*\{([^}]+)\}', css.read_text()):
            file = re.search(r"url\(['\"]?([^)'\"]+)", body).group(1)
            descriptors[file] = re.search(r'unicode-range:([^;}]+)', body).group(1)
    files = []
    for file in sorted(FONTS.glob('*.woff2')):
        match = re.fullmatch(r'Liberation(.+)Web-(Regular|Italic|Bold|BoldItalic)\.(.+)\.woff2', file.name)
        family, face, subset = match.groups()
        with TTFont(file) as font:
            coverage = intervals(font.getBestCmap())
        files.append({'file': file.name, 'family': family, 'face': face, 'subset': subset,
                      'bytes': file.stat().st_size, 'sha256': hashlib.sha256(file.read_bytes()).hexdigest(),
                      'unicodeRange': descriptors[file.name], 'coverage': coverage})
    provenance = {
        'repository': 'https://github.com/philippklinz/LiberationFontsWeb',
        'commit': commit,
        'fontFilesUnmodified': True,
        'fontBytes': sum(file['bytes'] for file in files),
        'files': {p.name: {'bytes': p.stat().st_size, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}
                  for p in sorted(FONTS.iterdir()) if p.suffix in {'.woff2', '.css'} or p.name in {'LICENSE', 'AUTHORS'}},
        'additionalNotices': {
            'LICENSE-Sans-Narrow.txt': 'https://github.com/liberationfonts/liberation-sans-narrow/blob/main/License.txt',
            'COPYING-Sans-Narrow': 'https://github.com/liberationfonts/liberation-sans-narrow/blob/main/COPYING'
        }
    }
    (FONTS / 'PROVENANCE.json').write_text(json.dumps(provenance, indent=2) + '\n')
    manifest = {'source': provenance['repository'], 'commit': commit, 'families': FAMILIES, 'files': files}
    (ROOT / 'styles/fonts/manifest.js').write_text('/* Generated from the bundled WOFF2 character maps. */\nglobalThis.MOFontManifest = ' + json.dumps(manifest, separators=(',', ':')) + ';\n')
    for destination in ['starter/fonts/liberation', 'patterns/i18n/fonts/liberation']:
        shutil.copytree(FONTS, ROOT / destination, dirs_exist_ok=True)
    print(f'Inventoried {len(files)} WOFF2 files, {provenance["fontBytes"]} bytes, four families.')

if __name__ == '__main__':
    main(sys.argv[1])
