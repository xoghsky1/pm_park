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

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeModal(modal) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      openModal(card.getAttribute('data-modal'));
    });
  });

  modals.forEach(modal => {
    modal.querySelector('.modal__overlay').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.modal__close').addEventListener('click', () => closeModal(modal));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modals.forEach(modal => {
        if (modal.classList.contains('is-open')) closeModal(modal);
      });
    }
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
