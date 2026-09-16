const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];

const preloader=$('.preloader'), hero=$('.hero'), header=$('.header'), menuBtn=$('.menuBtn'), menu=$('.menuOverlay'), progress=$('.progress span'), cursor=$('.cursor');

window.addEventListener('load',()=>{
  setTimeout(()=>{
    preloader.style.transition='transform .9s cubic-bezier(.2,.75,.15,1)';
    preloader.style.transform='translateY(-100%)';
    hero.classList.add('is-ready');
    setTimeout(()=>preloader.remove(),1000);
  },1150);
});

menuBtn.addEventListener('click',()=>{
  const open=menu.classList.toggle('is-open');
  menuBtn.classList.toggle('is-open',open);
  menuBtn.setAttribute('aria-expanded',open);
  menu.setAttribute('aria-hidden',!open);
  document.body.style.overflow=open?'hidden':'';
});
$$('.menuOverlay__nav a').forEach(a=>a.addEventListener('click',()=>{
  menu.classList.remove('is-open'); menuBtn.classList.remove('is-open'); document.body.style.overflow='';
}));

const reveals=$$('.reveal, .splitTitle');
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target)}})
},{threshold:.16,rootMargin:'0px 0px -6% 0px'});
reveals.forEach(el=>io.observe(el));

const timelineEntries=$$('.timelineEntry'), activeYear=$('#activeYear');
const yearObserver=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      timelineEntries.forEach(x=>x.classList.remove('is-active'));
      e.target.classList.add('is-active');
      activeYear.textContent=e.target.dataset.year;
    }
  })
},{threshold:.58});
timelineEntries.forEach(el=>yearObserver.observe(el));

let mx=0,my=0,tx=0,ty=0;
if(matchMedia('(pointer:fine)').matches){
  window.addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY; cursor.style.left=mx+'px';cursor.style.top=my+'px';
    tx=(mx-innerWidth/2)/innerWidth;ty=(my-innerHeight/2)/innerHeight;
  });
  $$('a,button,.swatch').forEach(el=>{
    el.addEventListener('mouseenter',()=>{cursor.style.width='42px';cursor.style.height='42px';cursor.style.background='#fff'});
    el.addEventListener('mouseleave',()=>{cursor.style.width='10px';cursor.style.height='10px';cursor.style.background='var(--ink)'});
  });
}

function tick(){
  const obj=$('.hero__object');
  if(obj)obj.style.transform=`translate3d(${tx*18}px,${ty*12}px,0)`;
  requestAnimationFrame(tick);
}tick();

window.addEventListener('scroll',()=>{
  const y=scrollY,max=document.documentElement.scrollHeight-innerHeight;
  progress.style.width=(max?y/max*100:0)+'%';
  header.classList.toggle('is-scrolled',y>40);
  const q=$('.quoteBand__texture');if(q){const r=q.parentElement.getBoundingClientRect(); if(r.bottom>0&&r.top<innerHeight) q.style.transform=`scale(1.06) translateY(${(r.top/innerHeight)*18}px)`;}
},{passive:true});

$$('.magnetic').forEach(el=>{
  el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect(); const x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;el.style.transform=`translate(${x*.08}px,${y*.12}px)`});
  el.addEventListener('mouseleave',()=>el.style.transform='');
});

/* Editorial hero carousel */
const heroSlides=$$('.heroSlide');
const heroDots=$$('.heroCarousel__dot');
const heroPrev=$('.heroCarousel__arrow--prev');
const heroNext=$('.heroCarousel__arrow--next');
const heroCurrent=$('#heroCurrent');
const heroCarousel=$('.heroCarousel');
let heroIndex=0;
let heroTimer=null;
const HERO_DELAY=6200;

function restartHeroTimer(){
  clearTimeout(heroTimer);
  heroTimer=setTimeout(()=>setHeroSlide((heroIndex+1)%heroSlides.length),HERO_DELAY);
}

function setHeroSlide(index,{restart=true}={}){
  if(!heroSlides.length)return;
  heroIndex=(index+heroSlides.length)%heroSlides.length;
  heroSlides.forEach((slide,i)=>{
    const active=i===heroIndex;
    slide.classList.toggle('is-active',active);
    slide.setAttribute('aria-hidden',String(!active));
  });
  heroDots.forEach((dot,i)=>dot.classList.toggle('is-active',i===heroIndex));
  if(heroCurrent)heroCurrent.textContent=String(heroIndex+1).padStart(2,'0');
  // Re-trigger the thin progress animation on the active pagination line.
  const activeDot=heroDots[heroIndex];
  if(activeDot){
    const line=activeDot.querySelector('span');
    if(line){line.style.animation='none';void line.offsetWidth;line.style.animation='';}
  }
  if(restart)restartHeroTimer();
}

heroDots.forEach(dot=>dot.addEventListener('click',()=>setHeroSlide(Number(dot.dataset.go))));
heroPrev?.addEventListener('click',()=>setHeroSlide(heroIndex-1));
heroNext?.addEventListener('click',()=>setHeroSlide(heroIndex+1));

if(heroCarousel){
  let touchStartX=0;
  heroCarousel.addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0].clientX},{passive:true});
  heroCarousel.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-touchStartX;
    if(Math.abs(dx)>48)setHeroSlide(heroIndex+(dx<0?1:-1));
  },{passive:true});
  if(matchMedia('(pointer:fine)').matches){
    heroCarousel.addEventListener('mouseenter',()=>clearTimeout(heroTimer));
    heroCarousel.addEventListener('mouseleave',restartHeroTimer);
  }
}

document.addEventListener('keydown',e=>{
  if(!heroCarousel)return;
  const r=heroCarousel.getBoundingClientRect();
  if(r.bottom<=0||r.top>=innerHeight)return;
  if(e.key==='ArrowLeft')setHeroSlide(heroIndex-1);
  if(e.key==='ArrowRight')setHeroSlide(heroIndex+1);
});

document.addEventListener('visibilitychange',()=>{
  if(document.hidden)clearTimeout(heroTimer); else restartHeroTimer();
});

setHeroSlide(0);
