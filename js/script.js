/* ==========================================================================
   PORTFÓLIO — O QUE É O BITCOIN | JavaScript puro (sem bibliotecas)
   Sumário:
     1. Utilitários
     2. Ano do rodapé
     3. Cabeçalho, menu mobile, progresso e seção ativa
     4. Revelação ao rolar
     5. Fundo animado (rede de nós)
     6. Hero: inclinação 3D com o mouse
     7. Foco de luz nos painéis
     8. Mídia: arquivos ausentes, reprodução exclusiva, equalizador
     9. Visualizador do infográfico (lightbox)
   ========================================================================== */

(() => {
  'use strict';

  /* 1. UTILITÁRIOS ------------------------------------------------------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* 2. ANO DO RODAPÉ ----------------------------------------------------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* 3. CABEÇALHO / MENU / PROGRESSO / SEÇÃO ATIVA ------------------------ */
  const header   = $('#header');
  const progress = $('#progress');
  const nav      = $('#nav');
  const toggle   = $('#navToggle');

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      header.classList.toggle('is-scrolled', y > 20);
      progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 980) setMenu(false); });

  // Destaca no menu a seção que está na tela
  const navLinks = $$('a', nav);
  const sections = $$('main section[id]');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }


  /* 4. REVELAÇÃO AO ROLAR ------------------------------------------------ */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !prefersReduced) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('is-in');
        // depois da entrada, remove o atraso para o hover responder na hora
        setTimeout(() => el.classList.add('is-done'), 1200);
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-in', 'is-done'));
  }


  /* 5. FUNDO ANIMADO: REDE DE NÓS ---------------------------------------- */
  (function network() {
    const canvas = $('#network');
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const COLORS = ['247,147,26', '255,181,92', '255,106,0'];   // laranja, âmbar, laranja intenso
    const LINK_DIST = 140;
    const mouse = { x: -9999, y: -9999 };
    let w = 0, h = 0, nodes = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(85, Math.round((w * h) / 18000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.5 + 0.7,
        c: COLORS[Math.floor(Math.random() * COLORS.length)]
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < -10) n.x = w + 10; else if (n.x > w + 10) n.x = -10;
        if (n.y < -10) n.y = h + 10; else if (n.y > h + 10) n.y = -10;

        // os nós se afastam suavemente do cursor
        const dx = n.x - mouse.x, dy = n.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14400 && d2 > 0) {
          const d = Math.sqrt(d2);
          const f = (120 - d) / 120;
          n.x += (dx / d) * f * 1.6;
          n.y += (dy / d) * f * 1.6;
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK_DIST) {
            ctx.strokeStyle = `rgba(247,147,26,${(1 - d / LINK_DIST) * 0.32})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(${a.c},.9)`;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
    }

    function loop() {
      draw();
      requestAnimationFrame(loop);
    }

    let lastW = 0;
    resize(); lastW = window.innerWidth;
    window.addEventListener('resize', () => {
      // no celular a barra do navegador altera a altura ao rolar: só recria se a largura mudou
      if (window.innerWidth !== lastW) { lastW = window.innerWidth; resize(); if (prefersReduced) draw(); }
    });
    window.addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });

    if (prefersReduced) draw(); else loop();
  })();


  /* 6. HERO: INCLINAÇÃO 3D ------------------------------------------------ */
  (function tilt() {
    const hero   = $('#inicio');
    const visual = $('#heroVisual');
    if (!hero || !visual || prefersReduced) return;
    if (!window.matchMedia('(hover: hover)').matches) return;   // só em dispositivos com mouse

    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      visual.style.setProperty('--ry', `${(px * 10).toFixed(2)}deg`);
      visual.style.setProperty('--rx', `${(-py * 10).toFixed(2)}deg`);
    });
    hero.addEventListener('pointerleave', () => {
      visual.style.setProperty('--rx', '0deg');
      visual.style.setProperty('--ry', '0deg');
    });
  })();


  /* 7. FOCO DE LUZ NOS PAINÉIS ------------------------------------------- */
  $$('.panel').forEach(panel => {
    panel.addEventListener('pointermove', e => {
      const r = panel.getBoundingClientRect();
      panel.style.setProperty('--mx', `${e.clientX - r.left}px`);
      panel.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });


  /* 8. MÍDIA -------------------------------------------------------------- */
  const medias = $$('audio, video');

  // 8a. Equalizador da seção de música (barras geradas aqui)
  const eq = $('#eq');
  if (eq) {
    const BARS = 40;
    for (let i = 0; i < BARS; i++) {
      const bar = document.createElement('span');
      bar.style.setProperty('--dur',   `${(0.45 + Math.random() * 0.9).toFixed(2)}s`);
      bar.style.setProperty('--delay', `${(-Math.random() * 1.2).toFixed(2)}s`);
      bar.style.setProperty('--peak',  (0.25 + Math.random() * 0.75).toFixed(2));
      eq.appendChild(bar);
    }
  }

  // 8b. Avisa quando o arquivo ainda não foi colocado na pasta
  function markEmpty(media) {
    const scope = media.closest('[data-media]');
    if (!scope) return;
    scope.classList.add('is-empty');
    const src = media.querySelector('source');
    const label = scope.querySelector('[data-missing-path]');
    if (src && label) label.textContent = src.getAttribute('src');
  }
  function checkMedia(media) {
    if (media.networkState === HTMLMediaElement.NETWORK_NO_SOURCE || media.error) markEmpty(media);
  }
  medias.forEach(media => {
    $$('source', media).forEach(s => s.addEventListener('error', () => markEmpty(media)));
    media.addEventListener('error', () => markEmpty(media));
    media.addEventListener('loadedmetadata', () => media.closest('[data-media]')?.classList.remove('is-empty'));
  });
  window.addEventListener('load', () => {
    medias.forEach(checkMedia);
    setTimeout(() => medias.forEach(checkMedia), 1500);
  });

  // 8c. Só um áudio/vídeo toca por vez + estado "tocando" para os efeitos visuais
  const isSilentLoop = m => m.loop && m.muted;       // a animação em loop não conta
  medias.forEach(media => {
    const scope = media.closest('[data-playing-scope]');
    media.addEventListener('play', () => {
      medias.forEach(other => { if (other !== media && !other.paused && !isSilentLoop(other)) other.pause(); });
      scope?.classList.add('is-playing');
    });
    ['pause', 'ended'].forEach(evt => media.addEventListener(evt, () => scope?.classList.remove('is-playing')));
  });

  // 8d. A animação (muda e em loop) toca só enquanto está visível
  const autoVideos = $$('video[data-autoplay]');
  if ('IntersectionObserver' in window && autoVideos.length) {
    const vio = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const v = entry.target;
        if (prefersReduced) return;
        if (entry.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
        else if (!v.paused && isSilentLoop(v)) v.pause();
      });
    }, { threshold: 0.4 });
    autoVideos.forEach(v => vio.observe(v));
  }

  // Pausa as animações SVG (transações na rede) se o usuário prefere menos movimento
  if (prefersReduced) {
    const svg = $('.chain');
    if (svg && typeof svg.pauseAnimations === 'function') svg.pauseAnimations();
  }


  /* 9. VISUALIZADOR DO INFOGRÁFICO --------------------------------------- */
  (function lightbox() {
    const dlg     = $('#lightbox');
    const body    = $('#lbBody');
    const zoomBtn = $('#lbZoom');
    const closeBtn = $('#lbClose');
    const openers = $$('[data-open-lightbox]');
    if (!dlg || !openers.length) return;

    function setZoom(on) {
      body.classList.toggle('is-zoomed', on);
      zoomBtn.textContent = on ? 'Ajustar à tela' : 'Aumentar zoom';
      if (!on) body.scrollTo(0, 0);
    }

    openers.forEach(btn => btn.addEventListener('click', () => {
      const img = $('img', btn);
      const big = $('#lbImg');
      if (img && big) { big.src = img.currentSrc || img.src; big.alt = img.alt || 'Infográfico ampliado'; }
      if (typeof dlg.showModal === 'function') {
        setZoom(false);
        dlg.showModal();
      } else if (img) {
        window.open(img.src, '_blank', 'noopener');   // navegadores sem <dialog>
      }
    }));

    zoomBtn.addEventListener('click', () => setZoom(!body.classList.contains('is-zoomed')));
    closeBtn.addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });   // clique fora fecha
  })();

})();
