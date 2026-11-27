"""One static navigation model for the guide, examples and handbook."""
from pathlib import Path
import json, os, re
from lxml import html

ROOT = Path(__file__).resolve().parents[1]
MODEL = json.loads((ROOT / 'i18n/navigation.json').read_text())
LABELS = MODEL['labels']
ITEMS = [MODEL['home'], MODEL['directory']] + [item for group in MODEL['groups'] for item in group['items']]
PAGES = [item for item in ITEMS if '#' not in item['href']]

def ref(page, target):
    path, separator, fragment = target.partition('#')
    result = os.path.relpath(ROOT / path, (ROOT / page).parent).replace(os.sep, '/')
    return result + (separator + fragment if separator else '')

def node(tag, text=None, **attrs):
    result = html.Element(tag, **{key.replace('_', '-'): value for key, value in attrs.items()})
    result.text = text
    return result

def label(tag, key, **attrs):
    return node(tag, LABELS[key], data_mo_nav=key, **attrs)

def link(page, item, **attrs):
    anchor = node('a', href=ref(page, item['href']), data_mo_destination=item['href'], **attrs)
    anchor.append(label('span', item['label']))
    return anchor

def remove(element):
    if element.getparent() is not None:
        element.getparent().remove(element)

def directory_page():
    """Publish every destination in one navigable, statically rendered overview."""
    page = MODEL['directory']['href']
    tree = html.document_fromstring('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="styles/modern-objectivity.css"></head><body><div class="mo-shell"><main class="mo-main"><div class="mo-content"></div></main></div></body></html>')
    tree.find('head').append(label('title', 'nav.sitemap', translate='no'))
    content = tree.xpath('//*[@class="mo-content"]')[0]
    content.append(label('h1', 'nav.sitemap', translate='no'))
    grid = node('div', translate='no', **{'class':'mo-directory'})
    for group in MODEL['groups']:
        section = node('section', **{'class':'mo-directory-group'})
        section.append(label('h2', group['label'], id=group['id']))
        listing = node('ul')
        for item in group['items']:
            li = node('li'); li.append(link(page, item)); listing.append(li)
        section.append(listing); grid.append(section)
    content.append(grid)
    (ROOT/page).write_text('<!doctype html>\n'+html.tostring(tree, encoding='unicode')+'\n')

def prepare(tree, page):
    if page == 'patterns/i18n/index.html':
        selector = tree.xpath('//*[@id="language"]')[0]
        if selector.xpath('ancestor::header'):
            tree.xpath('//*[contains(@class,"pattern-demo-head")]')[0].append(selector.getparent())
    # Remove only navigation owned by this generator; the experiment DOM stays intact.
    for part in tree.xpath('//*[@data-mo-site-part]'):
        remove(part)
    for old in tree.xpath('//*[contains(concat(" ", normalize-space(@class), " "), " mo-sidebar ")]|//header[contains(@class,"mo-topbar")]|//header[contains(@class,"mo-handbook-nav")]|//header[contains(@class,"pattern-header")]|//footer'):
        remove(old)
    # Decorative direction glyphs do not distinguish ordinary internal links.
    for anchor in tree.xpath('//a[@href]'):
        for element in anchor.iter():
            if element.text:
                element.text = re.sub(r'^[←→↗]\s*|\s*[←→↗]$', '', element.text)
            if element.tail and element is not anchor:
                element.tail = re.sub(r'^[←→↗]\s*|\s*[←→↗]$', '', element.tail)
    body = tree.find('body')
    shells = body.xpath('./div[contains(concat(" ",normalize-space(@class)," ")," mo-shell ")]')
    if shells:
        shell = shells[0]
        main = shell.find('main')
    else:
        main = body.find('main')
        content = node('div', **{'class': main.get('class', 'mo-content')})
        content.text = main.text
        main.text = None
        for child in list(main):
            content.append(child)
        main.append(content)
        main.set('class', 'mo-main')
        shell = node('div', **{'class': 'mo-shell'})
        body.replace(main, shell)
        shell.append(main)
    shell.set('class', 'mo-shell mo-site-shell')
    tree.set('data-mo-site-page', page)
    if not main.get('id'):
        main.set('id', 'main-content')
    main.set('tabindex', '-1')
    content = main.xpath('./div[contains(@class,"mo-content") or contains(@class,"mo-handbook") or contains(@class,"pattern-wrap")]')[0]
    # Stable heading targets also work without JavaScript and in shared URLs.
    for index, heading in enumerate(content.xpath('.//h2'), 1):
        if not heading.get('id'):
            heading.set('id', 'section-' + str(index))
    for index, region in enumerate(content.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," mo-table-wrap ")]'), 1):
        region.set('tabindex', '0')
        headings = region.xpath('preceding::h3[1]|preceding::h2[1]')
        if headings:
            heading = headings[-1]
            if not heading.get('id'):
                heading.set('id', 'table-heading-' + str(index))
            region.set('role', 'region')
            region.set('aria-labelledby', heading.get('id'))
    return shell, main, content

