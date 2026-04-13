
const pages = window.__PAGES__ || {};
const navLinks = [...document.querySelectorAll('.nav-link')];
const searchInput = document.getElementById('globalSearch');
const searchResults = document.getElementById('searchResults');
const pageTitle = document.getElementById('pageTitle');
const pageKicker = document.getElementById('pageKicker');
const themeToggle = document.getElementById('toggleTheme');

function pageElement(group,id){ return document.getElementById(`${group}-${id}`); }
function normalize(t){ return (t || '').toLowerCase().trim(); }
function labelFor(group,id){ return navLinks.find(btn => btn.dataset.view === group && btn.dataset.target === id)?.querySelector('span')?.textContent || id; }
function kickerFor(group){
  if(group === 'tutorial') return 'Tutorial';
  if(group === 'studio') return 'Studio';
  if(group === 'design') return 'Design';
  if(group === 'release') return 'Release';
  return 'Current Docs';
}
function hideAllPages(){
  for(const group of Object.keys(pages)){
    for(const id of pages[group]){
      const el = pageElement(group,id);
      if(el){ el.classList.add('hidden'); el.classList.remove('visible'); }
    }
  }
}
function showPage(group,id){
  searchResults.classList.add('hidden');
  hideAllPages();
  const active = pageElement(group,id);
  if(active){ active.classList.remove('hidden'); active.classList.add('visible'); }
  navLinks.forEach(btn => btn.classList.toggle('active', btn.dataset.view === group && btn.dataset.target === id));
  pageTitle.textContent = labelFor(group,id);
  pageKicker.textContent = kickerFor(group);
  history.replaceState(null,'',`#${group}/${id}`);
  window.scrollTo({top:0, behavior:'smooth'});
}
function renderSearch(term){
  const q = normalize(term);
  if(!q){ searchResults.classList.add('hidden'); return; }
  const results = (window.__SEARCH_INDEX__ || []).map(item => {
    const hay = normalize(item.title + ' ' + item.text);
    const score = (hay.includes(q) ? 1 : 0) + (normalize(item.title).includes(q) ? 2 : 0);
    return {...item, score};
  }).filter(item => item.score > 0).sort((a,b) => b.score - a.score || a.title.localeCompare(b.title));

  searchResults.innerHTML = `<h3>Search results for “${term.replace(/</g,'&lt;')}”</h3><div class="result-grid">${results.length ? results.map(item =>
    `<article class="result-card"><span class="badge">${item.group}</span><h4>${item.title}</h4><p>${item.text.slice(0,180).replace(/</g,'&lt;')}...</p><button class="ghost-btn" data-open-type="${item.group}" data-open-id="${item.id}">Open</button></article>`
  ).join('') : `<div class="result-card"><h4>No matches</h4><p>Try terms like python, build, package, webview, state, layout, or studio.</p></div>`}</div>`;
  searchResults.classList.remove('hidden');
  document.querySelectorAll('[data-open-type]').forEach(btn => btn.addEventListener('click', () => showPage(btn.dataset.openType, btn.dataset.openId)));
}
navLinks.forEach(btn => {
  if(btn.dataset.external){
    btn.addEventListener('click', () => window.open(btn.dataset.external, '_blank', 'noopener,noreferrer'));
  } else {
    btn.addEventListener('click', () => showPage(btn.dataset.view, btn.dataset.target));
  }
});
searchInput.addEventListener('input', e => renderSearch(e.target.value));
document.addEventListener('keydown', e => {
  if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){
    e.preventDefault(); searchInput.focus(); searchInput.select();
  }
});
themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('erire-docs-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
});
if(localStorage.getItem('erire-docs-theme') === 'dark') document.documentElement.classList.add('dark');
const match = location.hash.slice(1).match(/^(current|tutorial|studio|design|release)\/(.+)$/);
if(match) showPage(match[1], match[2]);
else showPage('current', Object.values(pages)[0]?.[0] || 'readme');
