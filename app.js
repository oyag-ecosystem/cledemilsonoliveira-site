const root=document.documentElement;
const toggle=document.querySelector('#themeToggle');
const saved=localStorage.getItem('cledemilson-theme');
if(saved==='light'||saved==='dark')root.dataset.theme=saved;
function renderToggle(){if(!toggle)return;const dark=root.dataset.theme!=='light';toggle.querySelector('span:first-child').textContent=dark?'☾':'☀';toggle.setAttribute('aria-label',dark?'Ativar tema claro':'Ativar tema escuro')}
renderToggle();
toggle?.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='light'?'dark':'light';localStorage.setItem('cledemilson-theme',root.dataset.theme);renderToggle()});
const year=document.querySelector('#year');if(year)year.textContent=new Date().getFullYear();
