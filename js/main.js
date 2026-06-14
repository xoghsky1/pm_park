document.addEventListener('DOMContentLoaded', () => {

  // Career duration auto-calculation from 2020.01
  const CAREER_START = new Date(2020, 0); // 2020년 1월

  // 연차는 햇수(달력 기준)로 카운트: 입사 연도 = 1년차
  function calcCareerYears() {
    return new Date().getFullYear() - CAREER_START.getFullYear() + 1;
  }

  function calcCareerMonths() {
    const now = new Date();
    // 시작월과 현재월을 모두 포함해서 카운트 (+1)
    const total =
      (now.getFullYear() * 12 + now.getMonth()) -
      (CAREER_START.getFullYear() * 12 + CAREER_START.getMonth()) + 1;
    return { years: Math.floor(total / 12), months: total % 12 };
  }

  function formatCareerDuration() {
    const { years, months } = calcCareerMonths();
    return years > 0
      ? (months > 0 ? `${years}년 ${months}개월` : `${years}년`)
      : `${months}개월`;
  }

  const duration = formatCareerDuration();
  const periodEl = document.getElementById('careerPeriod');
  if (periodEl) periodEl.textContent = duration;


  // Keep the "N년차" in the meta description in sync with the same start date
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.content = metaDesc.content.replace(/\d+년차/, `${calcCareerYears()}년차`);
  }


  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  if (themeToggle) themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav__link');
  const nav = document.getElementById('nav');

  // Cache section offsets once; refresh on resize
  let sectionOffsets = [];
  function cacheSectionOffsets() {
    const navH = nav ? nav.offsetHeight : 72;
    sectionOffsets = Array.from(sections).map(s => ({
      id: s.getAttribute('id'),
      top: s.offsetTop - navH - 8,
    }));
  }
  cacheSectionOffsets();
  window.addEventListener('resize', cacheSectionOffsets, { passive: true });

  function updateActiveLink() {
    let current = '';
    for (const { id, top } of sectionOffsets) {
      if (window.scrollY >= top) current = id;
    }
    navLinks.forEach(link => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${current}`);
    });
  }

  // Scroll progress (scaleX avoids layout recalc on every frame)
  const scrollProgress = document.getElementById('scrollProgress');
  function updateScrollProgress() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.transform = `scaleX(${docHeight > 0 ? window.scrollY / docHeight : 0})`;
  }

  let rafPending = false;
  window.addEventListener('scroll', () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        updateActiveLink();
        updateScrollProgress();
        rafPending = false;
      });
    }
  }, { passive: true });


  // Modal
  const projectCards = document.querySelectorAll('[data-modal]');
  const modals = document.querySelectorAll('.modal');

  /* 메인 프로젝트 카드 노출 순서(01→02→03)와 동일: 리소스 → TMS → 성우 */
  // modal-1은 풀스크린 케이스 스터디(단독) — 시퀀스에서 분리
  const PROJECT_MAIN_IDS = ['modal-2', 'modal-3'];
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

  let lastFocused = null;

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    if (document.activeElement && !modal.contains(document.activeElement)) {
      lastFocused = document.activeElement;
    }
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    updateProjectModalNav(modal);
    // 키보드 사용자가 모달 안에서 시작하도록 포커스 이동
    requestAnimationFrame(() => modal.querySelector('.modal__close')?.focus());
  }

  function closeModal(modal, restoreFocus = true) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    // 모달을 연 요소로 포커스 복원 (모달 간 이동 시에는 건너뜀)
    if (restoreFocus && lastFocused) { lastFocused.focus(); lastFocused = null; }
  }

  function navigateProjectModal(fromModal, delta) {
    const seq = getProjectSequence(fromModal.id);
    if (!seq) return;
    const idx = seq.indexOf(fromModal.id) + delta;
    if (idx < 0 || idx >= seq.length) return;
    closeModal(fromModal, false);
    openModal(seq[idx]);
  }

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      openModal(card.getAttribute('data-modal'));
    });
    if (card.getAttribute('role') === 'button') {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(card.getAttribute('data-modal'));
        }
      });
    }
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
    const openProject = Array.from(modals).find(m => m.classList.contains('is-open'));
    if (!openProject || !getProjectSequence(openProject.id)) return;
    e.preventDefault();
    navigateProjectModal(openProject, e.key === 'ArrowLeft' ? -1 : 1);
  });

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

  // Skill gauge tooltips
  document.querySelectorAll('.skill-tag[data-level]').forEach(tag => {
    const level = tag.dataset.level;
    const fill = tag.dataset.fill || '100';
    const tooltip = document.createElement('div');
    tooltip.className = 'skill-tooltip';
    tooltip.innerHTML = `
      <div class="skill-tooltip__label">
        <span>${tag.textContent.trim()}</span>
        <span class="skill-tooltip__pct">${level}</span>
      </div>
      <div class="skill-tooltip__track"><div class="skill-tooltip__bar"></div></div>
    `;
    tag.appendChild(tooltip);
    const bar = tooltip.querySelector('.skill-tooltip__bar');
    tag.addEventListener('mouseenter', () => { bar.style.width = fill + '%'; });
    tag.addEventListener('mouseleave', () => { bar.style.width = '0%'; });
  });



  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });


});
