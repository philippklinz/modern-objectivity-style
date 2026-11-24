#!/usr/bin/env python3
"""Author-side source extraction and static language-pack generation.

The checked-in site runs without Python, Node or a server build.

Author workflow (Node 24+, dependencies in tools/package.json and requirements.txt):
1. Edit the English live HTML, public Markdown, or i18n/dynamic-en.json.
2. Run `python3 tools/build-site-i18n.py extract`. Review the source diff;
   i18n/source/keys.json retains identifiers across text edits and rearrangements.
3. Reconcile only affected entries in i18n/translations/<language>.json.
4. Run `node tools/check-site-i18n.cjs --authoring-only` and review the text.
5. `node tools/check-site-i18n.cjs --source-revisions` prints module fingerprints.
   Record the appropriate values in each reconciled <language>.revisions.json;
   neither extraction nor generation stamps translations current automatically.
6. Run `python3 tools/build-site-i18n.py build`, then the catalogue and browser
   checks in .github/workflows/i18n-checks.yml. Commit source and generated files.
The --locale option is for intermediate authoring checks, not complete releases.
"""
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
from copy import deepcopy
import argparse, hashlib, html as escape, json, os, re, subprocess
from lxml import html, etree

ROOT = Path(__file__).resolve().parents[1]
I18N = ROOT / 'i18n'
LANGS = ['bg','hr','cs','da','nl','en','et','fi','fr','de','el','hu','ga','it','lv','lt','mt','pl','pt','ro','sk','sl','es','sv']
LIVE = ['index.html','examples/lab-console.html','examples/experiment.html','starter/index.html']
SKIP = {'script','style','pre','code','textarea','template','noscript'}
INLINE = {'a','strong','em','span','small','b','i','u','s','sub','sup','kbd','abbr','br','code','mark'}
BLOCKS = {'title','h1','h2','h3','h4','h5','h6','p','li','dt','dd','th','td','a','button','option','label','legend','summary','figcaption','text','span','small','strong','div','footer'}
DYNAMIC_IDS = {'load-number','load-status','table-count','table-empty','record-body','record-summary','count','latest','average','alert-count','inspect','empty-records','log','run-state','state-value','toggle-play','single-step','time-value','position-value','y-value','amp-value','freq-value','phase-value','speed-value','probe-value','table-body','empty','result-count','state','latest-value','sample-count','count-value','last-value','status','chart-status'}

def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',',':')).encode()).hexdigest()

def module_id(path):
    return re.sub(r'[^a-z0-9]+','-',str(path).removesuffix('.html').lower()).strip('-')

def local_ref(page, destination):
    return os.path.relpath(ROOT / destination, (ROOT / page).parent).replace(os.sep,'/')

def markdown_pages():
    paths = [p for p in sorted(ROOT.rglob('*.md')) if p.relative_to(ROOT).parts[0]!='i18n' and not any(x in p.relative_to(ROOT).parts for x in ['.git','.github','node_modules'])]
    source = {str(p.relative_to(ROOT)): p.read_text() for p in paths}
    marked = ROOT/'tools/node_modules/marked/lib/marked.esm.js'
    if not marked.exists():
        marked = Path(os.environ.get('CODEX_PRIMARY_RUNTIME_NODE_MODULES','/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules'))/'marked/lib/marked.esm.js'
    script = "const fs=require('node:fs'); const {marked}=require(process.argv[1]); const d=JSON.parse(fs.readFileSync(0,'utf8')); process.stdout.write(JSON.stringify(Object.fromEntries(Object.entries(d).map(([k,v])=>[k,marked.parse(v)]))));"
    rendered = json.loads(subprocess.check_output(['node','-e',script,str(marked)], input=json.dumps(source).encode()))
    result=[]
    for name, body in rendered.items():
        path = str(Path(name).with_suffix('.html'))
        # Existing app entry points win over similarly named source readmes.
        title = re.search(r'^#\s+(.+)',source[name],re.M)
        title = title.group(1) if title else Path(name).stem
        text = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape.escape(title)} / Modern Objectivity</title>
