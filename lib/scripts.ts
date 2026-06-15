// Hand-rolled vanilla JS injected as inline <script> tags. No framework, no dependencies.
// This is deliberate (§4.5, §7): the site brags about its JS budget, so theme + reveals
// ship as ~1KB of inline script rather than React client islands. The Voice Engine demo
// is the ONLY hydrated client component.

// Runs in <head> BEFORE first paint — sets data-theme so there is no flash (FOUC). Mandatory
// with static export (§4.5).
export const THEME_INIT = `(function(){try{var c=localStorage.getItem('theme');var sys=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var t=(c==='light'||c==='dark')?c:sys;var e=document.documentElement;e.setAttribute('data-theme',t);e.style.colorScheme=t;}catch(e){}})();`;

// Runs at end of <body>. Wires: scroll reveals, the theme toggle (light → dark → auto cycle,
// persisted to localStorage), live system-preference updates while in auto, and outbound
// CTA tracking via [data-track].
export const ENHANCE = `(function(){
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var els=document.querySelectorAll('.reveal');
if(reduce||!('IntersectionObserver' in window)){els.forEach(function(el){el.classList.add('is-visible');});}
else{var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('is-visible');io.unobserve(en.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:0.12});els.forEach(function(el){io.observe(el);});}
var btn=document.getElementById('theme-toggle');
function sys(){return window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
function resolve(c){return (c==='light'||c==='dark')?c:sys();}
function apply(c){var t=resolve(c);var e=document.documentElement;e.setAttribute('data-theme',t);e.style.colorScheme=t;if(btn){btn.setAttribute('data-choice',c);var l=btn.querySelector('[data-choice-label]');if(l)l.textContent=c;btn.setAttribute('aria-label','Theme: '+c+'. Activate to change.');}}
if(btn){apply(localStorage.getItem('theme')||'auto');btn.addEventListener('click',function(){var c=localStorage.getItem('theme')||'auto';var n=c==='auto'?'light':c==='light'?'dark':'auto';localStorage.setItem('theme',n);apply(n);});}
try{window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){var c=localStorage.getItem('theme')||'auto';if(c!=='light'&&c!=='dark')apply(c);});}catch(e){}
document.querySelectorAll('[data-track]').forEach(function(el){el.addEventListener('click',function(){var n=el.getAttribute('data-track');if(window.va)window.va('event',{name:n});});});
var navLinks=document.querySelectorAll('.nav-link');
if(navLinks.length&&'IntersectionObserver' in window){var spy=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){var id=en.target.id;navLinks.forEach(function(l){l.classList.toggle('is-active',l.getAttribute('data-spy')===id);});}});},{rootMargin:'-45% 0px -50% 0px',threshold:0});document.querySelectorAll('main section[id]').forEach(function(s){spy.observe(s);});}
})();`;
