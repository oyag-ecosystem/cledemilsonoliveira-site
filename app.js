const root=document.documentElement;
const toggle=document.querySelector('#themeToggle');
const menuToggle=document.querySelector('#menuToggle');
const nav=document.querySelector('.topbar nav');
const topbar=document.querySelector('.topbar');
const progress=document.querySelector('#scrollProgress');
const saved=localStorage.getItem('cledemilson-theme');

if(saved==='light'||saved==='dark')root.dataset.theme=saved;

function renderToggle(){
  if(!toggle)return;
  const dark=root.dataset.theme!=='light';
  toggle.querySelector('span:first-child').textContent=dark?'☾':'☀';
  toggle.setAttribute('aria-label',dark?'Ativar tema claro':'Ativar tema escuro');
}
renderToggle();

toggle?.addEventListener('click',()=>{
  root.dataset.theme=root.dataset.theme==='light'?'dark':'light';
  localStorage.setItem('cledemilson-theme',root.dataset.theme);
  renderToggle();
});

menuToggle?.addEventListener('click',()=>{
  const open=nav?.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded',String(Boolean(open)));
  menuToggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
});

nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  nav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded','false');
  menuToggle?.setAttribute('aria-label','Abrir menu');
}));

const revealItems=[...document.querySelectorAll('.reveal')];
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -40px'});
  revealItems.forEach(el=>observer.observe(el));
}else{
  revealItems.forEach(el=>el.classList.add('is-visible'));
}

const sections=[...document.querySelectorAll('main section[id]')];
const navLinks=[...document.querySelectorAll('.topbar nav a[href^="#"]')];
function updateScrollUi(){
  const y=window.scrollY;
  topbar?.classList.toggle('scrolled',y>12);
  if(progress){
    const h=document.documentElement.scrollHeight-window.innerHeight;
    progress.style.width=(h>0?Math.min(100,(y/h)*100):0)+'%';
  }
  let current='';
  for(const section of sections){
    if(section.getBoundingClientRect().top<=140)current=section.id;
  }
  navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+current));
}
updateScrollUi();
window.addEventListener('scroll',updateScrollUi,{passive:true});

const year=document.querySelector('#year');
if(year)year.textContent=new Date().getFullYear();
