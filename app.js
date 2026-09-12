/* NAMI — enhancement without dependencies. Native scrolling stays native. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width: 800px)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const root = document.documentElement;
  const header = $('.site-header');
  const progress = $('.reading-progress span');
  const hero = $('.hero-track');
  const heroTitle = $('.hero-composition h1');
  const heroObject = $('.hero-object');
  const manifesto = $('.manifesto');
  const scenes = $$('.manifesto-scene');
  const steps = $$('.process-step');
  const diagram = $('.process-diagram');
  const processLinks = $$('.process-nav a');
  let frame = 0;
  let activeStep = -1;
  let objectProgress = 0;
  let objectVisible = true;
  let cursorTarget = { x: 0, y: 0 };
  let cursorCurrent = { x: 0, y: 0 };
  let canvasDirty = true;
  let metrics = {};

  function setMotionMode() {
    root.classList.toggle('motion-ready', !reduced.matches);
    scenes.forEach(scene => {
      scene.style.opacity = '';
      scene.style.transform = '';
      scene.style.visibility = '';
      scene.removeAttribute('aria-hidden');
    });
    if (reduced.matches) {
      heroTitle.style.transform = '';
      heroObject.style.transform = '';
      cursorTarget = { x: 0, y: 0 };
    }
    canvasDirty = true;
    measure();
  }
  function measure() {
    const y = window.scrollY;
    metrics = {
      heroTop: hero.getBoundingClientRect().top + y,
      heroTravel: Math.max(1, hero.offsetHeight - window.innerHeight),
      storyTop: manifesto.getBoundingClientRect().top + y,
      storyTravel: Math.max(1, manifesto.offsetHeight - window.innerHeight),
      steps: steps.map(step => step.getBoundingClientRect().top + y),
      pageTravel: Math.max(1, root.scrollHeight - window.innerHeight)
    };
    queue();
  }
  function queue() { if (!frame) frame = requestAnimationFrame(update); }
  function updateStory(scrollY) {
    if (reduced.matches) return;
    const p = clamp((scrollY - metrics.storyTop) / metrics.storyTravel);
    const phase = Math.min(p * 3, 2.999);
    const index = Math.floor(phase);
    const blend = index < 2 ? clamp((phase - index - .76) / .24) : 0;
    const dominant = blend > .5 ? index + 1 : index;
    scenes.forEach((scene, i) => {
      let opacity = 0, translate = 44;
      if (i === index) { opacity = 1 - blend; translate = -blend * 44; }
      if (i === index + 1) { opacity = blend; translate = (1 - blend) * 44; }
      scene.style.opacity = opacity.toFixed(3);
      scene.style.visibility = opacity > .001 ? 'visible' : 'hidden';
      scene.style.transform = `translateY(${translate.toFixed(2)}px)`;
      scene.setAttribute('aria-hidden', String(i !== dominant));
    });
    $('.manifesto-counter').textContent = `0${dominant + 1} — 03`;
    $('.connection-line i').style.transform = `scaleX(${.04 + p * .96})`;
    $('.connection-line b').style.left = `${p * 100}%`;
  }
  function updateProcess(scrollY) {
    let next = 0;
    metrics.steps.forEach((top, index) => { if (scrollY + innerHeight * .52 >= top) next = index; });
    if (next === activeStep) return;
    activeStep = next;
    diagram.dataset.step = String(next);
    $('.diagram-count').textContent = `0${next + 1} / 04`;
    $('.diagram-progress i').style.width = `${(next + 1) * 25}%`;
    steps.forEach((step, i) => step.classList.toggle('is-active', i === next));
    processLinks.forEach((link, i) => {
      if (i === next) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  }
  function update() {
    frame = 0;
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 28 || document.body.classList.contains('menu-open'));
    progress.style.transform = `scaleX(${clamp(y / metrics.pageTravel)})`;
    if (!narrow.matches && !reduced.matches) {
      const p = clamp((y - metrics.heroTop) / metrics.heroTravel);
      heroTitle.style.transform = `translateY(${-p * 24}px) scale(${1 - p * .065})`;
      heroObject.style.transform = `translate(${-p * 12}%,${p * 8}%)`;
      if (Math.abs(p - objectProgress) > .001) { objectProgress = p; canvasDirty = true; }
    }
    updateStory(y);
    updateProcess(y);
    if (objectVisible) {
      const dx = cursorTarget.x - cursorCurrent.x;
      const dy = cursorTarget.y - cursorCurrent.y;
      if (Math.abs(dx) + Math.abs(dy) > .002) {
        cursorCurrent.x += dx * .1;
        cursorCurrent.y += dy * .1;
        canvasDirty = true;
        queue();
      }
      if (canvasDirty) { drawObject(); canvasDirty = false; }
    }
  }

  // One small 3D projection of the brand's +. No WebGL library or idle render loop.
  const canvas = $('#nami-object');
  const ctx = canvas.getContext('2d');
  let canvasWidth = 0, canvasHeight = 0;
  const profile = [[-.36,-1.25],[.36,-1.25],[.36,-.36],[1.25,-.36],[1.25,.36],[.36,.36],[.36,1.25],[-.36,1.25],[-.36,.36],[-1.25,.36],[-1.25,-.36],[-.36,-.36]];
  function sizeCanvas() {
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    canvasWidth = rect.width;
    canvasHeight = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, narrow.matches ? 1.25 : 1.75);
    canvas.width = Math.round(canvasWidth * dpr);
    canvas.height = Math.round(canvasHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvasDirty = true;
    queue();
  }
  function drawObject() {
    if (!ctx || !canvasWidth || !canvasHeight) return;
    const rx = -.33 + cursorCurrent.y * .14;
    const ry = -.6 + cursorCurrent.x * .22 + objectProgress * .35;
    const rz = -.26 + objectProgress * .25;
    const scale = Math.min(canvasWidth, canvasHeight) * .31;
    const project = (point, depth) => {
      let [x, y] = point, z = depth;
      [y,z] = [y * Math.cos(rx) - z * Math.sin(rx), y * Math.sin(rx) + z * Math.cos(rx)];
      [x,z] = [x * Math.cos(ry) + z * Math.sin(ry), -x * Math.sin(ry) + z * Math.cos(ry)];
      [x,y] = [x * Math.cos(rz) - y * Math.sin(rz), x * Math.sin(rz) + y * Math.cos(rz)];
      const perspective = 5.5 / (5.5 + z);
      return [canvasWidth / 2 + x * scale * perspective, canvasHeight / 2 + y * scale * perspective, z];
    };
    const front = profile.map(p => project(p, -.28));
    const back = profile.map(p => project(p, .28));
    const faces = [{ points: back, front: false, base: 40 }, { points: front, front: true, base: 165 }];
    profile.forEach((_, i) => {
      const j = (i + 1) % profile.length;
      faces.push({ points: [front[i], front[j], back[j], back[i]], front: false, base: i % 3 === 0 ? 135 : 38 + i * 4 });
    });
    faces.sort((a,b) => b.points.reduce((sum,p) => sum+p[2],0)/b.points.length - a.points.reduce((sum,p) => sum+p[2],0)/a.points.length);
    ctx.clearRect(0,0,canvasWidth,canvasHeight);
    for (const face of faces) {
      ctx.beginPath();
      face.points.forEach((p,i) => i ? ctx.lineTo(p[0],p[1]) : ctx.moveTo(p[0],p[1]));
      ctx.closePath();
      const gradient = ctx.createLinearGradient(canvasWidth * .16, 0, canvasWidth * .8, canvasHeight);
      if (face.front) {
        gradient.addColorStop(0,'#e9f8ff');gradient.addColorStop(.2,'#9daeb5');gradient.addColorStop(.4,'#222e35');gradient.addColorStop(.55,'#708995');gradient.addColorStop(.71,'#e6f2f5');gradient.addColorStop(.76,'#527a8d');gradient.addColorStop(1,'#00afff');
      } else {
        const c = face.base;
        gradient.addColorStop(0,`rgb(${c},${Math.min(255,c+18)},${Math.min(255,c+24)})`);
        gradient.addColorStop(.6,'#111b20');gradient.addColorStop(1,'#0086c3');
      }
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = face.front ? '#b4d7e699' : '#1c729488';
      ctx.lineWidth = .8;
      ctx.stroke();
    }
    if (objectProgress > .18) {
      ctx.globalAlpha = clamp((objectProgress-.18)*.7);
      ctx.strokeStyle = '#00afff';ctx.lineWidth=.75;
      profile.forEach((_,i)=>{ctx.beginPath();ctx.moveTo(front[i][0],front[i][1]);ctx.lineTo(back[i][0],back[i][1]);ctx.stroke();});
      ctx.globalAlpha=1;
    }
    heroObject.classList.add('is-rendered');
  }

  // Navigation: keyboard, focus containment, Escape, and touch.
  const menuButton = $('.menu-toggle');
  const menu = $('#mobile-menu');
  const menuLinks = $$('a', menu);
  function setMenu(open, restoreFocus = true) {
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('menu-open', open);
    $('main').inert = open;
    $('.footer').inert = open;
    if (open) menuLinks[0].focus();
    else if (restoreFocus) menuButton.focus();
    queue();
  }
  menuButton.addEventListener('click', () => setMenu(menu.hidden));
  menuLinks.forEach(link => link.addEventListener('click', () => {
    setMenu(false, false);
    const target = $(link.getAttribute('href'));
    if (target) { target.setAttribute('tabindex','-1'); target.focus({ preventScroll:true }); }
  }));
  document.addEventListener('keydown', event => {
    if (menu.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); setMenu(false); }
    if (event.key === 'Tab') {
      const list = [menuButton,...menuLinks];
      const index = list.indexOf(document.activeElement);
      event.preventDefault();
      list[(index + (event.shiftKey ? -1 : 1) + list.length) % list.length].focus();
    }
  });
  narrow.addEventListener('change', () => {
    if (!narrow.matches && !menu.hidden) setMenu(false, false);
    heroTitle.style.transform='';heroObject.style.transform='';
    measure();sizeCanvas();
  });

  // Content entries can be replaced with real cases. No client claims or fabricated results.
  const projects = [
    { name:'Project 01', category:'Diseño web / Desarrollo', description:'Una exploración de dirección de arte para una web con personalidad. Tipografía protagonista, una jerarquía clara y una composición que se adapta a distintas pantallas.', tags:['Dirección de arte','UI','Responsive'], image:'', technologies:[], url:'', year:'2026' },
    { name:'Project 02', category:'Herramientas a medida / UX', description:'Un concepto centrado en ordenar lo complejo. Partir de una necesidad, entender el proceso y darle una estructura que resulte simple para quien la usa.', tags:['Experiencia de usuario','Producto digital','Sistemas'], image:'', technologies:[], url:'', year:'2026' },
    { name:'Project 03', category:'Identidad visual / Diseño gráfico', description:'Un estudio tipográfico sobre consistencia visual. Un lenguaje reconocible que puede acompañar a una marca en distintas piezas, formatos y puntos de contacto.', tags:['Identidad visual','Tipografía','Sistema gráfico'], image:'', technologies:[], url:'', year:'2026' }
  ];
  const dialog = $('.project-dialog');
  let projectOpener = null;
  $$('.project-open').forEach(button => button.addEventListener('click', () => {
    const project = projects[Number(button.dataset.project)];
    if (!project) return;
    projectOpener = button;
    $('#dialog-title').textContent = project.name;
    $('.dialog-category').textContent = `${project.category} · ${project.year}`;
    $('.dialog-description').textContent = project.description;
    const tags = $('.dialog-tags');
    tags.replaceChildren(...project.tags.map(label => { const span = document.createElement('span');span.textContent=label;return span; }));
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  }));
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {document.body.style.overflow='';projectOpener?.focus({ preventScroll:true });});
  $('.text-link',dialog).addEventListener('click', () => {
    dialog.close();
    requestAnimationFrame(() => {$('#contacto').setAttribute('tabindex','-1');$('#contacto').focus({preventScroll:true});});
  });

  // Public contacts are edited in contact-config.js. Never infer country prefixes.
  const contacts = (window.NAMI_CONTACTS || []).filter(contact =>
    typeof contact.phoneDisplay === 'string' && contact.phoneDisplay.trim()
  );
  const isWhatsApp = contact => /^[1-9]\d{7,14}$/.test(contact.whatsappE164 || '');
  const whatsappURL = contact => `https://wa.me/${contact.whatsappE164}?text=${encodeURIComponent('Hola NAMI, me gustaría conversar sobre un proyecto.')}`;
  const floatLink = $('.whatsapp-float');
  const phoneContainer = $('.contact-phones');
  if (contacts.length) {
    const label = document.createElement('span');
    label.className = 'eyebrow';
    label.textContent = 'WHATSAPP';
    phoneContainer.replaceChildren(label);
    contacts.forEach(contact => {
      const row = document.createElement('div');
      row.className = 'phone-entry';
      if (contacts.length > 1) {
        const name = document.createElement('span');
        name.className = 'phone-name';
        name.textContent = contact.name;
        row.append(name);
      }
      if (isWhatsApp(contact)) {
        const link = document.createElement('a');
        link.href = whatsappURL(contact);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = `${contact.phoneDisplay} ↗`;
        link.setAttribute('aria-label', `Escribir por WhatsApp a ${contact.name}: ${contact.phoneDisplay}`);
        row.append(link);
      } else {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'copy-phone';
        button.textContent = contact.phoneDisplay;
        button.setAttribute('aria-label', `Copiar número de ${contact.name}: ${contact.phoneDisplay}`);
        const feedback = document.createElement('small');
        feedback.className = 'copy-feedback';
        feedback.setAttribute('role', 'status');
        feedback.textContent = 'Copiar número para usar en WhatsApp';
        button.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(contact.phoneDisplay);
            feedback.textContent = 'Número copiado ✓';
          } catch {
            feedback.textContent = `Podés seleccionar y copiar el número: ${contact.phoneDisplay}`;
          }
        });
        row.append(button, feedback);
      }
      phoneContainer.append(row);
    });
    if (isWhatsApp(contacts[0])) {
      floatLink.href = whatsappURL(contacts[0]);
      floatLink.target = '_blank';
      floatLink.rel = 'noopener noreferrer';
      floatLink.setAttribute('aria-label', 'Escribir a NAMI por WhatsApp');
    }
  }
  floatLink.addEventListener('click', () => {
    if (floatLink.hash !== '#contacto') return;
    const contact = $('#contacto');
    contact.setAttribute('tabindex', '-1');
    contact.focus({preventScroll: true});
  });
  // Avoid duplicating the contact action or covering the footer.
  if ('IntersectionObserver' in window) {
    const visibleContacts = new Set();
    const contactObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visibleContacts.add(entry.target);
        else visibleContacts.delete(entry.target);
      });
      floatLink.hidden = visibleContacts.size > 0;
    });
    contactObserver.observe($('#contacto'));
    contactObserver.observe($('.footer'));
  }

  // Reveal is optional; headings remain readable without JS or with reduced motion.
  if ('IntersectionObserver' in window) {
    if (!reduced.matches) root.classList.add('reveal-ready');
    const footerObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in-view');
          footerObserver.unobserve(entry.target);
        }
      });
    }, {threshold:.15});
    footerObserver.observe($('.footer'));

    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}
    }), {threshold:.08});
    $$('[data-reveal]').forEach(node => revealObserver.observe(node));
    new IntersectionObserver(entries => {
      objectVisible = entries[0].isIntersecting;
      if (objectVisible) { canvasDirty = true;queue(); }
    }, {rootMargin:'100px'}).observe(heroObject);
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {if(entry.isIntersecting) $$('.desktop-nav a').forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });});
    }, {rootMargin:'-20% 0px -60%'});
    ['servicios','soluciones','proyectos','nosotros','contacto','vision','proceso','inicio'].forEach(id => sectionObserver.observe(document.getElementById(id)));
  }

  // Keep the standard pointer; use a contextual companion only over project previews.
  const hint = $('.cursor-hint');
  document.addEventListener('pointermove', event => {
    if (!fine.matches || reduced.matches || narrow.matches) return;
    if (objectVisible) {
      cursorTarget.x = clamp(event.clientX / innerWidth,0,1)*2-1;
      cursorTarget.y = clamp(event.clientY / innerHeight,0,1)*2-1;
      queue();
    }
    const isProject = event.target instanceof Element && event.target.closest('.project-open');
    hint.style.opacity=isProject?'1':'0';
    hint.textContent='VER';
    hint.style.transform=`translate(${event.clientX + 15}px,${event.clientY + 15}px)`;
  }, {passive:true});
  document.addEventListener('pointerleave', () => {hint.style.opacity='0';cursorTarget={x:0,y:0};queue();});
  const magnetic = $('.magnetic');
  magnetic.addEventListener('pointermove', event => {
    if (!fine.matches || narrow.matches || reduced.matches) return;
    const rect=magnetic.getBoundingClientRect();
    magnetic.style.transform=`translate(${(event.clientX-rect.left-rect.width/2)*.035}px,${(event.clientY-rect.top-rect.height/2)*.055}px)`;
  });
  magnetic.addEventListener('pointerleave', () => {magnetic.style.transform='';});
  function updateClock() {
    try { $('.local-clock').textContent=`ARG / ${new Intl.DateTimeFormat('es-AR',{timeZone:'America/Argentina/Buenos_Aires',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date())}`; } catch { /* Static ARG / GMT−3 remains. */ }
  }
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',() => {measure();sizeCanvas();},{passive:true});
  window.addEventListener('load',measure,{once:true});
  document.fonts?.ready.then(measure);
  reduced.addEventListener('change',setMotionMode);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
  setMotionMode();sizeCanvas();updateClock();
  setInterval(updateClock,60000);
})();
