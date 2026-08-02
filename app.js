/* ═══════════════════════════════════════════════
   SAMT — app.js · engine: instrument, reveals, tabs,
   language switching, atmosphere (WebGL, cursor,
   marquee, kinetic type), cinematic intro.
   Requires i18n.js loaded first.
   ═══════════════════════════════════════════════ */
(function(){
'use strict';
var doc = document, root = doc.documentElement;
root.classList.add('js');

/* ═══════════ i18n dictionaries ═══════════ */
var I18N = window.SAMT_I18N;

/* ═══════════ instrument section labels ═══════════ */
var INST = window.SAMT_INST;
var SECTION_IDS = ['hero','name','programme','foundation','journey','selection','stations','competencies','assessment','impact','admission'];
var lang = 'en'; /* in-memory only — no storage APIs */
var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function qs(s,c){return (c||doc).querySelector(s)}
function qsa(s,c){return Array.prototype.slice.call((c||doc).querySelectorAll(s))}

/* ═══════════ language toggle ═══════════ */
function applyLang(next){
  lang = next;
  var d = I18N[lang];
  root.setAttribute('lang', lang);
  root.setAttribute('dir', d._dir);
  doc.title = d._docTitle;
  var md = qs('meta[name="description"]');
  if(md) md.setAttribute('content', d._metaDesc);
  qsa('[data-i18n]').forEach(function(el){
    var k = el.getAttribute('data-i18n');
    if(d[k] !== undefined) el.textContent = d[k];
  });
  qsa('[data-i18n-html]').forEach(function(el){
    var k = el.getAttribute('data-i18n-html');
    if(d[k] !== undefined) el.innerHTML = d[k];
  });
  var lb = qs('#langBtnTxt'); if(lb) lb.innerHTML = d._langBtn;
  wrapLines();
  wrapKin();
  updateFrame();
}
var langBtn = qs('#langBtn');
if(langBtn) langBtn.addEventListener('click', function(){ applyLang(lang === 'en' ? 'ar' : 'en'); });

/* ═══════════ azimuth tick builders ═══════════ */
var SVGNS = 'http://www.w3.org/2000/svg';
function buildTicks(groupId, cx, cy, rOuter, stepDeg, majorEvery, lenMajor, lenMinor, color, colorMajor){
  var g = doc.getElementById(groupId);
  if(!g) return;
  for(var a = 0; a < 360; a += stepDeg){
    var major = (a % majorEvery) === 0;
    var len = major ? lenMajor : lenMinor;
    var t = doc.createElementNS(SVGNS,'line');
    var rad = (a - 90) * Math.PI / 180;
    var x1 = cx + Math.cos(rad) * rOuter, y1 = cy + Math.sin(rad) * rOuter;
    var x2 = cx + Math.cos(rad) * (rOuter - len), y2 = cy + Math.sin(rad) * (rOuter - len);
    t.setAttribute('x1',x1.toFixed(2)); t.setAttribute('y1',y1.toFixed(2));
    t.setAttribute('x2',x2.toFixed(2)); t.setAttribute('y2',y2.toFixed(2));
    t.setAttribute('stroke', major ? colorMajor : color);
    t.setAttribute('stroke-width', major ? '1.4' : '1');
    g.appendChild(t);
  }
}
buildTicks('heroRotor', 200, 200, 192, 5, 30, 16, 7, '#1B2B41', '#8F7430');
buildTicks('miniRotor', 20, 20, 17.5, 15, 90, 5, 3, '#22354D', '#8F7430');

/* ═══════════ scroll frame: rotation, readout, nav, active link ═══════════ */
var heroRotor = doc.getElementById('heroRotor');
var miniRotor = doc.getElementById('miniRotor');
var instEl = qs('#instrument');
var instDeg = qs('#instDeg');
var instLabel = qs('#instLabel');
var navEl = qs('#nav');
var navLinks = qsa('.nav-links a');
var targetDeg = 0, curDeg = 0, frameN = 0;
var halo = qs('.halo'), grat = qs('.graticule');

function fmtDeg(d){
  var s = d.toFixed(1);
  while(s.length < 5) s = '0' + s;
  return s + '\u00b0';
}
function currentSection(){
  var cur = SECTION_IDS[0];
  for(var i = 0; i < SECTION_IDS.length; i++){
    var el = doc.getElementById(SECTION_IDS[i]);
    if(el && el.getBoundingClientRect().top <= window.innerHeight * 0.45) cur = SECTION_IDS[i];
  }
  return cur;
}
function slowRefresh(st, p){
  var cur = currentSection();
  if(instLabel && INST[cur]) instLabel.textContent = INST[cur][lang];
  if(instEl) instEl.classList.toggle('on', st > 240 && p < 0.985);
  if(navEl) navEl.classList.toggle('scrolled', st > 10);
  navLinks.forEach(function(a){
    a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
  });
}
function updateFrame(){ /* immediate refresh (language switch, init) */
  var st = window.pageYOffset || root.scrollTop || 0;
  var max = root.scrollHeight - window.innerHeight;
  slowRefresh(st, max > 0 ? Math.min(1, st / max) : 0);
}
function tick(){
  var st = window.pageYOffset || root.scrollTop || 0;
  var max = root.scrollHeight - window.innerHeight;
  var p = max > 0 ? Math.min(1, Math.max(0, st / max)) : 0;
  targetDeg = p * 360;
  if(reduced){
    curDeg = targetDeg;
  } else {
    curDeg += (targetDeg - curDeg) * 0.085;
    if(Math.abs(targetDeg - curDeg) < 0.02) curDeg = targetDeg;
    var r = (-curDeg).toFixed(2);
    if(heroRotor) heroRotor.setAttribute('transform', 'rotate(' + r + ' 200 200)');
    if(miniRotor) miniRotor.setAttribute('transform', 'rotate(' + r + ' 20 20)');
    if(halo) halo.style.transform = 'translateY(' + (st * 0.1).toFixed(1) + 'px)';
    if(grat) grat.style.backgroundPosition = '0 ' + (-st * 0.06).toFixed(1) + 'px';
  }
  if(instDeg) instDeg.textContent = fmtDeg(curDeg);
  atmoFrame(st);
  if((frameN++ % 5) === 0) slowRefresh(st, p);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ═══════════ counters ═══════════ */
function runCounters(scope, instant){
  qsa('.count', scope).forEach(function(el){
    if(el.getAttribute('data-done')) return;
    el.setAttribute('data-done','1');
    var end = parseInt(el.getAttribute('data-count'), 10) || 0;
    if(instant || reduced){ el.textContent = String(end); return; }
    var t0 = null, dur = 1100;
    function step(ts){
      if(!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = String(Math.round(end * e));
      if(k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

/* ═══════════ reveals (IO + iPhone-safe fallback) ═══════════ */
function markIn(el){
  el.classList.add('in');
  runCounters(el, false);
  qsa('.ring-close', el).forEach(function(r){ r.classList.add('closed'); });
}
var revealEls = qsa('.reveal');
if('IntersectionObserver' in window){
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){ markIn(en.target); io.unobserve(en.target); }
    });
  }, {rootMargin:'0px 0px -8% 0px', threshold:0.06});
  revealEls.forEach(function(el){ io.observe(el); });
} else {
  revealEls.forEach(markIn);
}
/* safety net: nothing may remain hidden if observers misbehave */
window.setTimeout(function(){
  revealEls.forEach(function(el){
    if(!el.classList.contains('in')){
      el.classList.add('in');
      runCounters(el, true);
      qsa('.ring-close', el).forEach(function(r){ r.classList.add('closed'); });
    }
  });
}, 4000);

/* ═══════════ station tabs ═══════════ */
var tabs = qsa('.st-tab');
var panelFor = function(tab){ return doc.getElementById(tab.getAttribute('aria-controls')); };
function selectTab(idx){
  tabs.forEach(function(t, i){
    var on = i === idx;
    t.setAttribute('aria-selected', on ? 'true' : 'false');
    t.setAttribute('tabindex', on ? '0' : '-1');
    var p = panelFor(t);
    if(!p) return;
    if(on){
      p.hidden = false;
      p.classList.add('show');
      qsa('.reveal', p).forEach(markIn);
    } else {
      p.hidden = true;
      p.classList.remove('show');
    }
  });
}
tabs.forEach(function(t, i){
  t.addEventListener('click', function(){ selectTab(i); });
  t.addEventListener('keydown', function(ev){
    var k = ev.key, n = null;
    if(k === 'ArrowRight' || k === 'ArrowDown') n = (i + 1) % tabs.length;
    if(k === 'ArrowLeft' || k === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
    if(k === 'Home') n = 0;
    if(k === 'End') n = tabs.length - 1;
    if(n !== null){ ev.preventDefault(); selectTab(n); tabs[n].focus(); }
  });
});
selectTab(0);

/* ═══════════ mobile menu ═══════════ */
var burger = qs('#burger');
var menu = qs('#mobileMenu');
function setMenu(open){
  if(!burger || !menu) return;
  burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  menu.classList.toggle('open', open);
  doc.body.classList.toggle('menu-lock', open);
}
if(burger){
  burger.addEventListener('click', function(){
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
}
if(menu){
  qsa('a', menu).forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); });
}
doc.addEventListener('keydown', function(ev){ if(ev.key === 'Escape') setMenu(false); });

/* ═══════════ atmosphere layer ═══════════ */
var lastSt = 0, vel = 0;
var mqTrack = qs('#mqTrack'), mqSegW = 0, mqX = 0;
if(mqTrack){
  var mqBase = mqTrack.innerHTML;
  mqTrack.innerHTML = mqBase + mqBase + mqBase + mqBase;
}
function measureMq(){
  var seg = mqTrack ? qs('.mq-seg', mqTrack) : null;
  mqSegW = seg ? seg.getBoundingClientRect().width : 0;
}
var kinLines = qsa('.kin-line');
var kinSpeeds = [0.05, 0.11, 0.07, 0.15];

/* WebGL fog + grain (graceful fallback to CSS halo) */
var glCanvas = null, gl = null, glProg = null, glU = {};
var glScale = (window.innerWidth < 760 ? 0.5 : 0.66);
var mouseT = {x:.5, y:.38}, mouseC = {x:.5, y:.38};
(function initGL(){
  try{
    glCanvas = doc.createElement('canvas');
    glCanvas.className = 'atmo';
    glCanvas.setAttribute('aria-hidden','true');
    gl = glCanvas.getContext('webgl', {alpha:false, antialias:false, depth:false, stencil:false});
    if(!gl){ glCanvas = null; return; }
    doc.body.insertBefore(glCanvas, doc.body.firstChild);
    var vsrc = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var fsrc =
      'precision mediump float;uniform vec2 uR;uniform float uT;uniform float uS;uniform vec2 uM;' +
      'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}' +
      'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}' +
      'float fbm(vec2 p){float v=0.,a=.5;for(int k=0;k<4;k++){v+=a*n(p);p*=2.03;a*=.5;}return v;}' +
      'void main(){vec2 uv=gl_FragCoord.xy/uR;vec2 q=uv;q.x*=uR.x/uR.y;float t=uT*.018;' +
      'float f=fbm(q*1.5+vec2(t*.55,-uS*.00035-t*.22));f=fbm(q*1.35+f*1.25+vec2(-t*.3,t*.18));' +
      'vec3 base=mix(vec3(.006,.024,.048),vec3(.011,.038,.068),uv.y);' +
      'vec3 gold=vec3(.764,.635,.29);' +
      'float band=smoothstep(.2,.95,f)*smoothstep(1.08,.3,uv.y);' +
      'vec3 col=base+gold*band*.14;' +
      'col+=vec3(.32,.42,.58)*smoothstep(.62,1.,f)*smoothstep(.95,.15,uv.y)*.045;' +
      'float d=distance(vec2(uv.x*uR.x/uR.y,uv.y),vec2(uM.x*uR.x/uR.y,uM.y));' +
      'col+=gold*exp(-d*3.8)*.05;' +
      'float g=h(gl_FragCoord.xy+vec2(mod(uT*43.,97.)))-.5;col+=g*.032;' +
      'float vg=smoothstep(1.3,.4,length(uv-.5));col*=mix(.82,1.,vg);' +
      'gl_FragColor=vec4(col,1.);}';
    function sh(type, s){
      var o = gl.createShader(type);
      gl.shaderSource(o, s); gl.compileShader(o);
      if(!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o);
      return o;
    }
    glProg = gl.createProgram();
    gl.attachShader(glProg, sh(gl.VERTEX_SHADER, vsrc));
    gl.attachShader(glProg, sh(gl.FRAGMENT_SHADER, fsrc));
    gl.linkProgram(glProg);
    if(!gl.getProgramParameter(glProg, gl.LINK_STATUS)) throw 'link failed';
    gl.useProgram(glProg);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(glProg, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    glU.r = gl.getUniformLocation(glProg, 'uR');
    glU.t = gl.getUniformLocation(glProg, 'uT');
    glU.s = gl.getUniformLocation(glProg, 'uS');
    glU.m = gl.getUniformLocation(glProg, 'uM');
    sizeGL();
    root.classList.add('gl');
    if(reduced) drawGL(0);
  }catch(e){
    if(glCanvas && glCanvas.parentNode) glCanvas.parentNode.removeChild(glCanvas);
    glCanvas = null; gl = null;
  }
})();
function sizeGL(){
  if(!gl) return;
  glCanvas.width = Math.max(1, Math.round(window.innerWidth * glScale));
  glCanvas.height = Math.max(1, Math.round(window.innerHeight * glScale));
  gl.viewport(0, 0, glCanvas.width, glCanvas.height);
}
var glT0 = (window.performance && performance.now) ? performance.now() : Date.now();
function drawGL(st){
  if(!gl) return;
  var sec = (((window.performance && performance.now) ? performance.now() : Date.now()) - glT0) / 1000;
  gl.uniform2f(glU.r, glCanvas.width, glCanvas.height);
  gl.uniform1f(glU.t, sec);
  gl.uniform1f(glU.s, st);
  gl.uniform2f(glU.m, mouseC.x, 1.0 - mouseC.y);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

/* bearing reticle cursor + magnetic controls (fine pointers only) */
var fine = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;
var curDot = null, curRing = null;
var curT = {x: window.innerWidth/2, y: window.innerHeight/2};
var curR = {x: curT.x, y: curT.y};
if(fine && !reduced){
  curDot = doc.createElement('div'); curDot.className = 'cursor-dot';
  curRing = doc.createElement('div'); curRing.className = 'cursor-ring';
  doc.body.appendChild(curDot); doc.body.appendChild(curRing);
  root.classList.add('fine-cursor');
  doc.addEventListener('mousemove', function(e){
    curT.x = e.clientX; curT.y = e.clientY;
    mouseT.x = e.clientX / window.innerWidth;
    mouseT.y = e.clientY / window.innerHeight;
  }, {passive:true});
  doc.addEventListener('mouseover', function(e){
    if(e.target && e.target.closest && e.target.closest('a,button')) root.classList.add('cursor-hover');
  });
  doc.addEventListener('mouseout', function(e){
    if(e.target && e.target.closest && e.target.closest('a,button')) root.classList.remove('cursor-hover');
  });
  qsa('.btn,.lang-btn').forEach(function(el){
    el.addEventListener('mousemove', function(e){
      var r = el.getBoundingClientRect();
      var mx = (e.clientX - r.left - r.width/2) * .22;
      var my = (e.clientY - r.top - r.height/2) * .3;
      el.style.transform = 'translate(' + mx.toFixed(1) + 'px,' + my.toFixed(1) + 'px)';
    });
    el.addEventListener('mouseleave', function(){ el.style.transform = ''; });
  });
}

function atmoFrame(st){
  vel = vel * 0.88 + (st - lastSt) * 0.12;
  lastSt = st;
  if(reduced) return;
  if(mqTrack && mqSegW > 0){
    mqX -= 0.55 + Math.min(Math.abs(vel) * 0.05, 2.6);
    if(mqX <= -mqSegW) mqX += mqSegW;
    mqTrack.style.transform = 'translateX(' + mqX.toFixed(1) + 'px)';
  }
  for(var i = 0; i < kinLines.length; i++){
    var r = kinLines[i].getBoundingClientRect();
    var c = r.top + r.height/2 - window.innerHeight/2;
    if(Math.abs(c) < window.innerHeight * 1.3){
      kinLines[i].style.transform = 'translateY(' + (-c * kinSpeeds[i % 4]).toFixed(1) + 'px)';
    }
  }
  mouseC.x += (mouseT.x - mouseC.x) * .06;
  mouseC.y += (mouseT.y - mouseC.y) * .06;
  if(curDot){
    curDot.style.transform = 'translate(' + curT.x + 'px,' + curT.y + 'px)';
    curR.x += (curT.x - curR.x) * .16;
    curR.y += (curT.y - curR.y) * .16;
    curRing.style.transform = 'translate(' + curR.x.toFixed(1) + 'px,' + curR.y.toFixed(1) + 'px)';
  }
  if(!doc.hidden) drawGL(st);
}
measureMq();
window.setTimeout(measureMq, 1600);
window.addEventListener('resize', function(){ sizeGL(); measureMq(); }, {passive:true});

/* headline line-masking */
function wrapLines(){
  qsa('[data-i18n-html]').forEach(function(el){
    var parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map(function(pt){
      return '<span class="hl"><span class="hl-in">' + pt + '</span></span>';
    }).join('');
  });
}
function wrapKin(){
  qsa('.kin-line').forEach(function(el){
    var ws = (el.textContent || '').trim().split(/\s+/);
    el.innerHTML = ws.map(function(w, i){
      return '<span class="w"><i style="--i:' + i + '">' + w + '</i></span>';
    }).join(' ');
  });
}

/* cinematic intro — bearing acquisition */
if(!reduced){
  var intro = doc.createElement('div');
  intro.className = 'intro';
  intro.setAttribute('aria-hidden', 'true');
  intro.innerHTML =
    '<div class="intro-ring">' +
      '<svg viewBox="0 0 200 200" fill="none">' +
        '<circle class="intro-circle" cx="100" cy="100" r="94" stroke="#C3A24A" stroke-width="1.2" transform="rotate(-90 100 100)"/>' +
        '<g class="intro-ticks" id="introTicks"></g>' +
        '<path class="intro-needle" d="M100 22l7 18-7-4.5-7 4.5Z" fill="#C3A24A"/>' +
      '</svg>' +
      '<div class="intro-word"><span class="iw-ar">\u0633\u0645\u062a</span><span class="iw-en">SAMT</span></div>' +
    '</div>' +
    '<div class="intro-deg" id="introDeg">000.0\u00b0</div>' +
    '<button class="intro-skip">SKIP</button>';
  doc.body.appendChild(intro);
  doc.body.classList.add('intro-lock');
  buildTicks('introTicks', 100, 100, 94, 10, 90, 8, 4, '#22354D', '#8F7430');
  var introDegEl = doc.getElementById('introDeg');
  var introStart = (window.performance && performance.now) ? performance.now() : Date.now();
  (function introCount(){
    if(introDone) return;
    var now = (window.performance && performance.now) ? performance.now() : Date.now();
    var d = Math.min(360, (now - introStart) / 2400 * 360);
    if(introDegEl) introDegEl.textContent = fmtDeg(d);
    if(d < 360) requestAnimationFrame(introCount);
  })();
  var introDone = false;
  var endIntro = function(){
    if(introDone) return;
    introDone = true;
    if(introDegEl) introDegEl.textContent = fmtDeg(360);
    intro.classList.add('done');
    doc.body.classList.remove('intro-lock');
    qsa('#hero .reveal').forEach(function(el){
      el.classList.remove('in');
      void el.offsetWidth;
      el.classList.add('in');
    });
    window.setTimeout(function(){
      if(intro.parentNode) intro.parentNode.removeChild(intro);
    }, 1000);
  };
  window.setTimeout(endIntro, 2700);
  ['click','wheel','touchstart','keydown'].forEach(function(ev){
    intro.addEventListener(ev, endIntro, {passive:true});
  });
}

/* first paint */
wrapLines();
wrapKin();
updateFrame();
})();
