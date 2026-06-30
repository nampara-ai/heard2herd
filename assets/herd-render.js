/* herd-render.js — local-first renderer for Heard2Herd.

   Reads window.HERD, window.PEOPLE, and window.EVENTS, then paints every part of
   each page that depends on structured content.

   It runs synchronously at the end of <body>, BEFORE the Alpine/Swiper CDN
   scripts, so the primary content is in the DOM even when those CDNs are blocked
   or slow. Pure DOM, no framework — this is what keeps the new pages from ever
   going blank. (Interactions like the lightbox are layered on by Alpine.) */
(function () {
  'use strict';
  var HERD = window.HERD || [];
  var PEOPLE = window.PEOPLE || [];
  var EVENTS = window.EVENTS || [];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function byId(id) { return document.getElementById(id); }
  function profileHref(slug) { return 'horse.html?h=' + encodeURIComponent(slug); }
  function personHref(slug) { return 'person.html?p=' + encodeURIComponent(slug); }
  function eventHref(slug) { return 'event.html?e=' + encodeURIComponent(slug); }
  var MAIN_NAV = [
    { label: 'About', href: 'about.html' },
    { label: 'Horses', href: 'herd.html' },
    { label: 'Events', href: 'events.html' },
    { label: 'Artists', href: 'people.html' },
    { label: 'Contact', href: 'mailto:' }
  ];

  function getParam(name) {
    var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }
  function findHorse(slug) {
    for (var i = 0; i < HERD.length; i++) { if (HERD[i].slug === slug) return HERD[i]; }
    return null;
  }
  function findPerson(slug) {
    for (var i = 0; i < PEOPLE.length; i++) { if (PEOPLE[i].slug === slug) return PEOPLE[i]; }
    return null;
  }
  function findEvent(slug) {
    for (var i = 0; i < EVENTS.length; i++) { if (EVENTS[i].slug === slug) return EVENTS[i]; }
    return null;
  }

  // ---- Header desktop nav (present on every page) ----
  var navList = byId('header-nav-list');
  if (navList) {
    navList.innerHTML = MAIN_NAV.map(function (item) {
      return '<li><a href="' + esc(item.href) + '">' + esc(item.label) + '</a></li>';
    }).join('');
  }

  // ---- Mobile-drawer nav ----
  var mobileList = byId('mobile-nav-list');
  if (mobileList) {
    mobileList.innerHTML = MAIN_NAV.map(function (item) {
      return '<a class="mobile-nav-link" href="' + esc(item.href) + '">' + esc(item.label) + '</a>';
    }).join('');
  }

  // ---- Footer "The Herd" column ----
  var footerList = byId('footer-herd-list');
  if (footerList) {
    footerList.innerHTML = HERD.map(function (h) {
      return '<li><a href="' + profileHref(h.slug) + '">' + esc(h.barnName) + '</a></li>';
    }).join('');
  }

  // ---- Footer "The Circle" column ----
  var footerPeople = byId('footer-people-list');
  if (footerPeople) {
    footerPeople.innerHTML = PEOPLE.map(function (p) {
      return '<li><a href="' + personHref(p.slug) + '">' + esc(p.footerName || p.displayName) + '</a></li>';
    }).join('');
  }

  // ---- Directory card (shared) ----
  function cardHTML(h) {
    var media = h.portrait
      ? '<div class="product-card-image"><img src="' + esc(h.portrait) + '" alt="' +
        esc(h.barnName) + ' — Gypsy Vanner at Noble Farm" loading="lazy" decoding="async"></div>'
      : '<div class="product-card-image card-placeholder"><span>' + esc(h.barnName) + '</span></div>';
    return '<a href="' + profileHref(h.slug) + '" class="product-card">' +
      media +
      '<div class="product-card-label">' + esc(h.barnName) + '</div>' +
      '<span class="btn-ghost btn-ghost--dark">EXPLORE</span></a>';
  }

  function personCardHTML(p) {
    var media = p.portrait
      ? '<div class="product-card-image"><img src="' + esc(p.portrait) + '" alt="' +
        esc(p.displayName) + ' - ' + esc(p.role) + '" loading="lazy" decoding="async"></div>'
      : '<div class="product-card-image"><img src="media/avatar placeholder.jpg" alt="' +
        esc(p.displayName) + ' - ' + esc(p.role) + '" loading="lazy" decoding="async"></div>';
    return '<a href="' + personHref(p.slug) + '" class="product-card person-directory-card">' +
      media +
      '<div class="product-card-label">' + esc(p.displayName) + '</div>' +
      '<div class="collection-card-discipline">' + esc(p.role) + '</div>' +
      '<span class="btn-ghost btn-ghost--dark">EXPLORE</span></a>';
  }

  // ---- Herd directory grid (herd.html) ----
  var grid = byId('herd-grid');
  if (grid) {
    grid.innerHTML = HERD.map(cardHTML).join('');
  }

  var peopleGrid = byId('people-grid');
  if (peopleGrid) {
    peopleGrid.innerHTML = PEOPLE.map(personCardHTML).join('');
  }

  // ---- Homepage people carousel cards ----
  var circle = byId('circle-slides');
  if (circle) {
    var featuredPeople = PEOPLE.filter(function (p) { return p.featured; });
    circle.innerHTML = featuredPeople.map(function (p) {
      var media = p.portrait
        ? '<img src="' + esc(p.portrait) + '" alt="' + esc(p.displayName) + ' - ' + esc(p.role) + '" loading="lazy" decoding="async">'
        : '<img src="media/avatar placeholder.jpg" alt="' + esc(p.displayName) + ' - ' + esc(p.role) + '" loading="lazy" decoding="async">';
      return '<div class="swiper-slide"><a href="' + personHref(p.slug) + '" class="collection-card">' +
        '<div class="collection-card-image">' + media + '</div>' +
        '<div class="collection-card-label">' + esc(p.displayName) + '</div>' +
        '<div class="collection-card-discipline">' + esc(p.role) + '</div>' +
        '</a></div>';
    }).join('');
  }

  // ---- Profile page (horse.html) ----
  if (byId('profile-grid')) {
    renderProfile();
  }

  if (byId('person-profile-grid')) {
    renderPersonProfile();
  }

  var eventGrid = byId('events-grid');
  if (eventGrid) {
    renderEventsDirectory(eventGrid);
  }

  if (byId('event-detail')) {
    renderEventDetail();
  }

  function renderProfile() {
    var slug = (getParam('h') || '').toLowerCase().trim();
    var horse = slug ? findHorse(slug) : null;
    var grid = byId('profile-grid');
    var notFound = byId('profile-notfound');

    if (!horse) {
      if (grid) grid.setAttribute('hidden', '');
      if (notFound) notFound.removeAttribute('hidden');
      document.title = 'Horse not found | Heard2Herd';
      return;
    }

    document.title = horse.barnName + ' | Heard2Herd';

    var nameEl = byId('barn-name');
    if (nameEl) nameEl.textContent = horse.barnName;

    var registeredEl = byId('registered-name');
    if (registeredEl) registeredEl.textContent = horse.registeredName || 'Registered Name Pending';

    var metaEl = byId('horse-meta');
    if (metaEl) {
      var birthYear = horse.birthYear || '2018';
      var sex = horse.sex || 'Gelding';
      metaEl.textContent = birthYear + ' ' + sex;
    }

    var bioEl = byId('bio');
    if (bioEl) {
      var paras = Array.isArray(horse.bio) ? horse.bio : (horse.bio ? [horse.bio] : []);
      bioEl.innerHTML = paras.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    }

    var ped = byId('pedigree-btn');
    if (ped) {
      if (horse.hasPedigree && horse.pedigree) {
        ped.setAttribute('href', horse.pedigree);
        ped.removeAttribute('hidden');
      } else {
        ped.setAttribute('hidden', '');
      }
    }

    // Gallery
    var gallery = Array.isArray(horse.gallery) ? horse.gallery : [];
    window.__lightboxGallery = gallery;
    var slidesEl = byId('gallery-slides');
    var media = byId('gallery-media');

    if (gallery.length && slidesEl) {
      slidesEl.innerHTML = gallery.map(function (src, i) {
        return '<div class="swiper-slide" data-index="' + i + '">' +
          '<img src="' + esc(src) + '" alt="' + esc(horse.barnName) + ' — photo ' + (i + 1) +
          '" loading="' + (i === 0 ? 'eager' : 'lazy') + '" decoding="async"></div>';
      }).join('');
      // Delegate clicks so Swiper's loop clones also open the lightbox.
      slidesEl.addEventListener('click', function (e) {
        var slide = e.target.closest ? e.target.closest('.swiper-slide') : null;
        if (!slide) return;
        var idx = parseInt(slide.getAttribute('data-index'), 10) || 0;
        window.dispatchEvent(new CustomEvent('lightbox:open', { detail: { index: idx } }));
      });
    } else if (media) {
      // Empty gallery -> on-brand placeholder block, no Swiper, no lightbox.
      media.innerHTML = '<div class="product-card-image card-placeholder profile-placeholder"><span>' +
        esc(horse.barnName) + '</span></div>';
    }
  }

  function renderPersonProfile() {
    var slug = (getParam('p') || '').toLowerCase().trim();
    var person = slug ? findPerson(slug) : null;
    var grid = byId('person-profile-grid');
    var notFound = byId('person-notfound');

    if (!person) {
      if (grid) grid.setAttribute('hidden', '');
      if (notFound) notFound.removeAttribute('hidden');
      document.title = 'Profile not found | Heard2Herd';
      return;
    }

    document.title = person.displayName + ' | Heard2Herd';

    var eyebrow = byId('person-eyebrow');
    if (eyebrow) eyebrow.textContent = person.eyebrow || 'The Circle';

    var nameEl = byId('person-name');
    if (nameEl) nameEl.textContent = person.displayName;

    var roleEl = byId('person-role');
    if (roleEl) {
      if (person.role) roleEl.textContent = person.role;
      else roleEl.setAttribute('hidden', '');
    }

    var bioEl = byId('person-bio');
    if (bioEl) {
      var paras = Array.isArray(person.bio) ? person.bio : (person.bio ? [person.bio] : []);
      bioEl.innerHTML = paras.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    }

    var linkEl = byId('person-links');
    if (linkEl) {
      var links = Array.isArray(person.links) ? person.links.slice() : [];
      if (person.website) links.unshift({ label: 'Website', url: person.website });
      if (person.instagram) links.push({ label: 'Instagram', url: person.instagram });
      var seenUrls = {};
      linkEl.innerHTML = links.filter(function (l) {
        if (!l || !l.url || seenUrls[l.url]) return false;
        seenUrls[l.url] = true;
        return true;
      }).map(function (l) {
        return '<a class="btn-ghost btn-ghost--dark person-link" href="' + esc(l.url) +
          '" target="_blank" rel="noopener noreferrer">' + esc(l.label || 'Visit') + '</a>';
      }).join('');
      if (!linkEl.innerHTML) linkEl.setAttribute('hidden', '');
    }

    var sectionsEl = byId('person-sections');
    if (sectionsEl) {
      var sections = Array.isArray(person.sections) ? person.sections : [];
      sectionsEl.innerHTML = sections.map(function (section) {
        return '<article class="person-section">' +
          '<p class="profile-eyebrow">Portfolio</p>' +
          '<h2>' + esc(section.title || '') + '</h2>' +
          '<p>' + esc(section.body || '') + '</p>' +
          '</article>';
      }).join('');
      if (!sectionsEl.innerHTML) sectionsEl.setAttribute('hidden', '');
    }

    var gallery = Array.isArray(person.gallery) ? person.gallery : [];
    window.__lightboxGallery = gallery;
    var slidesEl = byId('gallery-slides');
    var media = byId('gallery-media');

    if (gallery.length && slidesEl) {
      slidesEl.innerHTML = gallery.map(function (src, i) {
        return '<div class="swiper-slide" data-index="' + i + '">' +
          '<img src="' + esc(src) + '" alt="' + esc(person.displayName) + ' portfolio image ' + (i + 1) +
          '" loading="' + (i === 0 ? 'eager' : 'lazy') + '" decoding="async"></div>';
      }).join('');
      slidesEl.addEventListener('click', function (e) {
        var slide = e.target.closest ? e.target.closest('.swiper-slide') : null;
        if (!slide) return;
        var idx = parseInt(slide.getAttribute('data-index'), 10) || 0;
        window.dispatchEvent(new CustomEvent('lightbox:open', { detail: { index: idx } }));
      });
    } else if (media) {
      media.innerHTML = '<div class="product-card-image card-placeholder profile-placeholder person-placeholder"><span>' +
        esc(person.displayName) + '</span></div>';
    }
  }

  function eventCardHTML(event, index) {
    var media = event.portrait
      ? '<img src="' + esc(event.portrait) + '" alt="' + esc(event.title) + '" loading="lazy" decoding="async">'
      : '<div class="event-card-placeholder"><span>' + esc(event.title) + '</span></div>';
    return '<a href="' + eventHref(event.slug) + '" class="event-card' + (index === 0 ? ' event-card--feature' : '') + '">' +
      '<div class="event-card-media">' + media + '</div>' +
      '<div class="event-card-copy">' +
      '<p class="profile-eyebrow">' + esc(event.status || 'Event') + '</p>' +
      '<h2>' + esc(event.title) + '</h2>' +
      '<p class="event-card-date">' + esc(event.dateLabel || event.location || '') + '</p>' +
      '<p>' + esc(event.summary || '') + '</p>' +
      '<span class="btn-ghost btn-ghost--dark">VIEW EVENT</span>' +
      '</div></a>';
  }

  function renderEventsDirectory(container) {
    container.innerHTML = EVENTS.map(eventCardHTML).join('');
  }

  function renderEventDetail() {
    var slug = (getParam('e') || '').toLowerCase().trim();
    var event = slug ? findEvent(slug) : null;
    var detail = byId('event-detail');
    var notFound = byId('event-notfound');

    if (!event) {
      if (detail) detail.setAttribute('hidden', '');
      if (notFound) notFound.removeAttribute('hidden');
      document.title = 'Event not found | Heard2Herd';
      return;
    }

    document.title = event.title + ' | Heard2Herd';

    var title = byId('event-title');
    if (title) title.textContent = event.title;
    var status = byId('event-status');
    if (status) status.textContent = event.status || 'Event';
    var meta = byId('event-meta');
    if (meta) {
      var metaParts = [event.dateLabel, event.location].filter(Boolean);
      meta.textContent = metaParts.filter(function (part, i) {
        return metaParts.indexOf(part) === i && !(i > 0 && metaParts[0].indexOf(part) !== -1);
      }).join(' · ');
    }
    var summary = byId('event-summary');
    if (summary) summary.textContent = event.summary || '';

    var body = byId('event-body');
    if (body) {
      var paras = Array.isArray(event.body) ? event.body : (event.body ? [event.body] : []);
      body.innerHTML = paras.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    }

    var details = byId('event-details');
    if (details) {
      var rows = Array.isArray(event.details) ? event.details : [];
      details.innerHTML = rows.map(function (row) {
        return '<div class="event-detail-row"><span>' + esc(row.label || '') + '</span><strong>' + esc(row.value || '') + '</strong></div>';
      }).join('');
      if (!details.innerHTML) details.setAttribute('hidden', '');
    }

    var cta = byId('event-cta');
    if (cta) {
      if (event.ctaLabel && event.ctaUrl) {
        cta.textContent = event.ctaLabel;
        cta.setAttribute('href', event.ctaUrl);
        cta.removeAttribute('hidden');
      } else {
        cta.setAttribute('hidden', '');
      }
    }

    var gallery = Array.isArray(event.gallery) ? event.gallery : [];
    window.__lightboxGallery = gallery;
    var hero = byId('event-hero-media');
    if (hero) {
      if (event.portrait) {
        hero.innerHTML = '<img src="' + esc(event.portrait) + '" alt="' + esc(event.title) + '" loading="eager" decoding="async">';
      } else {
        hero.innerHTML = '<div class="event-card-placeholder"><span>' + esc(event.title) + '</span></div>';
      }
    }

    var grid = byId('event-gallery-grid');
    if (grid) {
      grid.innerHTML = gallery.map(function (src, i) {
        return '<button class="event-gallery-item" data-index="' + i + '">' +
          '<img src="' + esc(src) + '" alt="' + esc(event.title) + ' image ' + (i + 1) + '" loading="lazy" decoding="async">' +
          '</button>';
      }).join('');
      grid.addEventListener('click', function (e) {
        var item = e.target.closest ? e.target.closest('.event-gallery-item') : null;
        if (!item) return;
        var idx = parseInt(item.getAttribute('data-index'), 10) || 0;
        window.dispatchEvent(new CustomEvent('lightbox:open', { detail: { index: idx } }));
      });
      if (!grid.innerHTML) grid.setAttribute('hidden', '');
    }
  }
})();
