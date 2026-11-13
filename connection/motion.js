/* ============================================================
   Motion layer: smooth scroll (Lenis) + GSAP ScrollTrigger.
   Runs only when GSAP loaded and the visitor has not asked for
   reduced motion. Without it the page is fully static and usable.
   ============================================================ */
(() => {
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const done = () => root.classList.remove("motion-pending");
  if (reduced || !window.gsap || !window.ScrollTrigger) { done(); return; }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add("motion");
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const desktop = matchMedia("(min-width: 1001px)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    // in-page links go through Lenis so they glide too
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id.length > 1 && $(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: id === "#top" ? 0 : -60, duration: 1.6 });
    }));
  }

  /* ---------- split headings into masked words ---------- */
  function split(el) {
    const wrap = (node) => {
      const w = document.createElement("span"); w.className = "split-w";
      const i = document.createElement("span"); i.className = "split-i";
      i.appendChild(node); w.appendChild(i); return w;
    };
    [...el.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          frag.appendChild(/^\s+$/.test(part) ? document.createTextNode(part) : wrap(document.createTextNode(part)));
        });
        el.replaceChild(frag, n);
      } else if (n.nodeType === 1 && n.tagName !== "BR") {
        if (n.classList.contains("dot")) {
          // keep the dot glued to the word before it so it never wraps alone
          const prev = n.previousSibling;
          if (prev && prev.nodeType === 1 && prev.classList.contains("split-w")) { prev.firstChild.appendChild(n); return; }
          el.replaceChild(wrap(n.cloneNode(true)), n); return;
        }
        if (n.children.length || n.tagName === "SPAN" || n.tagName === "EM") { split(n); }
      }
    });
  }
  $$("[data-split]").forEach((el) => {
    split(el);
    gsap.from($$(".split-i", el), {
      yPercent: 110, rotate: 4, duration: 1.1, ease: "expo.out", stagger: 0.06,
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  /* ---------- intro loader -> hero ---------- */
  const count = $("#loaderCount");
  const counter = { v: 0 };
  const intro = gsap.timeline({ defaults: { ease: "expo.inOut" } });
  intro
    .to(counter, { v: 100, duration: 0.9, ease: "power2.inOut", onUpdate: () => { count.textContent = String(Math.round(counter.v)).padStart(3, "0"); } })
    .to(".loader-inner", { yPercent: -40, opacity: 0, duration: 0.6, ease: "power3.in" }, "+=0.1")
    .to(".loader-panel", { scaleY: 0, duration: 1 }, "-=0.25")
    .add(() => { done(); $("#loader").style.display = "none"; })
    .fromTo("#heroFrame", { scale: 1.15 }, { scale: 1, duration: 1.8, ease: "expo.out" }, "-=0.9")
    .fromTo(".hero-title .line > span", { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.09 }, "-=1.5")
    .fromTo([".hero-tag", ".hero-foot", ".hero-meta"], { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.08 }, "-=1.0");

  /* ---------- hero: frame shrinks into a card, text drifts up ---------- */
  gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } })
    .to("#heroFrame", { scale: 0.88, borderRadius: 24, ease: "none" }, 0)
    .to("#heroInner", { yPercent: -18, opacity: 0.2, ease: "none" }, 0);

  /* ---------- progress bar ---------- */
  gsap.to("#progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

  /* ---------- marquee reacts to scroll speed and direction ---------- */
  const track = $("#marquee");
  if (track) {
    track.style.animation = "none";
    let x = 0, dir = -1, boost = 0;
    gsap.ticker.add(() => {
      const half = track.scrollWidth / 2 || 1;
      x += (0.6 + boost) * dir;
      if (x <= -half) x += half; if (x > 0) x -= half;
      track.style.transform = `translate3d(${x}px,0,0) skewX(${dir * -Math.min(boost, 8)}deg)`;
      boost *= 0.92;
    });
    ScrollTrigger.create({ onUpdate: (s) => { dir = s.direction === 1 ? -1 : 1; boost = Math.min(Math.abs(s.getVelocity()) / 220, 14); } });
  }

  /* ---------- Make Sense: giant outline word slides across ---------- */
  gsap.fromTo("#msGiant", { xPercent: 0 }, { xPercent: -45, ease: "none",
    scrollTrigger: { trigger: "#makesense", start: "top bottom", end: "bottom top", scrub: true } });

  /* ---------- parallax images ---------- */
  $$("[data-parallax]").forEach((img) => {
    const amt = +img.dataset.parallax;
    gsap.fromTo(img, { yPercent: -amt / 2, scale: 1.12 }, { yPercent: amt / 2, scale: 1.12, ease: "none",
      scrollTrigger: { trigger: img.closest("section, figure") || img, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ---------- clip reveals for figures ---------- */
  $$("[data-clip]").forEach((fig, i) => {
    gsap.fromTo(fig, { clipPath: "inset(18% 12% 18% 12% round 6px)" }, {
      clipPath: "inset(0% 0% 0% 0% round 6px)", duration: 1.4, ease: "expo.out", delay: (i % 3) * 0.08,
      scrollTrigger: { trigger: fig, start: "top 88%" } });
    const img = $("img:not([data-parallax])", fig);
    if (img) gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: fig, start: "top 88%" } });
  });

  /* ---------- booth: window opens to full bleed ---------- */
  gsap.timeline({ scrollTrigger: { trigger: "#booth", start: "top bottom", end: "center center", scrub: true } })
    .fromTo("#boothClip", { clipPath: "inset(14% 10% 14% 10% round 24px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" }, 0)
    .fromTo("#boothImg", { scale: 1.35 }, { scale: 1.05, ease: "none" }, 0);

  /* ---------- gallery: pinned horizontal scroll on desktop ---------- */
  if (desktop) {
    root.classList.add("is-pinned-gallery");
    const film = $("#film");
    const dist = () => Math.max(0, film.scrollWidth - innerWidth);
    gsap.to(film, { x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: "#gallery", pin: "#galleryPin", start: "top top", end: () => "+=" + dist(), scrub: 0.6, invalidateOnRefresh: true } });
    $$(".film img").forEach((img) => gsap.fromTo(img, { scale: 1.18 }, { scale: 1, ease: "none",
      scrollTrigger: { trigger: "#gallery", start: "top top", end: () => "+=" + dist(), scrub: true } }));
  }

  /* ---------- Connection: background loop plays only on screen ---------- */
  const cv = $("#connVideo");
  if (cv) ScrollTrigger.create({ trigger: "#connection", start: "top bottom", end: "bottom top",
    onToggle: (s) => {
      if (s.isActive) { if (!cv.src) cv.src = cv.dataset.src; cv.play().catch(() => {}); } else cv.pause();
    } });

  /* ---------- ambient colour: the room's light shifts per brand ----------
     Ember through Make Sense, violet through Connection, gold through
     Euforia, then back to the ember house style. Each change is scrubbed
     across a section boundary so there is never a hard switch. Created
     after the gallery pin so the positions include its spacing. */
  const palette = {
    ember:  { "--accent": "#ff6a2b", "--accent-2": "#ffb36b", "--glow": "rgba(255, 106, 43, .07)",  "--bg": "#0b0907" },
    violet: { "--accent": "#b06bff", "--accent-2": "#e2c6ff", "--glow": "rgba(150, 90, 255, .085)", "--bg": "#0d0710" },
    gold:   { "--accent": "#e9b45c", "--accent-2": "#f6d49a", "--glow": "rgba(233, 180, 92, .075)", "--bg": "#0d0a06" },
  };
  const ambient = document.createElement("div");
  ambient.className = "ambient"; ambient.setAttribute("aria-hidden", "true");
  document.body.appendChild(ambient);
  [
    ["#connection", "top 70%", "top 20%", palette.ember, palette.violet],
    ["#euforia", "top 70%", "top 30%", palette.violet, palette.gold],
    ["#moments", "top 65%", "top 15%", palette.gold, palette.ember],
  ].forEach(([trigger, start, end, from, to]) => {
    if (!$(trigger)) return;
    gsap.fromTo(root, { ...from }, { ...to, ease: "none", immediateRender: false,
      scrollTrigger: { trigger, start, end, scrub: 0.8 } });
  });

  /* ---------- reels rise in with a slight tilt ---------- */
  ScrollTrigger.batch(".reel", { start: "top 90%", once: true,
    onEnter: (els) => gsap.from(els, { y: 120, rotate: (i) => (i % 2 ? 3 : -3), opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.08 }) });

  /* ---------- portraits stagger + artist names light up as you scroll ---------- */
  gsap.from(".portraits img", { y: 80, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.07,
    scrollTrigger: { trigger: ".portraits", start: "top 85%" } });
  const names = $$("#artistWall li");
  ScrollTrigger.create({ trigger: "#artistWall", start: "top 75%", end: "bottom 45%", scrub: true,
    onUpdate: (s) => { const n = Math.round(s.progress * names.length); names.forEach((li, i) => li.classList.toggle("lit", i < n)); } });

  /* ---------- stats pop ---------- */
  gsap.from(".stat-n", { yPercent: 60, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.1,
    scrollTrigger: { trigger: ".stats", start: "top 85%" } });

  /* ---------- footer giant word ---------- */
  gsap.fromTo(".footer-giant span", { yPercent: 60 }, { yPercent: 0, ease: "none",
    scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: true } });

  /* ---------- custom cursor + magnetic buttons (mouse only) ---------- */
  if (finePointer) {
    root.classList.add("has-cursor");
    const cur = $("#cursor"), label = $("#cursorLabel");
    const xTo = gsap.quickTo(cur, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(cur, "y", { duration: 0.35, ease: "power3" });
    addEventListener("pointermove", (e) => { xTo(e.clientX); yTo(e.clientY); });
    const setState = (cls, text = "") => { cur.className = "cursor" + (cls ? " " + cls : ""); label.textContent = text; };
    document.addEventListener("pointerover", (e) => {
      const t = e.target;
      if (t.closest(".reel")) setState("is-label", t.closest(".reel").classList.contains("unmuted") ? "Mute" : "Sound");
      else if (t.closest(".film") && desktop) setState("is-label", "Scroll");
      else if (t.closest("a, button, input, select, textarea, label")) setState("is-link");
      else setState("");
    });
    document.addEventListener("click", (e) => { const r = e.target.closest(".reel"); if (r) label.textContent = r.classList.contains("unmuted") ? "Mute" : "Sound"; });

    $$(".magnetic").forEach((btn) => {
      const bx = gsap.quickTo(btn, "x", { duration: 0.5, ease: "elastic.out(1, 0.4)" });
      const by = gsap.quickTo(btn, "y", { duration: 0.5, ease: "elastic.out(1, 0.4)" });
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        bx((e.clientX - r.left - r.width / 2) * 0.3); by((e.clientY - r.top - r.height / 2) * 0.4);
      });
      btn.addEventListener("pointerleave", () => { bx(0); by(0); });
    });
  }

  // images that load late change layout: refresh trigger positions once everything is in
  addEventListener("load", () => ScrollTrigger.refresh());
})();
