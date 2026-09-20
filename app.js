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


/* OYAG modern interactions */
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if(finePointer){
  const glowTargets=document.querySelectorAll(
    '.card,.feature-grid article,.content-card,.contact-card,.social-links a,.discovery-grid article,.sales-card,.sales-feature,.metric-panel,.metric-copy,.offer-box'
  );
  glowTargets.forEach(el=>{
    el.addEventListener('pointermove',event=>{
      const rect=el.getBoundingClientRect();
      el.style.setProperty('--mx',((event.clientX-rect.left)/rect.width*100).toFixed(1)+'%');
      el.style.setProperty('--my',((event.clientY-rect.top)/rect.height*100).toFixed(1)+'%');
    },{passive:true});
  });
}

if(!reduceMotion){
  document.querySelectorAll('.button').forEach(button=>{
    button.addEventListener('pointerdown',event=>{
      if(event.pointerType==='mouse'&&event.button!==0)return;
      const rect=button.getBoundingClientRect();
      const size=Math.max(rect.width,rect.height)*1.8;
      const ripple=document.createElement('span');
      ripple.className='ui-ripple';
      ripple.style.width=size+'px';
      ripple.style.height=size+'px';
      ripple.style.left=(event.clientX-rect.left)+'px';
      ripple.style.top=(event.clientY-rect.top)+'px';
      button.appendChild(ripple);
      ripple.addEventListener('animationend',()=>ripple.remove(),{once:true});
    });
  });
}

document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&nav?.classList.contains('open')){
    nav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded','false');
    menuToggle?.setAttribute('aria-label','Abrir menu');
    menuToggle?.focus();
  }
});

document.addEventListener('pointerdown',event=>{
  if(!nav?.classList.contains('open'))return;
  if(nav.contains(event.target)||menuToggle?.contains(event.target))return;
  nav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded','false');
  menuToggle?.setAttribute('aria-label','Abrir menu');
},{passive:true});

if('IntersectionObserver' in window&&!reduceMotion){
  const staggerTargets=document.querySelectorAll('.cards,.feature-grid,.content-cards,.sales-grid,.sales-feature-grid,.sales-process');
  const staggerObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      [...entry.target.children].forEach((child,index)=>{
        child.animate(
          [{opacity:.72,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],
          {duration:420,delay:Math.min(index*65,260),easing:'cubic-bezier(.2,.75,.2,1)',fill:'both'}
        );
      });
      staggerObserver.unobserve(entry.target);
    });
  },{threshold:.08});
  staggerTargets.forEach(el=>staggerObserver.observe(el));
}


/* Animated SVG sales charts */
const svgSalesCharts=document.querySelectorAll('[data-animate-svg]');
if(svgSalesCharts.length){
  if(reduceMotion){
    svgSalesCharts.forEach(el=>el.classList.add('is-visible'));
  }else if('IntersectionObserver' in window){
    const svgObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        entry.target.classList.add('is-visible');
        svgObserver.unobserve(entry.target);
      });
    },{threshold:.24});
    svgSalesCharts.forEach(el=>svgObserver.observe(el));
  }else{
    svgSalesCharts.forEach(el=>el.classList.add('is-visible'));
  }
}
