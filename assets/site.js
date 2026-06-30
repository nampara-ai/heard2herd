/* site.js — shared Alpine component for Heard2Herd (homepage, herd, profile).
   Registered on alpine:init so it is available before Alpine boots.

   Page CONTENT (nav, footer, herd grid, profile) is rendered by herd-render.js,
   NOT here. This component only powers INTERACTIONS: mobile drawer, search
   overlay, scroll-aware header, footer accordion, scroll-reveal, and the
   profile photo lightbox. Anything tied to a horse list lives in window.HERD. */
document.addEventListener('alpine:init', () => {
  Alpine.data('site', () => ({
    loaded: false,
    scrolled: false,
    searchOpen: false,
    mobileNavOpen: false,
    mobileAccordion: null,
    footerAccordion: null,

    // Lightbox — used on horse.html; inert on pages without lightbox markup.
    lightboxOpen: false,
    lightboxIndex: 0,
    lightboxGallery: [],

    init() {
      window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
      setTimeout(() => { this.loaded = true; }, 800);

      // The profile gallery + its open events are supplied by herd-render.js.
      this.lightboxGallery = window.__lightboxGallery || [];
      window.addEventListener('lightbox:open', (e) => {
        this.openLightbox((e.detail && e.detail.index) || 0);
      });

      this.$nextTick(() => {
        this.initHeroSwiper();
        this.initCollectionsSwiper();
        this.hideFooterDesktopToggles();
      });
    },

    handleScroll() {
      this.scrolled = window.scrollY > 100;
    },

    openSearch() {
      this.searchOpen = true;
      this.$nextTick(() => {
        if (this.$refs.searchInput) this.$refs.searchInput.focus();
      });
    },
    closeSearch() {
      this.searchOpen = false;
    },

    toggleMobileNav() {
      this.mobileNavOpen = !this.mobileNavOpen;
    },
    closeMobileNav() {
      this.mobileNavOpen = false;
      this.mobileAccordion = null;
    },

    // --- Lightbox ---
    openLightbox(i) {
      if (!this.lightboxGallery.length) return;
      this.lightboxIndex = i;
      this.lightboxOpen = true;
    },
    closeLightbox() {
      this.lightboxOpen = false;
    },
    lightboxNext() {
      if (!this.lightboxGallery.length) return;
      this.lightboxIndex = (this.lightboxIndex + 1) % this.lightboxGallery.length;
    },
    lightboxPrev() {
      if (!this.lightboxGallery.length) return;
      this.lightboxIndex =
        (this.lightboxIndex - 1 + this.lightboxGallery.length) % this.lightboxGallery.length;
    },

    initHeroSwiper() {
      if (!document.querySelector('.hero-swiper')) return;
      if (typeof Swiper === 'undefined') {
        setTimeout(() => this.initHeroSwiper(), 100);
        return;
      }
      new Swiper('.hero-swiper', {
        effect: 'fade',
        fadeEffect: { crossFade: true },
        autoplay: { delay: 8000, disableOnInteraction: false },
        loop: true,
        speed: 1000,
        pagination: { el: '.hero-dots', clickable: true },
        navigation: { nextEl: '.hero-next', prevEl: '.hero-prev' },
        keyboard: { enabled: true },
      });
    },

    initCollectionsSwiper() {
      if (!document.querySelector('.collections-swiper')) return;
      if (typeof Swiper === 'undefined') {
        setTimeout(() => this.initCollectionsSwiper(), 100);
        return;
      }
      new Swiper('.collections-swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        navigation: { nextEl: '.collections-next', prevEl: '.collections-prev' },
        pagination: { el: '.collections-pagination', clickable: true },
        breakpoints: {
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        },
      });
    },

    hideFooterDesktopToggles() {
      const style = document.createElement('style');
      style.textContent = '@media (min-width: 769px) { .footer-toggle { display: none !important; } .footer-column ul { display: block !important; } .footer-desktop-heading { display: block !important; } } @media (max-width: 768px) { .footer-desktop-heading { display: none !important; } }';
      document.head.appendChild(style);
    },
  }));
});