def decorate(tree, page):
    shell = tree.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," mo-site-shell ")]')[0]
    main = shell.find('main')
    content = main.xpath('./div[contains(@class,"mo-content") or contains(@class,"mo-handbook") or contains(@class,"pattern-wrap")]')[0]
    current = next(item for item in PAGES if item['href'] == page)
    group = next((group for group in MODEL['groups'] if current in group['items']), None)
    assetroot = 'starter/i18n' if page.startswith('starter/') else 'patterns/i18n/site' if page.startswith('patterns/i18n/') else 'i18n'
    head = tree.find('head')
    if page == 'patterns/i18n/index.html':
        head.append(node('link', rel='stylesheet', href=ref(page, assetroot+'/site.css'), data_mo_site_part='language-style'))
    head.append(node('link', rel='stylesheet', href=ref(page, assetroot+'/navigation.css'), data_mo_site_part='style'))
    head.append(node('script', src=ref(page, assetroot+'/navigation.js'), data_mo_site_part='script'))
    skip = label('a', 'nav.skip', href='#'+main.get('id'), data_mo_site_part='skip', **{'class':'mo-skip-link'})
    tree.find('body').insert(0, skip)

    aside = node('aside', data_mo_site_part='sidebar', **{'class':'mo-site-sidebar'})
    brand = node('a', href=ref(page, 'index.html'), data_mo_destination='index.html', **{'class':'mo-brand'})
    brand.append(node('span', 'M·', aria_hidden='true', **{'class':'mo-brand-mark'}))
    brandtext = node('span', 'MODERN'); brandtext.append(node('br')); brandtext[-1].tail='OBJECTIVITY'
    brandtext.append(label('small','nav.guide')); brand.append(brandtext); aside.append(brand)
    menu = node('details', id='mo-site-menu', open='', **{'class':'mo-site-menu'})
    menu.append(label('summary','nav.menu'))
    nav = node('nav', aria_label=LABELS['nav.site'], data_mo_nav_aria='nav.site', **{'class':'mo-site-nav'})
    for destination in [MODEL['home'], MODEL['directory']]:
        anchor = link(page, destination, **{'class':'mo-site-home'})
        if page == destination['href']: anchor.set('aria-current','page')
        nav.append(anchor)
    for section in MODEL['groups']:
        details = node('details', data_mo_nav_group=section['id'], **{'class':'mo-site-group'})
        if section == group or (page == 'index.html' and section['id'] == 'foundations'):
            details.set('open','')
        details.append(label('summary', section['label']))
        listing = node('ul')
        for item in section['items']:
            li = node('li'); anchor = link(page, item)
            if item['href'] == page: anchor.set('aria-current','page')
            li.append(anchor); listing.append(li)
        details.append(listing); nav.append(details)
    menu.append(nav); aside.append(menu)
    aside.append(node('span', 'GPL-2.0-only', **{'class':'mo-site-license'}))
    shell.insert(0, aside)

    header = node('header', data_mo_site_part='header', **{'class':'mo-topbar mo-site-header'})
    crumb = node('nav', aria_label=LABELS['nav.breadcrumb'], data_mo_nav_aria='nav.breadcrumb', **{'class':'mo-breadcrumb'})
    trail = node('ol'); li=node('li'); li.append(node('a','Modern Objectivity',href=ref(page,'index.html'),data_mo_destination='index.html')); trail.append(li)
    if group and group['href'] != page:
        li=node('li'); li.append(link(page,{'href':group['href'],'label':group['label']})); trail.append(li)
    li=node('li'); li.append(label('span',current['label'],aria_current='page')); trail.append(li); crumb.append(trail); header.append(crumb)
    actions = node('div', **{'class':'mo-topbar-actions'})
    if page == 'patterns/i18n/index.html':
        language = tree.xpath('//*[@id="language"]')[0].getparent()
        language.set('class','mo-site-language')
        languagebar = node('div', **{'class':'mo-language-bar'})
        languagebar.append(language); actions.append(languagebar)
    actions.append(node('button', '◐ Dark mode', type='button', data_theme_toggle='', aria_pressed='false', **{'class':'mo-btn'}))
    header.append(actions); main.insert(0,header)

    if group:
        back=node('a', LABELS['nav.back'].replace('{section}',LABELS[group['label']]), href=ref(page,group['href']), data_mo_destination=group['href'], data_mo_nav_back=group['label'], **{'class':'mo-back-link'})
    else:
        back=None
    context=node('div',data_mo_site_part='outline', **{'class':'mo-page-context'})
    if back is not None: context.append(back)
    headings=content.xpath('.//h2')
    if headings:
        outline=node('details',open='', **{'class':'mo-page-outline'})
        outline.append(label('summary','nav.onThisPage'))
        toc=node('nav',aria_label=LABELS['nav.onThisPage'],data_mo_nav_aria='nav.onThisPage'); listing=node('ul')
        for heading in headings:
            li=node('li'); anchor=node('a',' '.join(heading.itertext()).strip(),href='#'+heading.get('id'),data_mo_toc=heading.get('id')); li.append(anchor);listing.append(li)
        toc.append(listing);outline.append(toc);context.append(outline)
    content.insert(0,context)

    footer=node('footer',data_mo_site_part='footer', **{'class':'mo-site-footer'})
    pager=node('nav',aria_label=LABELS['nav.sequence'],data_mo_nav_aria='nav.sequence', **{'class':'mo-page-sequence'})
    index=PAGES.index(current)
    for offset,key in [(-1,'nav.previous'),(1,'nav.next')]:
        position=index+offset
        if 0 <= position < len(PAGES):
            item=PAGES[position]; anchor=link(page,item,rel='prev' if offset<0 else 'next')
            anchor.insert(0,label('small',key)); pager.append(anchor)
        else:
            pager.append(node('span',aria_hidden='true'))
    footer.append(pager)
    utilities=node('div', **{'class':'mo-footer-utilities'})
    sourcepage=page.removesuffix('.html')+'.md'
    if not (ROOT/sourcepage).exists(): sourcepage=page
    utilities.append(label('a','nav.source',href='https://github.com/philippklinz/modern-objectivity-style/blob/main/'+sourcepage))
    utilities.append(node('span','GPL-2.0-only'))
    footer.append(utilities);main.append(footer)
