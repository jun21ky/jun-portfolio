'use strict';
const { apps, profileLinks } = window.PORTFOLIO;
const releasedApps = apps.filter(app => app.status === 'リリース済み');
const list = document.getElementById('appList');
const search = document.getElementById('appSearch');
const resultCount = document.getElementById('resultCount');
const emptyState = document.getElementById('emptyState');
const listButton = document.getElementById('listView');
const gridButton = document.getElementById('gridView');
const dialog = document.getElementById('appDialog');
const detailContent = document.getElementById('detailContent');
const previousButton = document.getElementById('previousApp');
const nextButton = document.getElementById('nextApp');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let activeIndex = 0;
let returnFocus = null;
let previousOverflow = '';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function safeExternalUrl(value) {
  if (!value) return null;
  try { const parsed = new URL(value); return /^https?:$/.test(parsed.protocol) ? parsed.href : null; }
  catch { return null; }
}
function appIcon(app) {
  const icon = element('span', `app-icon ${app.tone}`);
  icon.setAttribute('aria-hidden', 'true');
  if (app.icon) {
    const image = element('img');
    image.src = app.icon; image.alt = ''; image.width = 76; image.height = 76;
    icon.append(image);
  } else icon.textContent = app.id;
  return icon;
}
function createAppItem(app, index) {
  const item = element('li', 'app');
  const button = element('button', 'app-button');
  button.type = 'button';
  button.setAttribute('aria-label', `${app.name}の詳細を見る`);
  button.setAttribute('aria-haspopup', 'dialog');
  const text = element('span', 'app-text');
  text.append(element('span', 'app-title', app.name), element('span', 'app-tagline', app.tagline));
  const more = element('span', 'app-more');
  more.setAttribute('aria-hidden', 'true');
  more.append(element('span', 'more-label', 'くわしく'), element('span', 'more-symbol', '+'));
  button.append(appIcon(app), text, more);
  button.addEventListener('click', () => openApp(index));
  item.append(button); return item;
}
apps.forEach((app, index) => {
  const destination = app.status === 'リリース済み' ? list : document.getElementById('developmentList');
  destination.append(createAppItem(app, index));
});
document.querySelector('#apps-title span').textContent = releasedApps.length;

function filterApps() {
  const query = search.value.trim().toLocaleLowerCase();
  let count = 0;
  releasedApps.forEach((app, index) => {
    const haystack = [app.name, app.storeName, app.tagline, app.description, app.platform, app.category, ...(app.technologies || [])].join(' ').toLocaleLowerCase();
    const match = !query || haystack.includes(query);
    list.children[index].hidden = !match;
    if (match) count++;
  });
  resultCount.textContent = `${count} ${count === 1 ? 'app' : 'apps'}`;
  emptyState.hidden = count !== 0;
  list.hidden = count === 0;
}
filterApps();
search.addEventListener('input', filterApps);
document.getElementById('clearSearch').addEventListener('click', () => {
  search.value = ''; filterApps(); search.focus();
});
function setView(grid) {
  if (list.classList.contains('grid') === grid) return;
  const items = [...list.children].filter(item => !item.hidden);
  const before = items.map(item => item.getBoundingClientRect());
  list.classList.toggle('grid', grid);
  listButton.setAttribute('aria-pressed', String(!grid));
  gridButton.setAttribute('aria-pressed', String(grid));
  if (reducedMotion.matches || !Element.prototype.animate) return;
  items.forEach((item, index) => {
    const after = item.getBoundingClientRect();
    item.animate([
      { transform: `translate(${before[index].left - after.left}px,${before[index].top - after.top}px)`, opacity: .55 },
      { transform: 'translate(0,0)', opacity: 1 },
    ], { duration: 350, easing: 'cubic-bezier(.2,.8,.2,1)', delay: index * 10 });
  });
}
listButton.addEventListener('click', () => setView(false));
gridButton.addEventListener('click', () => setView(true));

