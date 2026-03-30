document.addEventListener('DOMContentLoaded', () => {

  const nav = document.getElementById('nav');
  const sections = document.querySelectorAll('.section, .hero');
  const navLinks = document.querySelectorAll('.nav__link');

  function updateNavScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > 10);
  }

  function updateActiveLink() {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${current}`);
    });
  }

  window.addEventListener('scroll', () => {
    updateNavScroll();
    updateActiveLink();
  }, { passive: true });

  // Mobile menu
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('is-active');
    navMenu.classList.toggle('is-open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('is-active');
      navMenu.classList.remove('is-open');
    });
  });

  // Modal
  const projectCards = document.querySelectorAll('[data-modal]');
  const modals = document.querySelectorAll('.modal');

  const PROJECT_MAIN_IDS = ['modal-1', 'modal-2', 'modal-3'];
  const PROJECT_SIDE_IDS = ['modal-side-1', 'modal-side-2'];

  function getProjectSequence(modalId) {
    if (PROJECT_MAIN_IDS.includes(modalId)) return PROJECT_MAIN_IDS;
    if (PROJECT_SIDE_IDS.includes(modalId)) return PROJECT_SIDE_IDS;
    return null;
  }

  function updateProjectModalNav(modalEl) {
    if (!modalEl) return;
    const seq = getProjectSequence(modalEl.id);
    const prevBtn = modalEl.querySelector('.modal__edge-nav--prev');
    const nextBtn = modalEl.querySelector('.modal__edge-nav--next');
    if (!seq || !prevBtn || !nextBtn) return;
    const idx = seq.indexOf(modalEl.id);
    prevBtn.disabled = idx <= 0;
    nextBtn.disabled = idx >= seq.length - 1;
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    updateProjectModalNav(modal);
  }

  function closeModal(modal) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  function navigateProjectModal(fromModal, delta) {
    const seq = getProjectSequence(fromModal.id);
    if (!seq) return;
    const idx = seq.indexOf(fromModal.id) + delta;
    if (idx < 0 || idx >= seq.length) return;
    closeModal(fromModal);
    openModal(seq[idx]);
  }

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      openModal(card.getAttribute('data-modal'));
    });
  });

  modals.forEach(modal => {
    modal.querySelector('.modal__overlay').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.modal__close').addEventListener('click', () => closeModal(modal));

    const prevNav = modal.querySelector('.modal__edge-nav--prev');
    const nextNav = modal.querySelector('.modal__edge-nav--next');
    if (prevNav) {
      prevNav.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateProjectModal(modal, -1);
      });
    }
    if (nextNav) {
      nextNav.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateProjectModal(modal, 1);
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modals.forEach(m => {
        if (m.classList.contains('is-open')) closeModal(m);
      });
    }

    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const compOpen = document.getElementById('compModal')?.classList.contains('is-open');
    if (compOpen) return;
    const openProject = Array.from(modals).find(m => m.classList.contains('is-open'));
    if (!openProject || !getProjectSequence(openProject.id)) return;
    e.preventDefault();
    navigateProjectModal(openProject, e.key === 'ArrowLeft' ? -1 : 1);
  });

  // Competency Modal
  const compModal = document.getElementById('compModal');
  if (compModal) {
    const compCards = document.querySelectorAll('[data-comp-modal]');
    const compData = [];
    compCards.forEach(card => {
      const img = card.querySelector('.comp-card__img');
      compData.push({
        img: img ? img.src : '',
        alt: img ? img.alt : '',
        num: card.querySelector('.comp-card__num')?.textContent || '',
        title: card.querySelector('.comp-card__title')?.textContent || '',
        desc: card.querySelector('.comp-card__desc')?.textContent || ''
      });
    });

    let compIdx = 0;
    const compImg = compModal.querySelector('.comp-modal__img');
    const compNum = compModal.querySelector('.comp-modal__num');
    const compTitle = compModal.querySelector('.comp-modal__title');
    const compDesc = compModal.querySelector('.comp-modal__desc');
    const compCounter = compModal.querySelector('.comp-modal__counter');
    const prevBtn = compModal.querySelector('.comp-modal__nav--prev');
    const nextBtn = compModal.querySelector('.comp-modal__nav--next');

    function renderComp(idx) {
      compIdx = idx;
      const d = compData[idx];
      compImg.src = d.img;
      compImg.alt = d.alt;
      compNum.textContent = d.num;
      compTitle.textContent = d.title;
      compDesc.textContent = d.desc;
      compCounter.textContent = `${idx + 1} / ${compData.length}`;
      prevBtn.disabled = idx === 0;
      nextBtn.disabled = idx === compData.length - 1;
      compModal.classList.toggle('comp-modal--no-image', !d.img);
    }

    function openCompModal(idx) {
      renderComp(idx);
      compModal.classList.add('is-open');
      compModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    }

    function closeCompModal() {
      compModal.classList.remove('is-open');
      compModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    }

    compCards.forEach(card => {
      card.addEventListener('click', () => {
        openCompModal(Number(card.getAttribute('data-comp-modal')));
      });
    });

    prevBtn.addEventListener('click', () => { if (compIdx > 0) renderComp(compIdx - 1); });
    nextBtn.addEventListener('click', () => { if (compIdx < compData.length - 1) renderComp(compIdx + 1); });
    compModal.querySelector('.comp-modal__overlay').addEventListener('click', closeCompModal);
    compModal.querySelector('.comp-modal__close').addEventListener('click', closeCompModal);

    document.addEventListener('keydown', (e) => {
      if (!compModal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeCompModal();
      if (e.key === 'ArrowLeft' && compIdx > 0) renderComp(compIdx - 1);
      if (e.key === 'ArrowRight' && compIdx < compData.length - 1) renderComp(compIdx + 1);
    });
  }

  // Scroll fade-up
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Hero scroll indicator
  const heroScroll = document.getElementById('heroScroll');
  if (heroScroll) {
    heroScroll.addEventListener('click', () => {
      const about = document.getElementById('about');
      if (about) about.scrollIntoView({ behavior: 'smooth' });
    });
  }

});
