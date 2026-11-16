/* ============================================================
   Signature moments
   1. A wash of colour sweeps the screen when you cross into a new brand.
   2. Lineup names with footage show it next to the cursor (tap on phones).
   3. Optional soundtrack, off until the visitor turns it on.
   4. Booking: the send button turns the form into an entry pass.
   ============================================================ */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger) && !reduced;

  /* ---------- 1. colour wipes between worlds ---------- */
  if (hasGsap) {
    const { gsap } = window;
    [["#connection", "95, 216, 184"], ["#euforia", "233, 180, 92"]].forEach(([sel, rgb]) => {
      const sec = $(sel); if (!sec) return;
      const w = document.createElement("div");
      w.className = "wipe"; w.setAttribute("aria-hidden", "true");
      w.style.setProperty("--wipe", rgb);
      document.body.appendChild(w);
      gsap.fromTo(w, { yPercent: 110 }, { yPercent: -110, ease: "none",
        scrollTrigger: { trigger: sec, start: "top 105%", end: "top 15%", scrub: true,
          onToggle: (s) => w.classList.toggle("on", s.isActive) } });
    });
  }

  /* ---------- 2. live lineup ---------- */
  const MEDIA = {
    "adam ten": "adam-ten", "darco": "darco-yamagucci", "yamagucci": "darco-yamagucci",
    "broken hill": "ko-broken-hill", "k.o": "ko-broken-hill", "itayga": "itayga-dor-danino",
    "dor danino": "itayga-dor-danino", "bonafique": "bonafique-jenia-tarsol",
    "jenia tarsol": "bonafique-jenia-tarsol", "sean doron": "sean-doron",
  };
  const keyOf = (t) => t.toLowerCase().replace(/\s*\(.*?\)\s*/g, "").trim();
  const card = document.createElement("div");
  card.className = "peek"; card.setAttribute("aria-hidden", "true");
  card.innerHTML = '<video muted loop playsinline preload="none"></video><span></span>';
  document.body.appendChild(card);
  const cv = $("video", card), cl = $("span", card);
  let current = "";
  const show = (li, x, y) => {
    const file = li.dataset.media;
    if (current !== file) {
      current = file;
      cv.poster = `media/reels/${file}.jpg`; cv.src = `media/reels/${file}.mp4`;
      if (!reduced) cv.play().catch(() => {});
    }
    cl.textContent = li.textContent.replace(/\s*\/\s*$/, "");
    card.classList.add("on");
    if (x != null) move(x, y);
  };
  const hide = () => { card.classList.remove("on"); cv.pause(); };
  let tx = 0, ty = 0;
  const move = (x, y) => { tx = x; ty = y; card.style.transform = `translate3d(${x + 24}px, ${y - 140}px, 0) rotate(-3deg)`; };

  const tag = () => $$("#msLineup li, #connLineup li, #artistWall li").forEach((li) => {
    const k = keyOf(li.textContent);
    const hit = MEDIA[k] || MEDIA[k.split(" b2b ")[0]];
    if (!hit || li.dataset.media) return;
    li.dataset.media = hit; li.classList.add("has-media"); li.tabIndex = 0;
    if (fine) {
      li.addEventListener("pointerenter", (e) => show(li, e.clientX, e.clientY));
      li.addEventListener("pointermove", (e) => move(e.clientX, e.clientY));
      li.addEventListener("pointerleave", hide);
    } else {
      li.addEventListener("click", (e) => {
        e.stopPropagation();
        if (card.classList.contains("on") && current === li.dataset.media) { hide(); return; }
        show(li); card.classList.add("docked");
      });
    }
    if (fine) {
      // keyboard users get the same preview, docked
      li.addEventListener("focus", () => { if (li.matches(":focus-visible")) { show(li); card.classList.add("docked"); } });
      li.addEventListener("blur", () => { card.classList.remove("docked"); hide(); });
    }
  });
  tag();
  document.addEventListener("click", () => { if (!fine) hide(); });
  addEventListener("scroll", () => { if (!fine && card.classList.contains("on")) hide(); }, { passive: true });

  /* ---------- 3. soundtrack toggle ---------- */
  const audio = new Audio("media/soundtrack.m4a");
  audio.loop = true; audio.preload = "none"; audio.volume = 0;
  const btn = document.createElement("button");
  btn.className = "sound"; btn.type = "button";
  btn.setAttribute("aria-pressed", "false");
  btn.innerHTML = '<i aria-hidden="true"><b></b><b></b><b></b><b></b></i><span>Sound off</span>';
  document.body.appendChild(btn);
  let on = false, fadeId = 0;
  const fadeTo = (v, done) => {
    const id = ++fadeId, start = audio.volume, t0 = performance.now(), dur = 900;
    const step = (t) => { if (id !== fadeId) return; const p = Math.min(1, (t - t0) / dur);
      audio.volume = start + (v - start) * p; if (p < 1) requestAnimationFrame(step); else done && done(); };
    requestAnimationFrame(step);
  };
  const setOn = (v) => {
    on = v; btn.classList.toggle("on", v); btn.setAttribute("aria-pressed", String(v));
    $("span", btn).textContent = v ? "Sound on" : "Sound off";
    if (v) { audio.play().then(() => fadeTo(0.45)).catch(() => setOn(false)); }
    else fadeTo(0, () => audio.pause());
  };
  btn.addEventListener("click", () => setOn(!on));
  // a clip with its own sound takes over; the soundtrack steps aside
  document.addEventListener("click", (e) => { if (on && e.target.closest(".reel")) setOn(false); });

  /* ---------- 4. booking pass ---------- */
  window.showPass = (d) => {
    const form = $("#bookingForm"); if (!form) return;
    const pass = document.createElement("div");
    pass.className = "pass"; pass.setAttribute("role", "status");
    const no = String(Date.now()).slice(-6);
    pass.innerHTML = `
      <div class="pass-top"><span class="wordmark">Make Sense<b class="dot">.</b></span><span>Artist pass &nbsp;/&nbsp; 2027</span></div>
      <p class="pass-name"></p>
      <div class="pass-grid"><div><small>Status</small>On its way</div><div><small>Reply to</small><em></em></div><div><small>No.</small>MS-${no}</div></div>
      <div class="pass-cut" aria-hidden="true"></div>
      <p class="pass-foot">Your email app is opening with the details. We read every message.</p>`;
    $(".pass-name", pass).textContent = d.name;
    $("em", pass).textContent = d.email;
    form.replaceWith(pass);
    if (window.gsap && !reduced) window.gsap.from(pass, { rotateX: -70, y: 40, opacity: 0, duration: 1.1, ease: "expo.out", transformPerspective: 900, transformOrigin: "50% 0%" });
  };

  /* ---------- extra: booking heading types itself ---------- */
  if (hasGsap) {
    const h = $("#contact .h-xxl"); if (h) {
      // break each word into letters, then reveal them one by one behind a caret
      $$(".split-i", h).forEach((w) => {
        const walk = (node) => [...node.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            const f = document.createDocumentFragment();
            [...n.textContent].forEach((c) => { const s = document.createElement("span"); s.className = "ch"; s.textContent = c; f.appendChild(s); });
            n.replaceWith(f);
          } else if (n.nodeType === 1 && !n.classList.contains("dot")) walk(n);
        });
        walk(w);
      });
      const chars = $$(".ch, .dot", h);
      const caret = document.createElement("i"); caret.className = "caret"; caret.setAttribute("aria-hidden", "true");
      h.appendChild(caret);
      window.gsap.set(chars, { opacity: 0 });
      window.ScrollTrigger.create({ trigger: h, start: "top 80%", once: true, onEnter: () => {
        window.gsap.to(chars, { opacity: 1, duration: 0.01, ease: "none",
          stagger: { each: 0.07, onStart() { this.targets()[0].after(caret); } },
          onComplete: () => window.gsap.to(caret, { opacity: 0, delay: 1.2, duration: 0.4 }) });
      } });
    }
  }
})();