<link rel="stylesheet" href="{local_ref(path,'starter/modern-objectivity.css' if path.startswith('starter/') else 'patterns/i18n/modern-objectivity.css' if path.startswith('patterns/i18n/') else 'styles/modern-objectivity.css')}"></head>
<body><main class="mo-handbook"><header class="mo-handbook-nav"><a href="{local_ref(path,'index.html')}">Modern Objectivity / Style kit</a><a href="{local_ref(path,'README.html')}">Handbook contents</a></header>
<article>{body}</article><footer class="mo-handbook-footer"><a href="{local_ref(path,'README.html')}">Handbook contents</a><a href="https://github.com/philippklinz/modern-objectivity-style/blob/main/{name}">English authoring source</a><span>GPL-2.0-only</span></footer></main></body></html>'''
        (ROOT/path).write_text(text)
        result.append(path)
    return result

def rich(element):
    slots=[]
    def inner(node):
        out=escape.escape(node.text or '',quote=False)
        for child in node:
            if not isinstance(child.tag,str): continue
            index=len(slots)
            protected=child.tag in {'code','kbd'} or child.get('translate')=='no'
            slot={'tag':child.tag,'attrs':dict(child.attrib)}
            if protected: slot['literal']=''.join(child.itertext())
            slots.append(slot)
            out+=f'<s{index}>'+('' if protected else inner(child))+f'</s{index}>'
            out+=escape.escape(child.tail or '',quote=False)
        return out
    text=inner(element).strip()
    return (text if slots else ''.join(element.itertext()).strip()),slots

def meaningful(text):
    return bool(re.search(r'[A-Za-z]{2}',text)) and text not in {'MODERN','OBJECTIVITY','GPL-2.0-only','CSV','HTML','CSS','JavaScript'}

def extract():
    docs=markdown_pages()
    pages=LIVE+docs
    keyfile=I18N/'source/keys.json'
    old=json.loads(keyfile.read_text()) if keyfile.exists() else {}
    messages=json.loads((I18N/'dynamic-en.json').read_text())
    messages.update({
      'site.language':'Language',
      'site.loading':'Loading language…',
      'site.selected':'Language: {language}.',
      'site.fallback':'This language edition is unavailable or out of date. Showing {language}; your current inputs are preserved.',
      'site.sourceNotice':'English source content is shown until JavaScript loads the selected language.',
      'site.review':'AI-assisted translation; independent language review pending.',
      'site.english':'English source edition',
    })
    common=list(messages)
    manifests={}; newmap={}
    for page in pages:
        tree=html.document_fromstring((ROOT/page).read_text())
        for element in tree.xpath('//pre|//code'):
            element.set('translate','no'); element.set('lang','en')
        if page=='docs/10-multilingual-access.html':
            for row in tree.xpath('//tr'):
                cells=row.findall('td')
                if len(cells)==3 and ''.join(cells[2].itertext()).strip() in LANGS:
                    cells[1].set('translate','no');cells[1].set('lang',''.join(cells[2].itertext()).strip())
        # Strip our previous annotations; recover stable keys from the source map.
        for element in tree.iter():
            for attr in list(element.attrib):
                if attr.startswith('data-mo-key') or attr.startswith('data-mo-attr-'): del element.attrib[attr]
        for element in tree.xpath('//*[@data-mo-generated]'):
            element.getparent().remove(element)
        for anchor in tree.xpath('//a[@href]'):
            href=anchor.get('href'); url=urlsplit(href)
            if not url.scheme and not url.netloc and url.path.endswith('.md'):
                target=(ROOT/page).parent/url.path
                if target.with_suffix('.html').exists(): anchor.set('href',urlunsplit(('', '',url.path[:-3]+'.html',url.query,url.fragment)))
        candidates=[]
        def visit(element, locator):
            if not isinstance(element.tag,str) or element.tag in SKIP or element.get('translate')=='no': return
            for attr in ['aria-label','placeholder','title']+(['value'] if element.tag=='input' and element.get('type','text')=='text' else []):
                value=element.get(attr)
                if value and meaningful(value): candidates.append({'element':element,'attribute':attr,'source':value,'slots':[],'locator':locator+'@'+attr})
            if element.tag=='meta' and element.get('name')=='description':
                candidates.append({'element':element,'attribute':'content','source':element.get('content'),'slots':[],'locator':locator+'@content'})
            if element.get('id') in DYNAMIC_IDS or 'data-theme-toggle' in element.attrib: return
            children=[n for n in element.iterdescendants() if isinstance(n.tag,str)]
            eligible=element.tag in BLOCKS and all(n.tag in INLINE and n.get('id') not in DYNAMIC_IDS for n in children)
            if eligible:
                text,slots=rich(element)
                if meaningful(text):
                    candidates.append({'element':element,'attribute':None,'source':text,'slots':slots,'locator':locator})
                    return
            # Text directly in a mixed container must remain independently translatable.
            if meaningful((element.text or '').strip()):
                span=html.Element('span'); span.text=element.text; element.text=None; element.insert(0,span)
            for child in list(element):
                if meaningful((child.tail or '').strip()):
                    span=html.Element('span'); span.text=child.tail; child.tail=None; child.addnext(span)
            for index,child in enumerate(list(element)):
                visit(child,locator+'/'+str(child.tag)+f'[{index}]')
        visit(tree,'html')
        module=module_id(page)
        previous=old.get(module,{'next':1,'entries':[]})
        used=set(); assignments={}
        # Match unchanged content before using positions for edited messages.
        for index,candidate in enumerate(candidates):
            matches=[item for item in previous['entries'] if item['key'] not in used and item['source']==candidate['source'] and item.get('attribute')==candidate['attribute']]
            match=next((item for item in matches if item['locator']==candidate['locator']),matches[0] if matches else None)
            if match: assignments[index]=match['key']; used.add(match['key'])
        counter=previous['next']; entries=[]; bindings={}; keys=[]
        for index,candidate in enumerate(candidates):
            key=assignments.get(index)
            if not key:
                match=next((item for item in previous['entries'] if item['key'] not in used and item['locator']==candidate['locator'] and item.get('attribute')==candidate['attribute']),None)
                if match: key=match['key']
                else: key=f'{module}.msg{counter:04d}'; counter+=1
            used.add(key); keys.append(key); messages[key]=candidate['source']
            marker='data-mo-attr-'+candidate['attribute'] if candidate['attribute'] else 'data-mo-key'
            candidate['element'].set(marker,key)
            bindings[key]={'slots':candidate['slots']}
            entries.append({k:candidate[k] for k in ['locator','source','attribute']}|{'key':key})
        newmap[module]={'next':counter,'entries':entries}
        tree.set('lang','en'); tree.set('data-mo-page',module)
        head=tree.find('head')
        # The starter is independently copyable; its own assets are compiled below.
        assetroot='starter/i18n' if page.startswith('starter/') else 'patterns/i18n/site' if page.startswith('patterns/i18n/') else 'i18n'
        assetdir=f'{assetroot}/pages/{module}'
        core=assetroot+'/core.js'
        runtime=assetroot+'/runtime.js'
        css=assetroot+'/site.css'
        link=html.Element('link',rel='stylesheet',href=local_ref(page,css)); link.set('data-mo-generated','style'); head.append(link)
        for src in [core,assetdir+'/source.js',runtime]:
            script=html.Element('script',src=local_ref(page,src)); script.set('data-mo-generated','runtime'); head.insert(0,script)
        # Insertion at position zero reverses order, so put the three scripts in order.
        scripts=head.xpath('script[@data-mo-generated]')
        for script in scripts: head.remove(script)
        for index,src in enumerate([core,assetdir+'/source.js',runtime]):
            script=html.Element('script',src=local_ref(page,src)); script.set('data-mo-generated','runtime'); head.insert(index+3,script)
        rendered='<!doctype html>\n'+html.tostring(tree,encoding='unicode',method='html')+'\n'
        (ROOT/page).write_text(rendered)
        manifests[module]={'page':page,'assetdir':assetdir,'keys':common+keys,'bindings':bindings}
    # The independent pattern retains its own helper, full-page catalogue and model.
    pattern=html.document_fromstring((ROOT/'patterns/i18n/index.html').read_text())
    sourcepack=read_script_pack(ROOT/'patterns/i18n/locales/en.js')
    sample={key:value for key,value in sourcepack['messages'].items() if not key.startswith('chrome.')}
    for key,value in sample.items(): messages['pattern.'+key]=value
    patternkeys=['pattern.'+key for key in sample]
    for element in pattern.xpath('//*[@data-i18n]'):
        key=element.get('data-i18n')
        if key.startswith('chrome.'): element.attrib.pop('data-i18n')
    for anchor in pattern.xpath('//a[@href]'):
        href=anchor.get('href')
        if href.endswith('.md'): anchor.set('href',href[:-3]+'.html')
    # Outer source copy has no rich prose; preserve all controls inside the panel.
    title=pattern.xpath('//h1')[0]; title.text='One model. Twenty-four languages.'
    for child in list(title): title.remove(child)
    targets=pattern.xpath('//header//a|//header//span|//main/span|//h1|//main/p|//div[contains(@class,"pattern-notes")]//h3|//div[contains(@class,"pattern-notes")]//p|//div[contains(@class,"pattern-notes")]//a|//footer/a|//title|//noscript/p')
    for index,element in enumerate(targets):
        key=f'chrome.text{index+1:03d}'; element.set('data-i18n',key)
        messages['pattern.'+key]=''.join(element.itertext()).strip(); patternkeys.append('pattern.'+key)
    meta=pattern.xpath('//meta[@name="description"]')[0]
    messages['pattern.chrome.description']=meta.get('content'); patternkeys.append('pattern.chrome.description')
    (ROOT/'patterns/i18n/index.html').write_text('<!doctype html>\n'+html.tostring(pattern,encoding='unicode',method='html')+'\n')
    manifests['pattern']={'page':'patterns/i18n/index.html','keys':patternkeys,'bindings':{},'assetdir':'patterns/i18n/locales'}
    write_json(I18N/'source/en.json',messages)
    write_json(I18N/'source/pages.json',manifests)
    write_json(keyfile,newmap)
    print(f'Extracted {len(messages)} messages across {len(manifests)} complete pages.')

def read_script_pack(path):
    text=path.read_text(); start=text.index(' = ')+3
    return json.loads(text[start:].strip().removesuffix(';'))

def build(locales=None):
    messages=json.loads((I18N/'source/en.json').read_text())
    pages=json.loads((I18N/'source/pages.json').read_text())
    languages_script=(ROOT/'patterns/i18n/languages.js').read_text()
    for locale in locales or LANGS:
        translated=messages if locale=='en' else json.loads((I18N/f'translations/{locale}.json').read_text())
        revisions={} if locale=='en' else json.loads((I18N/f'translations/{locale}.revisions.json').read_text())
        if set(translated)!=set(messages): raise ValueError(f'{locale}: missing/extra keys')
        for module,info in pages.items():
            source={key:messages[key] for key in info['keys']}
            target={key:translated[key] for key in info['keys']}
            if module=='pattern':
                source={key.removeprefix('pattern.'):value for key,value in source.items()}
                target={key.removeprefix('pattern.'):value for key,value in target.items()}
            if locale!='en' and revisions.get(module)!=digest(source): raise ValueError(f'{locale}/{module}: translation source revision missing or stale')
            pack={'status':'example' if module=='pattern' else 'available','sourceRevision':digest(source),'review':'English authoring source' if locale=='en' else 'AI-assisted translation; independent language review pending','messages':target}
            destination=ROOT/info['assetdir']
            destination.mkdir(parents=True,exist_ok=True)
            filename=destination/(locale+'.js')
            filename.write_text('/* Generated local catalogue. GPL-2.0-only. */\nglobalThis.MOCatalogues ??= Object.create(null);\nglobalThis.MOCatalogues.'+locale+' = '+json.dumps(pack,ensure_ascii=False,separators=(',',':'))+';\n')
            if locale=='en' and module!='pattern':
                data={'module':module,'catalogueBase':local_ref(info['page'],info['assetdir'])+'/','bindings':info['bindings']}
                (destination/'source.js').write_text(languages_script+'\n'+filename.read_text()+'\nglobalThis.MO_PAGE_DATA = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
    (I18N/'core.js').write_bytes((ROOT/'patterns/i18n/i18n.js').read_bytes())
    for base in ['starter/i18n','patterns/i18n/site']:
        for name in ['core.js','runtime.js','site.css']:
            (ROOT/base).mkdir(parents=True,exist_ok=True)
            (ROOT/base/name).write_bytes((I18N/name).read_bytes())
    print(f'Built {len(pages)} pages × {len(locales or LANGS)} local catalogues; no runtime build required.')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('action',choices=['extract','build']);parser.add_argument('--locale',choices=LANGS);args=parser.parse_args()
    os.chdir(ROOT)
    extract() if args.action=='extract' else build([args.locale] if args.locale else None)