function addFact(container, label, value) {
  if (!value) return;
  const fact = element('div');
  fact.append(element('dt', null, label), element('dd', null, value));
  container.append(fact);
}
function renderDetails(app) {
  detailContent.replaceChildren();
  const header = element('div', 'detail-header');
  const heading = element('div');
  const title = element('h2', null, app.name); title.id = 'detailTitle';
  heading.append(title, element('p', null, app.tagline));
  const status = element('div', 'detail-status');
  status.append(element('span', null, app.platform), element('span', null, app.status));
  heading.append(status); header.append(appIcon(app), heading);
  const description = element('p', 'detail-description', app.description); description.id = 'detailSummary';
  const facts = element('dl', 'detail-facts');
  addFact(facts, '制作', '個人開発');
  addFact(facts, 'カテゴリ', app.category);
  addFact(facts, 'リリース', app.releaseDate);
  addFact(facts, '技術', (app.technologies || []).join(' / '));
  detailContent.append(header, description, facts);
  if (app.screenshots?.length) {
    const section = element('section', 'detail-section');
    section.append(element('h3', null, 'アプリの画面'));
    const gallery = element('div', 'screenshots');
    gallery.tabIndex = 0; gallery.setAttribute('aria-label', 'スクリーンショット。横にスクロールできます');
    app.screenshots.forEach(screen => {
      const image = element('img'); image.src = screen.src; image.alt = screen.alt; image.loading = 'lazy';
      gallery.append(image);
    });
    section.append(gallery); detailContent.append(section);
  }
  if (app.features?.length) {
    const section = element('section', 'detail-section');
    const features = element('ul');
    app.features.forEach(feature => features.append(element('li', null, feature)));
    section.append(element('h3', null, 'できること'), features); detailContent.append(section);
  }
  if (app.note) {
    const section = element('section', 'detail-section');
    section.append(element('h3', null, '開発メモ'), element('p', null, app.note)); detailContent.append(section);
  }
  const storeUrl = safeExternalUrl(app.storeUrl);
  if (storeUrl) {
    const link = element('a', 'store-link', 'App Storeで見る');
    link.href = storeUrl; link.target = '_blank'; link.rel = 'noopener noreferrer'; detailContent.append(link);
  } else detailContent.append(element('p', 'detail-placeholder-note', app.status === '開発中' ? '公開に向けて開発中です。' : 'アプリの詳しい紹介は、準備中です。'));
}
function openApp(index, updateHash = true) {
  if (index < 0 || index >= apps.length) return;
  const wasOpen = dialog.open;
  activeIndex = index;
  renderDetails(apps[index]);
  previousButton.disabled = index === 0;
  nextButton.disabled = index === apps.length - 1;
  document.getElementById('detailPosition').textContent = `${String(index + 1).padStart(2, '0')} / ${String(apps.length).padStart(2, '0')}`;
  if (!dialog.open) {
    returnFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    document.getElementById('closeDialog').focus({ preventScroll: true });
  }
  dialog.scrollTop = 0;
  if (updateHash) {
    const hash = `#app-${apps[index].id}`;
    if (wasOpen) history.replaceState(history.state, '', hash);
    else history.pushState({ appDialog: true }, '', hash);
  }
}
document.getElementById('closeDialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
  document.body.style.overflow = previousOverflow;
  if (/^#app-/.test(location.hash)) {
    if (history.state?.appDialog) history.back();
    else history.replaceState(null, '', '#apps');
  }
  if (returnFocus instanceof HTMLElement && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
});
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
previousButton.addEventListener('click', () => openApp(activeIndex - 1));
nextButton.addEventListener('click', () => openApp(activeIndex + 1));
function resolveHash() {
  const id = location.hash.match(/^#app-(.+)$/)?.[1];
  const index = apps.findIndex(app => app.id === id);
  if (index >= 0) {
    if (!dialog.open || activeIndex !== index) openApp(index, false);
  } else if (dialog.open) dialog.close();
}
addEventListener('hashchange', resolveHash);
addEventListener('popstate', resolveHash);
resolveHash();
addEventListener('keydown', event => {
  const target = event.target;
  if (event.key === '/' && !dialog.open && !event.ctrlKey && !event.metaKey && !(target instanceof HTMLElement && (target.matches('input,textarea,select') || target.isContentEditable))) {
    event.preventDefault(); search.focus();
  }
});

const links = document.getElementById('profileLinks');
const profileIconPaths = {
  'app-store': [
    { d: 'M10 3.6 17.1 16 M13 3.6 5.7 16 M3.3 15.8H14.6 M5.3 20.3 6.9 17.5 M16.7 12.3 21.2 20.2', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  ],
  x: [
    { d: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.835L0 1.154h7.594l5.243 6.932zm-1.29 19.49h2.039L6.487 3.24H4.3z', fill: 'currentColor' },
  ],
  contact: [
    { d: 'M6 5h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z M3.5 7 12 13l8.5-6', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  ],
};
profileLinks.forEach(item => {
  const url = safeExternalUrl(item.url); if (!url) return;
  const link = element('a');
  link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
  const paths = profileIconPaths[item.icon];
  if (paths) {
    link.className = 'profile-icon-link';
    link.setAttribute('aria-label', item.accessibleLabel || item.label);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    paths.forEach(attributes => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      Object.entries(attributes).forEach(([name, value]) => path.setAttribute(name, value));
      svg.append(path);
    });
    const tooltip = element('span', 'profile-icon-tooltip', item.label);
    tooltip.setAttribute('aria-hidden', 'true');
    link.append(svg, tooltip);
  } else link.textContent = item.label;
  links.append(link);
});
links.hidden = links.children.length === 0;
const logo = document.getElementById('wordmark');
logo.addEventListener('click', () => {
  if (reducedMotion.matches || !Element.prototype.animate) return;
  logo.querySelectorAll('.letter').forEach((letter, index) => letter.animate([
    { transform: 'translateY(0) rotate(0)' },
    { transform: `translateY(-${9 + index * 2}px) rotate(${index % 2 ? -7 : 7}deg)`, offset: .4 },
    { transform: 'translateY(0) rotate(0)' },
  ], { duration: 520, delay: index * 55, easing: 'cubic-bezier(.25,.8,.3,1)' }));
  for (let index = 0; index < 8; index++) {
    const particle = element('span', 'particle'); particle.setAttribute('aria-hidden', 'true'); logo.append(particle);
    const angle = index * Math.PI / 4;
    const animation = particle.animate([
      { transform: 'translate(0,0) scale(1)', opacity: .7 },
      { transform: `translate(${Math.cos(angle) * 52}px,${Math.sin(angle) * 40}px) scale(.2)`, opacity: 0 },
    ], { duration: 650, easing: 'ease-out' });
    animation.onfinish = () => particle.remove();
  }
});

// 操作を始めたら表示を完了する。一度完了した演出はページ内では再開しない。
const entranceEvents = ['pointerdown', 'keydown', 'wheel', 'touchmove'];
let entranceTimer;
function finishEntrance() {
  document.documentElement.setAttribute('data-entrance-done', '');
  clearTimeout(entranceTimer);
  entranceEvents.forEach(type => document.removeEventListener(type, finishEntrance));
}
if (reducedMotion.matches) finishEntrance();
else {
  entranceTimer = setTimeout(finishEntrance, 1400);
  entranceEvents.forEach(type => document.addEventListener(type, finishEntrance, { once: true, passive: true }));
}
